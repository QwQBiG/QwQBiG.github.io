import { access, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { init, parse } from 'es-module-lexer';
import { parse as parseHTML } from 'parse5';

const origin = 'https://iqwqi.win';
const manifest = 'comment-assets.json';
const assetName = /^_astro\/[\w.-]+\.[\w-]+\.(?:js|css)$/;
const entryName = /^WalineComments\.[\w.-]+\.js$/;

// Discover the graph before adding older files to dist. Vite writes the
// stylesheet URL as a string and the lazy client as a literal dynamic import.
async function currentGraph(root) {
  await init;
  let entry;
  // A rendered article identifies its own generation even when its artifact
  // also contains previous generations' hashed entry points.
  const articles = path.join(root, 'cs', 'posts');
  for (const page of await readdir(articles, { recursive: true })) {
    if (path.basename(page) !== 'index.html') continue;
    const html = await readFile(path.join(articles, page), 'utf8');
    if (!html.includes('id="waline"')) continue;
    const nodes = [parseHTML(html)];
    while (nodes.length) {
      const node = nodes.pop();
      if (node.tagName === 'script') {
        const attrs = Object.fromEntries(node.attrs.map(({ name, value }) => [name, value]));
        const file = attrs.src?.slice(1);
        if (attrs.type === 'module' && attrs.src?.startsWith('/_astro/') &&
            assetName.test(file) && entryName.test(path.basename(file))) {
          entry = file;
          break;
        }
      }
      nodes.push(...node.childNodes ?? []);
    }
    if (entry) break;
  }
  if (!entry) throw new Error('Could not find the Waline entry in a built article');
  const files = new Set([entry]);
  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const source = await readFile(path.join(root, file), 'utf8');
    const [imports] = parse(source);
    const styles = Array.from(source.matchAll(/["'](\/_astro\/[\w.-]+\.css)["']/g), match => match[1]);
    for (const specifier of [...imports.map(item => item.n), ...styles]) {
      if (!specifier || !/^(?:\.{1,2}\/|\/_astro\/)/.test(specifier)) continue;
      const asset = new URL(specifier, origin + '/' + file).pathname.slice(1);
      if (assetName.test(asset)) files.add(asset);
    }
  }
  return [...files].sort();
}

async function loadManifest(read) {
  const source = await read(manifest);
  if (!source) return null;
  const graphs = JSON.parse(source.toString());
  if (!Array.isArray(graphs) || graphs.length > 3 || graphs.some(graph =>
    !Array.isArray(graph) || graph.length === 0 || graph.length > 64 ||
    !graph.every(file => typeof file === 'string' && assetName.test(file)) ||
    !graph.some(file => entryName.test(path.basename(file))),
  )) throw new Error('Invalid previous comment asset manifest');
  return graphs;
}

function diskReader(root) {
  return async file => {
    try { return await readFile(path.join(root, file)); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  };
}

// GitHub expires its Pages artifact after one day by default. The live release
// also serves its bounded manifest, so even an infrequent deploy can retain it.
async function readPublished(file) {
  let response;
  try {
    response = await fetch(new URL(file, origin), { redirect: 'error', cache: 'no-cache', signal: AbortSignal.timeout(15000) });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.warn(`Previous comment release unavailable for ${file}: ${error.message}`);
    return null;
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function retainCommentAssets(root, previousRoots, readLive = readPublished) {
  const graphs = [await currentGraph(root)];
  const copied = new Set();
  async function retain(graph, read, optional = false) {
    if (graphs.some(known => known.length === graph.length && known.every((file, i) => file === graph[i]))) return;
    for (const file of graph) {
      const target = path.join(root, file);
      try { await access(target); continue; }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      const source = await read(file);
      if (!source) {
        if (optional) return;
        throw new Error(`Missing published comment asset: ${file}`);
      }
      await writeFile(target, source, { flag: 'wx' });
      copied.add(file);
    }
    graphs.push(graph);
  }

  for (const previous of previousRoots) {
    const read = diskReader(previous);
    // Unmodified pre-migration artifacts have only their own build's files.
    const known = await loadManifest(read) ?? [await currentGraph(previous)];
    for (const graph of known) {
      await retain(graph, read);
      if (graphs.length === 3) break;
    }
    if (graphs.length === 3) break;
  }
  if (!previousRoots.length) {
    const known = await loadManifest(readLive);
    for (const graph of known ?? []) {
      await retain(graph, readLive, true);
      if (graphs.length === 3) break;
    }
  }
  // Rebuilding identical assets must not evict either preceding generation.
  await writeFile(path.join(root, manifest), JSON.stringify(graphs));
  return [...copied];
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const copied = await retainCommentAssets(path.resolve(process.argv[2]), process.argv.slice(3));
  console.log(`Retained ${copied.length} previously published comment assets`);
}
