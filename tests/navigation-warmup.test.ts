import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
import { buildNavigationManifest, generateNavigationManifest } from '../scripts/navigation-assets.mjs';
import { createBackgroundTaskScheduler } from '../src/utils/background-tasks.ts';
import { allowNavigationAssets, fetchNavigationAsset, navigationDestination, readNavigationManifest, selectNavigationAssets } from '../src/utils/navigation-warmup.ts';
import type { NavigationManifest } from '../src/utils/navigation-warmup.ts';

const current = 'https://example.test/';

async function setupRuntime(readyState = 'complete', route = '/') {
  const documentHandlers = new Map<string, Array<(event: unknown) => void>>();
  const windowHandlers = new Map<string, Array<(event: unknown) => void>>();
  const record = (map: typeof documentHandlers, name: string, handler: (event: unknown) => void) => {
    const handlers = map.get(name) ?? [];
    handlers.push(handler);
    map.set(name, handlers);
  };
  class Link {
    target = '';
    dataset = {};
    isConnected = true;
    href: string;
    constructor(href: string) { this.href = href; }
    closest() { return this; }
    contains(node: unknown) { return node === this; }
    hasAttribute() { return false; }
  }
  const links = ['/about/', '/cs/', '/gallery/', '/cs/'].map(route => new Link(new URL(route, current).href));
  const hint = new Link(current + 'navigation-assets.test.json');
  const article = { next: links[1], styles: [] as Link[] };
  const navigator = { onLine: true, connection: { effectiveType: '2g', saveData: false } };
  class Observer {
    target?: Link;
    callback: (entries: { isIntersecting: boolean }[], observer: Observer) => void;
    options: { rootMargin: string };
    constructor(callback: Observer['callback'], options: Observer['options']) {
      this.callback = callback;
      this.options = options;
    }
    observe(target: Link) { this.target = target; observers.push(this); }
    disconnect() { this.target = undefined; }
    near(intersects = true) { this.callback([{ isIntersecting: intersects }], this); }
  }
  const observers: Observer[] = [];
  const manifest: NavigationManifest = {
    version: 1,
    assets: [
      { url: '/shared.css', type: 'style', bytes: 1000 },
      { url: '/cs.js', type: 'script', bytes: 1000 },
      { url: '/gallery.webp', type: 'image', bytes: 1000 },
      { url: '/about.js', type: 'script', bytes: 1000 },
    ],
    routes: { '/cs/': [0, 1], '/gallery/': [0, 2], '/about/': [0, 3] },
  };
  const requests: string[] = [];
  const html: string[] = [];
  const scheduler = createBackgroundTaskScheduler({ idle(callback) {
    let canceled = false;
    queueMicrotask(() => { if (!canceled) callback(); });
    return () => { canceled = true; };
  } });
  scheduler.setReady(true);
  const request = async (input: unknown) => {
    const url = String(input);
    requests.push(url);
    if (url === hint.href) return new Response(JSON.stringify(manifest), { headers: { 'content-type': 'application/json' } });
    return new Response('resource', { headers: { 'content-type': url.endsWith('.css') ? 'text/css' : url.endsWith('.webp') ? 'image/webp' : 'text/javascript' } });
  };
  const document = {
    readyState, hidden: false,
    querySelector: (selector: string) => selector.includes('rel~="next"') ? article.next : hint,
    querySelectorAll: (selector: string) => selector.startsWith('#navCard') ? links : article.styles,
    getElementById: () => null,
    addEventListener: (name: string, handler: (event: unknown) => void) => record(documentHandlers, name, handler),
  };
  const source = stripTypeScriptTypes(await readFile(new URL('../src/scripts/navigation-warmup-runtime.ts', import.meta.url), 'utf8'))
    .replace(/import[\s\S]*?from ['"][^'"]+['"];\n/g, '')
    .replace('export function initializeNavigationWarmup', 'function initializeNavigationWarmup');
  const begin = runInNewContext(source + '\ninitializeNavigationWarmup(prefetchHTML)', {
    URL, AbortController, HTMLLinkElement: Link, Element: Link, Node: Link, PointerEvent: class {},
    document,
    IntersectionObserver: Observer,
    window: { location: new URL(route, current), innerHeight: 844, addEventListener: (name: string, handler: (event: unknown) => void) => record(windowHandlers, name, handler) },
    navigator,
    fetch: request,
    scheduleBackgroundTask: scheduler.schedule,
    prioritizeNavigation: scheduler.prioritizeNavigation,
    allowNavigationAssets, fetchNavigationAsset, navigationDestination, readNavigationManifest, selectNavigationAssets,
    prefetchHTML: (url: string) => html.push(url),
  }) as (intent: { link: Link; href: string; startedAt: number }) => void;
  return {
    requests, html, links, document, scheduler, begin, article, observers, navigator,
    emitDocument(name: string, event: unknown = {}) { for (const handler of documentHandlers.get(name) ?? []) handler(event); },
    emitWindow(name: string, event: unknown = {}) { for (const handler of windowHandlers.get(name) ?? []) handler(event); },
    flush: () => new Promise<void>(resolve => setImmediate(resolve)),
  };
}

