import { createHash } from 'node:crypto';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';
import { init, parse as parseModule } from 'es-module-lexer';

const origin = 'https://navigation.invalid';

function localAsset(value, type, route) {
  if (!value) return null;
  try {
    const url = new URL(value, new URL(route, origin));
    const extensions = { style: /\.css$/i, script: /\.m?js$/i, image: /\.(?:avif|webp|png|jpe?g|gif|svg)$/i, font: /\.woff2?$/i, json: /\.json$/i };
    if (url.origin !== origin || url.username || url.password || !extensions[type].test(url.pathname)) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

// Only compiled, same-origin modules have a known build-time dependency graph.
function compiledModule(value, from) {
  const url = localAsset(value, 'script', from);
  return url?.startsWith('/_astro/') ? url : null;
}

function staticImports(source, from) {
  const [imports] = parseModule(source);
  return imports.filter(item => item.d === -1 && /^(?:\.{1,2}\/|\/)/.test(item.n))
    .map(item => compiledModule(item.n, from)).filter(Boolean);
}

function candidates(html, route) {
  const entries = new Set();
  const deferredDiscovery = new Set();
  const alreadyLinked = new Set();
  const result = [];
  const seen = new Set();
  function add(value, type, extra = {}) {
    const url = localAsset(value, type, route);
    const asset = { url, type, ...extra };
    const key = JSON.stringify(asset);
    if (url && !seen.has(key)) {
      seen.add(key);
      result.push(asset);
    }
  }
  function visit(node) {
    const attrs = Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
    if (node.tagName === 'link') {
      const rel = (attrs.rel ?? '').toLowerCase().split(/\s+/);
      const allScreens = !attrs.media || attrs.media === 'all' || attrs.media === 'screen';
      if (rel.includes('stylesheet') && !('disabled' in attrs) && allScreens) add(attrs.href, 'style');
      if (rel.includes('preload') && allScreens && attrs.fetchpriority !== 'low' && (attrs.as === 'image' || attrs.as === 'font')) {
        if (attrs.as === 'image' && attrs.imagesrcset) {
          // Keep the same width candidates as the destination, including on retina displays.
          const sources = attrs.imagesrcset.split(',').map(candidate => {
            const match = /^(\S+)\s+([1-9]\d*)w$/.exec(candidate.trim());
            const url = match && localAsset(match[1], 'image', route);
            return url && { url, width: Number(match[2]) };
          });
          if (sources.every(Boolean)) {
            const variant = { sources, sizes: attrs.imagesizes || '100vw' };
            if (attrs.type) variant.mimeType = attrs.type;
            add(attrs.href || sources.at(-1).url, 'image', variant);
          }
        } else {
          add(attrs.href, attrs.as);
        }
      }
      // Only include JSON explicitly preloaded with the same credentials as a normal same-origin fetch.
      if (rel.includes('preload') && allScreens && attrs.fetchpriority !== 'low' &&
        attrs.as === 'fetch' && attrs.type === 'application/json' && ['', 'anonymous'].includes(attrs.crossorigin)) {
        add(attrs.href, 'json');
      }
      if (rel.includes('modulepreload')) {
        if (allScreens) alreadyLinked.add(compiledModule(attrs.href, route));
        add(attrs.href, 'script');
      }
    }
    if (node.tagName === 'script' && attrs.src && (attrs.type === 'module' || 'defer' in attrs)) add(attrs.src, 'script');
    if (node.tagName === 'script' && attrs.type === 'module') {
      if (attrs.src) {
        const entry = compiledModule(attrs.src, route);
        if (entry) entries.add(entry);
      } else {
        for (const url of staticImports(node.childNodes.map(child => child.value).join(''), route)) deferredDiscovery.add(url);
      }
    }
    if (node.tagName === 'astro-island' && (attrs.client === 'load' || attrs.client === 'idle')) {
      add(attrs['component-url'], 'script');
      add(attrs['renderer-url'], 'script');
      if (attrs.client === 'load') {
        for (const value of [attrs['component-url'], attrs['renderer-url']]) {
          const entry = compiledModule(value, route);
          if (entry) deferredDiscovery.add(entry);
        }
      }
    }
    for (const child of node.childNodes ?? []) visit(child);
  }
  visit(parse(html));
  const order = { style: 0, image: 1, font: 2, script: 3, json: 4 };
  const assets = result.sort((a, b) => order[a.type] - order[b.type]);
  return { assets, entries, deferredDiscovery, alreadyLinked };
}

// Keep only resources the destination already declares as immediately useful.
// The build resolves static imports. Runtime warming only fetches the manifest's listed files.
export async function buildNavigationManifest(pages, assetSize) {
  const assets = [];
  const assetIndexes = new Map();
  const routes = Object.create(null);
  await init;
  for (const { route, html, pageAssets } of pages) {
    const selected = [];
    for (const candidate of pageAssets ?? candidates(html, route).assets) {
      const size = await assetSize(candidate.url);
      if (!Number.isSafeInteger(size) || size <= 0) continue;
      const key = JSON.stringify(candidate);
      let index = assetIndexes.get(key);
      if (index === undefined) {
        index = assets.length;
        assetIndexes.set(key, index);
        assets.push({ ...candidate, bytes: size });
      }
      selected.push(index);
    }
    routes[route] = selected;
  }
  return { version: 1, assets, routes };
}

async function listPages(root, relative = '') {
  const result = [];
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    const name = path.join(relative, entry.name);
    if (entry.isDirectory()) result.push(...await listPages(root, name));
    else if (entry.isFile() && entry.name.endsWith('.html')) result.push(name);
  }
  return result.sort();
}

export async function generateNavigationManifest(root) {
  await init;
  const files = await listPages(root);
  function diskPath(url) {
    try {
      const file = path.resolve(root, '.' + decodeURIComponent(new URL(url, origin).pathname));
      return file.startsWith(path.resolve(root) + path.sep) ? file : null;
    } catch {
      return null;
    }
  }

  const imports = new Map();
  function dependencies(url) {
    if (!imports.has(url)) {
      const file = diskPath(url);
      if (!file?.startsWith(path.resolve(root, '_astro') + path.sep)) return null;
      imports.set(url, readFile(file, 'utf8').then(text => staticImports(text, url), () => null));
    }
    return imports.get(url);
  }
  const pages = await Promise.all(files.map(async (file) => {
    const urlPath = file.split(path.sep).map(encodeURIComponent).join('/');
    const route = '/' + urlPath.replace(/(?:^|\/)index\.html$/, (value) => value.startsWith('/') ? '/' : '');
    const source = await readFile(path.join(root, file), 'utf8');
    const html = source.replace(/<link\b[^>]*\bdata-navigation-(?:module|assets)(?:="[^"]*")?[^>]*>/g, '');
    const { assets, entries, deferredDiscovery, alreadyLinked } = candidates(html, route);
    const reachable = new Set([...entries, ...deferredDiscovery]);
    const hints = [];
    for (const url of reachable) {
      const children = await dependencies(url);
      if (!children) continue;
      children.forEach(child => reachable.add(child));
      if (entries.has(url) || alreadyLinked.has(url)) continue;
      hints.push(url);
      if (!assets.some(asset => asset.url === url && asset.type === 'script')) assets.push({ url, type: 'script' });
    }
    return { file, route, html, hints, pageAssets: assets };
  }));
  const sizes = new Map();
  const manifest = await buildNavigationManifest(pages, async (url) => {
    if (!sizes.has(url)) {
      let size = 0;
      try {
        const resolved = diskPath(url);
        if (resolved) {
          const info = await stat(resolved);
          if (info.isFile()) size = info.size;
        }
      } catch {}
      sizes.set(url, size);
    }
    return sizes.get(url);
  });
  const json = JSON.stringify(manifest);
  const hash = createHash('sha256').update(json).digest('hex').slice(0, 12);
  const href = `/navigation-assets.${hash}.json`;
  await writeFile(path.join(root, href.slice(1)), json);
  for (const { file, html, hints } of pages) {
    // Styles and primary images retain their place before the script hints.
    const links = hints.map(url => `<link rel="modulepreload" href="${url.replaceAll('&', '&amp;')}" media="(scripting: enabled)" fetchpriority="low" data-navigation-module>`).join('');
    await writeFile(path.join(root, file), html.replace('</head>', `${links}<link rel="navigation-assets" href="${href}" data-navigation-assets></head>`));
  }
  return { href, pages: pages.length, assets: manifest.assets.length, bytes: Buffer.byteLength(json) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await generateNavigationManifest(path.resolve(process.argv[2] ?? 'dist'));
  console.log(`Navigation warmup: ${result.pages} pages, ${result.assets} shared assets, ${(result.bytes / 1024).toFixed(1)} KiB manifest`);
}
