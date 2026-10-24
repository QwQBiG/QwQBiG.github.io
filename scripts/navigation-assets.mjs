import { createHash } from 'node:crypto';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const origin = 'https://navigation.invalid';

function localAsset(value, type, route) {
  if (!value) return null;
  try {
    const url = new URL(value, new URL(route, origin));
    const extensions = { style: /\.css$/i, script: /\.m?js$/i, image: /\.(?:avif|webp|png|jpe?g|gif|svg)$/i, font: /\.woff2?$/i };
    if (url.origin !== origin || url.username || url.password || !extensions[type].test(url.pathname)) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

function candidates(html, route) {
  const result = [];
  const seen = new Set();
  function add(value, type) {
    const url = localAsset(value, type, route);
    if (url && !seen.has(url)) {
      seen.add(url);
      result.push({ url, type });
    }
  }
  function visit(node) {
    const attrs = Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
    if (node.tagName === 'link') {
      const rel = (attrs.rel ?? '').toLowerCase().split(/\s+/);
      if (rel.includes('stylesheet') && !('disabled' in attrs) && (!attrs.media || attrs.media === 'all' || attrs.media === 'screen')) add(attrs.href, 'style');
      if (rel.includes('preload') && attrs.fetchpriority !== 'low' && (attrs.as === 'image' || attrs.as === 'font')) add(attrs.href, attrs.as);
      if (rel.includes('modulepreload')) add(attrs.href, 'script');
    }
    if (node.tagName === 'script' && attrs.src && (attrs.type === 'module' || 'defer' in attrs)) add(attrs.src, 'script');
    if (node.tagName === 'astro-island' && (attrs.client === 'load' || attrs.client === 'idle')) {
      add(attrs['component-url'], 'script');
      add(attrs['renderer-url'], 'script');
    }
    for (const child of node.childNodes ?? []) visit(child);
  }
  visit(parse(html));
  const order = { style: 0, image: 1, font: 2, script: 3 };
  return result.sort((a, b) => order[a.type] - order[b.type]);
}

// Keep only resources the destination already declares as immediately useful.
// Fetching these files never executes its scripts or follows a module import graph.
export async function buildNavigationManifest(pages, assetSize) {
  const assets = [];
  const assetIndexes = new Map();
  const routes = Object.create(null);
  for (const { route, html } of pages) {
    const selected = [];
    for (const candidate of candidates(html, route)) {
      const size = await assetSize(candidate.url);
      if (!Number.isSafeInteger(size) || size <= 0) continue;
      let index = assetIndexes.get(candidate.url);
      if (index === undefined) {
        index = assets.length;
        assetIndexes.set(candidate.url, index);
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
  const files = await listPages(root);
  const pages = await Promise.all(files.map(async (file) => {
    const urlPath = file.split(path.sep).map(encodeURIComponent).join('/');
    const route = '/' + urlPath.replace(/(?:^|\/)index\.html$/, (value) => value.startsWith('/') ? '/' : '');
    return { file, route, html: await readFile(path.join(root, file), 'utf8') };
  }));
  const sizes = new Map();
  const manifest = await buildNavigationManifest(pages, async (url) => {
    if (!sizes.has(url)) {
      let size = 0;
      try {
        const pathname = decodeURIComponent(new URL(url, origin).pathname);
        const resolved = path.resolve(root, '.' + pathname);
        if (resolved.startsWith(path.resolve(root) + path.sep)) {
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
  for (const { file, html } of pages) {
    const clean = html.replace(/<link\b[^>]*\bdata-navigation-assets(?:="[^"]*")?[^>]*>/g, '');
    await writeFile(path.join(root, file), clean.replace('</head>', `<link rel="navigation-assets" href="${href}" data-navigation-assets></head>`));
  }
  return { href, pages: pages.length, assets: manifest.assets.length, bytes: Buffer.byteLength(json) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await generateNavigationManifest(path.resolve(process.argv[2] ?? 'dist'));
  console.log(`Navigation warmup: ${result.pages} pages, ${result.assets} shared assets, ${(result.bytes / 1024).toFixed(1)} KiB manifest`);
}