test('only a different same-origin HTTP page is a navigation destination', () => {
  assert.equal(navigationDestination('/cs/#intro', current)?.href, 'https://example.test/cs/');
  assert.equal(navigationDestination('/?sort=new', current)?.search, '?sort=new');
  for (const href of ['#intro', '/', 'https://other.test/cs/', 'javascript:alert(1)', 'mailto:a@example.test', 'https://u:p@example.test/cs/']) {
    assert.equal(navigationDestination(href, current), null);
  }
});

test('only explicit data saving and offline state disable optional asset downloads', () => {
  assert.equal(allowNavigationAssets(undefined), true);
  assert.equal(allowNavigationAssets({ effectiveType: '3g' }), true);
  assert.equal(allowNavigationAssets({ saveData: true }), false);
  assert.equal(allowNavigationAssets({ effectiveType: 'slow-2g' }), true);
  assert.equal(allowNavigationAssets(undefined, false), false);
});

test('home startup prepares primary destinations before any hover, sharing resources and the manifest', async () => {
  const runtime = await setupRuntime();
  assert.deepEqual(runtime.html, [current + 'cs/', current + 'gallery/', current + 'about/']);
  await runtime.flush();
  assert.equal(runtime.requests.filter(url => url.endsWith('.json')).length, 1);
  assert.equal(runtime.requests.filter(url => url.endsWith('shared.css')).length, 1);
  assert(runtime.requests.includes(current + 'cs.js'));
  assert(runtime.requests.includes(current + 'gallery.webp'));
  const before = runtime.requests.length;
  runtime.emitDocument('pointerover', { target: runtime.links[2] });
  runtime.emitDocument('pointerout', { target: runtime.links[2], relatedTarget: null });
  runtime.begin({ link: runtime.links[2], href: runtime.links[2].href, startedAt: Date.now() - 5000 });
  await runtime.flush();
  assert.equal(runtime.requests.length, before);
  runtime.scheduler.dispose();
});

test('automatic preparation waits for load and resumes unfinished work after page restoration', async () => {
  const runtime = await setupRuntime('loading');
  await runtime.flush();
  assert.equal(runtime.requests.length, 0);
  assert.equal(runtime.html.length, 0);
  runtime.document.readyState = 'complete';
  runtime.emitWindow('pagehide');
  runtime.emitWindow('pageshow', { persisted: true });
  await runtime.flush();
  assert(runtime.requests.includes(current + 'gallery.webp'));
  assert.equal(runtime.requests.filter(url => url.endsWith('shared.css')).length, 1);
  runtime.scheduler.dispose();
});

test('series navigation only prepares the next post near the article end and replaces the observer on navigation', async () => {
  const runtime = await setupRuntime('complete', '/article/');
  const { observers, article } = runtime;
  await runtime.flush();
  assert.equal(runtime.html.length, 0);
  assert.equal(observers[0].target, article.next);
  assert.equal(observers[0].options.rootMargin, '0px 0px 844px 0px');
  observers[0].near(false);
  runtime.navigator.connection.saveData = true;
  observers[0].near();
  runtime.navigator.connection.saveData = false;
  runtime.navigator.onLine = false;
  observers[0].near();
  runtime.navigator.onLine = true;
  assert.equal(runtime.html.length, 0);

  runtime.emitDocument('astro:before-swap');
  const old = observers[0];
  article.next = runtime.links[2];
  article.styles.push(Object.assign(runtime.links[0], { href: current + 'shared.css' }));
  runtime.emitDocument('astro:page-load');
  const next = observers.at(-1)!;
  old.near();
  assert.equal(runtime.html.length, 0);
  assert.equal(next.target, article.next);
  next.near();
  next.near();
  await runtime.flush();
  assert.deepEqual(runtime.html, [current + 'gallery/']);
  assert.deepEqual(runtime.requests, [current + 'navigation-assets.test.json', current + 'gallery.webp']);
  runtime.scheduler.dispose();
});

test('the lightweight bootstrap prefetches immediately and replays the first intent after optional code loads', async () => {
  const handlers = new Map<string, (event: unknown) => void>();
  const prefetched: string[] = [];
  const replayed: Array<{ href: string; startedAt: number }> = [];
  let now = 1000;
  let resolveModule!: (value: unknown) => void;
  const optionalModule = new Promise((resolve) => { resolveModule = resolve; });
  class Link {
    href = 'https://example.test/cs/';
    target = '';
    dataset = {};
    isConnected = true;
    closest() { return this; }
    hasAttribute() { return false; }
  }
  let code = stripTypeScriptTypes(await readFile(new URL('../src/scripts/navigation-prefetch.ts', import.meta.url), 'utf8'));
  code = code.replace("import { prefetch } from 'astro:prefetch';", '')
    .replace("import('./navigation-warmup-runtime')", 'loadOptionalModule()');
  runInNewContext(code, {
    Element: Link,
    URL,
    Event,
    Date: { now: () => now },
    navigator: {},
    document: {
      readyState: 'loading', hidden: false,
      getElementById: () => null,
      addEventListener: (name: string, handler: (event: unknown) => void) => handlers.set(name, handler),
    },
    window: { location: { href: 'https://example.test/', origin: 'https://example.test' }, addEventListener() {}, dispatchEvent() {} },
    prefetch: (href: string) => prefetched.push(href),
    loadOptionalModule: () => optionalModule,
  });
  const event = { target: new Link(), button: 0 };
  handlers.get('pointerdown')!({ ...event, pointerType: 'touch' });
  assert.deepEqual(prefetched, [], 'starting a swipe should not request a page');
  handlers.get('pointerdown')!({ ...event, pointerType: 'mouse' });
  assert.deepEqual(prefetched, ['https://example.test/cs/']);
  assert.equal(replayed.length, 0);
  now = 1030;
  handlers.get('click')!(event);
  resolveModule({ initializeNavigationWarmup: () => (intent: { href: string; startedAt: number }) => replayed.push(intent) });
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(replayed.length, 1);
  assert.equal(replayed[0].href, 'https://example.test/cs/');
  assert.equal(replayed[0].startedAt, 1000);
  now = 1100;
  handlers.get('pointerdown')!({ ...event, pointerType: 'touch' });
  assert.equal(replayed.length, 1);
  handlers.get('click')!({ ...event, pointerType: 'touch' });
  assert.equal(replayed.length, 2);
  assert.equal(replayed[1].startedAt, 1100);
  now = 1150;
  handlers.get('click')!({ ...event, detail: 0 });
  assert.equal(replayed.length, 3, 'keyboard activation still warms the destination');
});

test('build manifest shares assets and only includes declared startup resources', async () => {
  const html = `<link rel="stylesheet" href="/main.css"><link rel="stylesheet" href="https://other.test/no.css">
    <link rel="stylesheet" href="/print.css" media="print"><link rel="preload" as="image" href="/hero.webp">
    <link rel="preload" as="image" href="/later.webp" fetchpriority="low"><link rel="preload" as="font" href="/font.woff2">
    <script type="module" src="/entry.js"></script><script src="/later.js" async></script>
    <astro-island client="load" component-url="/wall.js" renderer-url="/renderer.js"></astro-island>
    <astro-island client="visible" component-url="/offscreen.js"></astro-island><img src="/article.webp">`;
  const manifest = await buildNavigationManifest([{ route: '/', html }, { route: '/gallery/', html }], async () => 1000);
  assert.equal(manifest.assets.length, 6);
  assert.deepEqual(manifest.assets.map((asset) => asset.url), ['/main.css', '/hero.webp', '/font.woff2', '/entry.js', '/wall.js', '/renderer.js']);
  assert.deepEqual(manifest.routes['/'], manifest.routes['/gallery/']);
});

test('build retains declared startup resources of any size and omits missing files', async () => {
  const html = `<link rel="stylesheet" href="/huge.css"><script type="module" src="/missing.js"></script>` +
    Array.from({ length: 7 }, (_, i) => `<link rel="preload" as="image" href="/${i}.webp">`).join('');
  const manifest = await buildNavigationManifest([{ route: '/', html }], async (url) => url === '/huge.css' ? 300 * 1024 : url === '/missing.js' ? 0 : 60 * 1024);
  assert.equal(manifest.assets.length, 8);
  assert.equal(manifest.assets[0].url, '/huge.css');
  assert.equal(manifest.assets.filter((asset) => asset.type === 'image').length, 7);
});

test('generated manifest is versioned, resolves nested URLs and leaves page presentation intact', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'navigation-manifest-test-'));
  try {
    await mkdir(path.join(root, 'cs'));
    const home = '<html><head><style>.original {color: purple}</style></head><body class="original">home</body></html>';
    const article = '<html><head><link rel="stylesheet" href="page.css"></head><body>article</body></html>';
    await writeFile(path.join(root, 'index.html'), home);
    await writeFile(path.join(root, 'cs/index.html'), article);
    await writeFile(path.join(root, 'cs/page.css'), 'body {color: purple}');
    const first = await generateNavigationManifest(root);
    const manifest = JSON.parse(await readFile(path.join(root, first.href.slice(1)), 'utf8'));
    assert.deepEqual(Object.keys(manifest.routes), ['/cs/', '/']);
    assert.equal(manifest.assets[0].url, '/cs/page.css');
    assert.equal((await readFile(path.join(root, 'index.html'), 'utf8')).replace(/<link rel="navigation-assets"[^>]+>/, ''), home);
    const again = await generateNavigationManifest(root);
    assert.equal(again.href, first.href);
    assert.equal((await readFile(path.join(root, 'index.html'), 'utf8')).match(/data-navigation-assets/g)?.length, 1);
    await writeFile(path.join(root, 'cs/page.css'), 'body {color: purple; margin: 0}');
    assert.notEqual((await generateNavigationManifest(root)).href, first.href);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('runtime skips current resources, deduplicates and rejects external or malformed assets', () => {
  const manifest: NavigationManifest = {
    version: 1,
    assets: [
      { url: '/main.css', type: 'style', bytes: 1000 },
      { url: '/entry.js', type: 'script', bytes: 1000 },
      { url: 'https://other.test/no.js', type: 'script', bytes: 1000 },
      { url: '/wrong.mp3', type: 'script', bytes: 1000 },
    ],
    routes: { '/cs/': [0, 1, 1, 2, 3, 999, -1, 0.5] },
  };
  const result = selectNavigationAssets(manifest, new URL('/cs', current), current, new Set([current + 'main.css']));
  assert.deepEqual(result.map((asset) => asset.url), [current + 'entry.js']);
  assert.deepEqual(selectNavigationAssets(manifest, new URL('https://other.test/cs/'), current, new Set()), []);
  assert.deepEqual(selectNavigationAssets(manifest, new URL('/unknown/', current), current, new Set()), []);
});

test('warm only explicitly preloaded local JSON with normal cache freshness', async () => {
  const preload = (attributes: string) => `<link rel="preload" as="fetch" ${attributes}>`;
  const html = [
    preload('href="/posts.json" type="application/json" crossorigin="anonymous"'),
    preload('href="/missing-type.json" crossorigin="anonymous"'),
    preload('href="/credentials.json" type="application/json" crossorigin="use-credentials"'),
    preload('href="/other-mode.json" type="application/json"'),
    preload('href="https://other.test/external.json" type="application/json" crossorigin'),
    preload('href="/profile" type="application/json" crossorigin'),
  ].join('');
  const manifest = await buildNavigationManifest([{ route: '/search/', html }], async () => 123);
  assert.deepEqual(manifest.assets, [{ url: '/posts.json', bytes: 123, type: 'json' }]);
  const destination = new URL('/search/', current);
  const assets = selectNavigationAssets(readNavigationManifest(manifest)!, destination, current, new Set());
  assert.equal(assets.length, 1);
  const signal = new AbortController().signal;
  const fetchJSON = (type: string): typeof fetch => async (url, init) => {
    assert.equal(url, new URL('/posts.json', current).href);
    assert.equal(init?.cache, 'default');
    assert.equal(init?.credentials, 'same-origin');
    return new Response('[]', { headers: { 'Content-Type': type } });
  };
  assert.ok(await fetchNavigationAsset(assets[0], signal, fetchJSON('application/json; charset=utf-8')));
  assert.equal(await fetchNavigationAsset(assets[0], signal, fetchJSON('text/html')), false);
});

test('runtime prepares every declared startup resource without connection or byte budgets', () => {
  const manifest: NavigationManifest = {
    version: 1,
    assets: Array.from({ length: 10 }, (_, i) => ({ url: `/${i}.css`, type: 'style' as const, bytes: 300 * 1024 })),
    routes: { '/cs/': Array.from({ length: 10 }, (_, i) => i) },
  };
  assert.equal(selectNavigationAssets(manifest, new URL('/cs/', current), current, new Set()).length, 10);
  assert.equal(selectNavigationAssets(manifest, new URL('/cs/', current), current, new Set(), { effectiveType: '3g' }).length, 10);
  assert.equal(selectNavigationAssets(manifest, new URL('/cs/', current), current, new Set(), { effectiveType: '2g' }).length, 10);
  assert.equal(readNavigationManifest(manifest)?.assets.length, 10);
  assert.equal(selectNavigationAssets(manifest, new URL('/cs/', current), current, new Set(), { saveData: true }).length, 0);
});

test('unexpected manifest versions and invalid entries fall back to normal navigation', () => {
  for (const value of [null, {}, { version: 2, assets: [], routes: {} }, { version: 1, assets: [{ url: '/a.js', type: 'script', bytes: -1 }], routes: {} }]) {
    assert.equal(readNavigationManifest(value), null);
  }
  assert.deepEqual(readNavigationManifest({ version: 1, assets: [], routes: {} }), { version: 1, assets: [], routes: {} });
});

test('asset warmup fills only the HTTP cache and passes cancellation to its low priority request', async () => {
  const controller = new AbortController();
  let receivedURL: unknown;
  let receivedInit: RequestInit | undefined;
  assert.equal(await fetchNavigationAsset({ url: current + 'entry.js', type: 'script', bytes: 10 }, controller.signal, async (url, init) => {
    receivedURL = url;
    receivedInit = init;
    return new Response('export {};', { headers: { 'content-type': 'text/javascript; charset=utf-8' } });
  }), true);
  assert.equal(receivedURL, current + 'entry.js');
  assert.equal(receivedInit?.signal, controller.signal);
  assert.equal(receivedInit?.cache, 'force-cache');
  assert.equal(receivedInit?.priority, 'low');
  assert.equal(receivedInit?.mode, 'cors');
});

test('partial, wrong-type, empty or canceled asset responses do not count as warmed', async () => {
  const asset = { url: current + 'main.css', type: 'style' as const, bytes: 10 };
  for (const response of [
    new Response('part', { status: 206, headers: { 'content-type': 'text/css' } }),
    new Response('missing', { status: 404, headers: { 'content-type': 'text/css' } }),
    new Response('<html>wrong</html>', { headers: { 'content-type': 'text/html' } }),
    new Response('', { headers: { 'content-type': 'text/css' } }),
  ]) {
    assert.equal(await fetchNavigationAsset(asset, new AbortController().signal, async () => response), false);
  }
  const controller = new AbortController();
  controller.abort();
  assert.equal(await fetchNavigationAsset(asset, controller.signal, async () => new Response('a {}', { headers: { 'content-type': 'text/css' } })), false);
});

test('large valid startup resources can warm at an explicit navigation priority', async () => {
  let priority: RequestPriority | undefined;
  const body = 'x'.repeat(300 * 1024);
  assert.equal(await fetchNavigationAsset({ url: current + 'large.css', type: 'style', bytes: body.length }, new AbortController().signal, async (_url, init) => {
    priority = init?.priority;
    return new Response(body, { headers: { 'content-type': 'text/css' } });
  }, 'high'), true);
  assert.equal(priority, 'high');
});

test('responsive warmup keeps the destination format and sizes and only same-origin width candidates', async () => {
  const html = `<link rel="preload" as="image" type="image/avif" imagesrcset="small.avif 180w, large.avif 720w" imagesizes="(max-width: 480px) 120px, 360px">
    <link rel="preload" as="image" imagesrcset="a.webp 180w, https://other.test/b.webp 720w">
    <link rel="preload" as="image" href="desktop-only.webp" media="(min-width: 924px)">`;
  const manifest = await buildNavigationManifest([{ route: '/gallery/', html }], async () => 1000);
  assert.deepEqual(manifest.assets, [{
    url: '/gallery/large.avif', bytes: 1000, type: 'image', mimeType: 'image/avif',
    sources: [{ url: '/gallery/small.avif', width: 180 }, { url: '/gallery/large.avif', width: 720 }],
    sizes: '(max-width: 480px) 120px, 360px',
  }]);
});

test('startup module hints flatten static imports and immediate islands without warming dynamic code', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'navigation-module-hints-'));
  try {
    await mkdir(path.join(root, '_astro'));
    const files = {
      'entry.js': 'import "./shared.js"; import("./late.js"); import("https://other.test/later.js");',
      'shared.js': 'export * from "./leaf.js";',
      'leaf.js': 'import "./shared.js";',
      'photo.js': 'import "./shared.js";',
      'react.js': 'import "./leaf.js";',
      'inline.js': 'export const value = 1;',
      'idle.js': 'import "./idle-only.js";',
      'idle-only.js': '', 'visible.js': '', 'late.js': '', 'classic.js': 'void import("./late.js");',
    };
    await Promise.all(Object.entries(files).map(([name, code]) => writeFile(path.join(root, '_astro', name), code)));
    const html = '<html><head><link rel="preload" as="image" href="/cover.webp">' +
      '<link rel="modulepreload" href="/_astro/leaf.js"><script type="module" src="/_astro/entry.js"></script>' +
      '<script type="module">import "/_astro/inline.js"; import("/_astro/late.js");</script>' +
      '<script defer src="/_astro/classic.js"></script></head><body>' +
      '<astro-island client="load" component-url="/_astro/photo.js" renderer-url="/_astro/react.js"></astro-island>' +
      '<astro-island client="idle" component-url="/_astro/idle.js"></astro-island>' +
      '<astro-island client="visible" component-url="/_astro/visible.js"></astro-island></body></html>';
    await writeFile(path.join(root, 'index.html'), html);
    await writeFile(path.join(root, 'other.html'), '<html><head></head><body>plain page</body></html>');
    const { href } = await generateNavigationManifest(root);
    const output = await readFile(path.join(root, 'index.html'), 'utf8');
    const hints = [...output.matchAll(/<link rel="modulepreload" href="([^"]+)"[^>]* data-navigation-module>/g)]
      .map(match => match[1]).sort();
    assert.deepEqual(hints, ['/_astro/inline.js', '/_astro/photo.js', '/_astro/react.js', '/_astro/shared.js']);
    const manifest = JSON.parse(await readFile(path.join(root, href.slice(1)), 'utf8'));
    assert.ok(hints.every(url => manifest.assets.some((asset: { url: string }) => asset.url === url)));
    assert.equal(output.includes('fetchpriority="low"'), true);
    assert.ok(output.indexOf('as="image"') < output.indexOf('data-navigation-module'));
    assert.ok(!(await readFile(path.join(root, 'other.html'), 'utf8')).includes('modulepreload'));
    assert.equal((await generateNavigationManifest(root)).href, href);
    assert.equal(await readFile(path.join(root, 'index.html'), 'utf8'), output);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
