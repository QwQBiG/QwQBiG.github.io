import assert from 'node:assert/strict';
import { getEventListeners } from 'node:events';
import { setImmediate } from 'node:timers/promises';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import { isContentNavigationPath } from '../src/utils/content-navigation.ts';

test('client navigation stays within content routes and leaves presentation pages native', () => {
  for (const pathname of ['/cs/', '/cs/posts/rustseries/rustbasics/', '/series/', '/poetry/posts/verse/', '/tags/c%2B%2B/', '/archives/', '/search/', '/search']) {
    assert.equal(isContentNavigationPath(pathname), true, pathname);
  }
  for (const pathname of ['/', '/about/', '/gallery/', '/search/extra/', '/404/', '/cs-other/', '/archives/extra/']) {
    assert.equal(isContentNavigationPath(pathname), false, pathname);
  }
});

test('instant content swaps opt out of the root snapshot before the browser captures it', async () => {
  const component = await readFile(new URL('../src/components/content/ContentNavigation.astro', import.meta.url), 'utf8');
  assert.match(component, /:root\[data-astro-transition\]\s*\{\s*view-transition-name: none;/);
  assert.match(component, /<ClientRouter fallback="swap"/);
});

test('floating navigation preserves native actions and continues the existing background animation', async () => {
  const handlers = new Map<string, (event: any) => void>();
  const navigation: string[] = [];
  class Link {
    href: string;
    target = '';
    dataset: Record<string, string> = {};
    attributes = new Set<string>();
    insideNavigation = true;
    baseURI = 'https://example.test/cs/';
    constructor(href: string) { this.href = href; }
    getAttribute(name: string) { return name === 'href' ? this.href : name === 'target' ? this.target : null; }
    closest(selector: string) { return selector === '#floatingNavCard' && !this.insideNavigation ? null : this; }
    hasAttribute(name: string) { return this.attributes.has(name) || (name === 'data-astro-reload' && 'astroReload' in this.dataset); }
  }
  const links = [new Link('/cs/posts/next/'), new Link('/about/'), new Link('/#home-return-motion')];
  const cleanup: Array<() => void> = [];
  let clock = 1000;
  let animation = { animationName: 'gradientShift', currentTime: 2500 };
  const document = {
    body: { getAnimations: () => [animation] },
    addEventListener: (name: string, handler: (event: unknown) => void) => handlers.set(name, handler),
  };
  const code = stripTypeScriptTypes(await readFile(new URL('../src/scripts/content-navigation.ts', import.meta.url), 'utf8'))
    .replace(/^import .*;$/gm, '');
  runInNewContext(code, {
    document,
    window: { location: { href: 'https://example.test/cs/', origin: 'https://example.test', pathname: '/cs/', search: '' } },
    Element: Link, URL, setTimeout: (cb: () => void) => cleanup.push(cb),
    performance: { now: () => clock },
    isContentNavigationPath,
    isTransitionBeforeSwapEvent: (event: { type: string }) => event.type === 'astro:before-swap',
    navigate: (href: string) => { navigation.push(href); return Promise.resolve(); },
  });
  const click = (link: Link, options: Record<string, unknown> = {}) => {
    const event = { target: link, composedPath: () => [link], button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...options };
    handlers.get('click')!(event);
    return event;
  };
  assert.equal(click(links[0]).defaultPrevented, true);
  assert.deepEqual(navigation, ['https://example.test/cs/posts/next/']);
  const bodyLink = new Link('/poetry/');
  bodyLink.insideNavigation = false;
  const download = new Link('/cs/posts/download/');
  download.attributes.add('download');
  const newTab = new Link('/cs/posts/tab/');
  newTab.target = '_blank';
  for (const [link, options] of [
    [links[0], { ctrlKey: true }], [links[0], { metaKey: true }],
    [links[0], { shiftKey: true }], [links[0], { button: 1 }],
    [links[1], {}], [links[2], {}], [bodyLink, {}], [download, {}], [newTab, {}],
    [new Link('/cs/#heading'), {}], [new Link('https://other.test/cs/'), {}],
  ] as Array<[Link, Record<string, unknown>]>) {
    assert.equal(click(link, options).defaultPrevented, false, link.href);
  }
  assert.equal(navigation.length, 1);
  handlers.get('astro:before-swap')!({ type: 'astro:before-swap' });
  animation = { animationName: 'gradientShift', currentTime: 0 };
  clock = 1016;
  handlers.get('astro:after-swap')!({});
  assert.equal(animation.currentTime, 2516);
  assert.equal(links[1].dataset.astroReload, '');
  assert.equal(links[2].dataset.astroReload, '');
  const inserted = new Link('/gallery/');
  inserted.insideNavigation = false;
  assert.equal(click(inserted).defaultPrevented, false);
  assert.equal(inserted.dataset.astroReload, '');
  cleanup.forEach(release => release());
  assert.equal('astroReload' in inserted.dataset, false);
  const explicit = new Link('/cs/#section');
  explicit.dataset.astroReload = '';
  assert.equal(click(explicit).defaultPrevented, false);
  assert.equal(explicit.dataset.astroReload, '');
  assert.equal(click(new Link('https://[')).defaultPrevented, false);
});

test('the TOC follows the current section across scroll jumps, layout shifts and page swaps', async () => {
  class Link extends EventTarget {
    attributes = new Map<string, string>();
    classList = { add: (name: string) => this.classes.add(name), remove: (name: string) => this.classes.delete(name) };
    classes = new Set<string>();
    constructor(id: string) { super(); this.attributes.set('href', '#' + id); }
    getAttribute(name: string) { return this.attributes.get(name); }
    setAttribute(name: string, value: string) { this.attributes.set(name, value); }
    removeAttribute(name: string) { this.attributes.delete(name); }
  }
  let offset = 0;
  let layoutReads = 0;
  const article = {};
  function fixture(ids: string[]) {
    const links = ids.map(id => new Link(id));
    const headings = new Map(ids.map((id, index) => [id, {
      top: 250 + 500 * index,
      closest: () => article,
      getBoundingClientRect() { layoutReads++; return { top: this.top - offset }; },
    }]));
    const toc = { parentElement: null as EventTarget | null, querySelectorAll: () => links };
    return { links, headings, toc };
  }

  const original = fixture(Array.from({ length: 50 }, (_, i) => i === 25 ? '1-网络' : 'section-' + i));
  const mobile = Object.assign(new EventTarget(), {
    open: false,
    querySelector: () => null,
    append(toc: typeof original.toc) { toc.parentElement = this; },
  });
  const sidebar = Object.assign(new EventTarget(), {
    hidden: false,
    append(toc: typeof original.toc) { toc.parentElement = this; },
  });
  const desktop = Object.assign(new EventTarget(), { matches: false });
  let headingLookups = 0;
  let page = original;
  const document = Object.assign(new EventTarget(), {
    querySelector: (selector: string) => selector === '[data-article-toc]' ? page.toc : selector === '[data-mobile-toc]' ? mobile : sidebar,
    getElementById: (id: string) => { headingLookups++; return page.headings.get(id); },
  });
  const window = Object.assign(new EventTarget(), { matchMedia: () => desktop });
  const frames = new Map<number, () => void>();
  const observers = new Set<() => void>();
  let sequence = 0;
  class ResizeObserver {
    callback: () => void;
    constructor(callback: () => void) { this.callback = callback; }
    observe(el: unknown) { assert.equal(el, article); observers.add(this.callback); }
    disconnect() { observers.delete(this.callback); }
  }
  function flush(event = 'scroll') {
    window.dispatchEvent(new Event(event));
    assert.equal(frames.size, 1);
    const [callback] = frames.values();
    frames.clear();
    layoutReads = 0;
    callback();
    assert.ok(layoutReads <= 6, 'a 50-entry TOC needs at most six heading positions');
  }
  function active() {
    const activeLinks = page.links.filter(link => link.classes.has('active'));
    assert.deepEqual(activeLinks, page.links.filter(link => link.getAttribute('aria-current') === 'location'));
    return activeLinks.map(link => link.getAttribute('href'));
  }

  const code = stripTypeScriptTypes(await readFile(new URL('../src/scripts/article-toc.ts', import.meta.url), 'utf8'));
  runInNewContext(code, {
    document, window, AbortController, ResizeObserver,
    requestAnimationFrame: (callback: () => void) => { frames.set(++sequence, callback); return sequence; },
    cancelAnimationFrame: (id: number) => frames.delete(id),
  });
  assert.equal(page.toc.parentElement, mobile);
  assert.equal(headingLookups, 0);
  assert.equal(layoutReads, 0);
  assert.equal(observers.size, 0);
  assert.equal(getEventListeners(window, 'scroll').length, 0);
  assert.deepEqual(active(), []);
  desktop.matches = true;
  desktop.dispatchEvent(new Event('change'));
  assert.equal(page.toc.parentElement, sidebar);
  assert.equal(headingLookups, 50);
  assert.equal(observers.size, 1);
  offset = page.headings.get('1-网络')!.top + 250; // Well inside the section, past the heading text.
  window.dispatchEvent(new Event('scroll'));
  flush();
  assert.deepEqual(active(), ['#1-网络']);
  assert.equal(page.links[25].dispatchEvent(new Event('click', { cancelable: true })), true);

  // At the same scroll position a taller code block pushes this heading below the reading line.
  page.headings.get('1-网络')!.top += 400;
  for (const callback of observers) callback();
  flush('resize');
  assert.deepEqual(active(), ['#section-24']);
  offset = 99999;
  flush();
  assert.deepEqual(active(), ['#section-49']);
  offset = 0;
  flush('pageshow');
  assert.deepEqual(active(), []);

  desktop.matches = false;
  desktop.dispatchEvent(new Event('change'));
  assert.equal(getEventListeners(window, 'scroll').length, 0);
  assert.equal(observers.size, 0);
  offset = 1400;
  window.dispatchEvent(new Event('scroll'));
  assert.equal(frames.size, 0, 'scrolling with a closed mobile TOC schedules no geometry work');
  mobile.open = true;
  mobile.dispatchEvent(new Event('toggle'));
  flush();
  assert.deepEqual(active(), ['#section-2']);
  assert.equal(headingLookups, 50, 'opening the same article reuses its index');
  desktop.matches = true;
  desktop.dispatchEvent(new Event('change'));

  document.dispatchEvent(new Event('astro:page-load'));
  assert.equal(getEventListeners(window, 'scroll').length, 1);
  window.dispatchEvent(new Event('scroll'));
  window.dispatchEvent(new Event('pagehide'));
  assert.equal(frames.size, 0);
  window.dispatchEvent(new Event('scroll'));
  document.dispatchEvent(new Event('astro:before-swap'));
  assert.equal(frames.size, 0);
  assert.equal(observers.size, 0);
  assert.equal(getEventListeners(window, 'scroll').length, 0);

  page = fixture(['1-heading']);
  offset = 150;
  document.dispatchEvent(new Event('astro:page-load'));
  flush();
  assert.deepEqual(active(), ['#1-heading']);
  page = fixture([]);
  document.dispatchEvent(new Event('astro:page-load'));
  assert.equal(getEventListeners(window, 'scroll').length, 0);
});

async function mermaidScript() {
  const file = await readFile(new URL('../src/components/content/MermaidDiagrams.astro', import.meta.url), 'utf8');
  return stripTypeScriptTypes(file.match(/<script>([\s\S]*?)<\/script>/)![1]);
}

test('a late diagram import cannot initialize a departed article and the next page initializes once', async () => {
  const code = (await mermaidScript()).replace("import('mermaid')", 'loadMermaid()');
  const document = new EventTarget() as EventTarget & Record<string, any>;
  let blocks: unknown[] = [];
  document.readyState = 'complete';
  document.body = {};
  document.querySelectorAll = () => blocks;
  let resolveImport!: (value: unknown) => void;
  const pendingImport = new Promise(resolve => { resolveImport = resolve; });
  let initialized = 0;
  runInNewContext(code, { document, AbortController, console, loadMermaid: () => pendingImport });
  document.body = {};
  blocks = [{ closest: () => null, hasAttribute: () => false, querySelector: () => null }];
  document.dispatchEvent(new Event('astro:page-load'));
  document.dispatchEvent(new Event('astro:before-swap'));
  document.body = {};
  blocks = [];
  document.dispatchEvent(new Event('astro:page-load'));
  resolveImport({ default: { initialize() { initialized += 1; } } });
  await setImmediate();
  assert.equal(initialized, 0);
  document.body = {};
  blocks = [{ closest: () => null, hasAttribute: () => false, querySelector: () => null }];
  document.dispatchEvent(new Event('astro:page-load'));
  await setImmediate();
  document.dispatchEvent(new Event('astro:page-load'));
  await setImmediate();
  assert.equal(initialized, 1);
});

test('diagrams render near the reader, recheck priority after async work, and stop on swap', async () => {
  const script = await mermaidScript();
  const document = Object.assign(new EventTarget(), { readyState: 'complete', body: {}, querySelectorAll: () => [] });
  const block = (top: number) => ({ top, closest: () => null, getBoundingClientRect() { return { top: this.top, bottom: this.top + 100 }; } });
  const blocks = [block(1350), block(1400), block(15), block(5500)];
  let notify!: (entries: { target: typeof blocks[number]; isIntersecting: boolean }[]) => void;
  const observed = new Set<typeof blocks[number]>();
  class Observer {
    constructor(callback: typeof notify) { notify = callback; }
    observe(target: typeof blocks[number]) { observed.add(target); }
    unobserve(target: typeof blocks[number]) { observed.delete(target); }
    disconnect() { observed.clear(); }
  }
  let frame: FrameRequestCallback | undefined;
  let finish!: () => void;
  let imports = 0;
  let finishImport!: () => void;
  const pauseImport = new Promise<void>(resolve => { finishImport = resolve; });
  const rendered: number[] = [];
  const context = {
    window: { innerHeight: 850 }, IntersectionObserver: Observer, AbortController, document, console,
    requestAnimationFrame(fn: FrameRequestCallback) { frame = fn; return 1; },
    cancelAnimationFrame() { frame = undefined; },
    async load() {
      imports++;
      await pauseImport;
      return async (item: typeof blocks[number]) => {
        rendered.push(blocks.indexOf(item));
        await new Promise<void>(resolve => { finish = resolve; });
      };
    },
  };
  const observe = runInNewContext(script + '\nloadRenderer = load; observeDiagrams', context);
  const lifetime = new AbortController();
  observe(blocks, lifetime.signal);
  notify(blocks.map(target => ({ target, isIntersecting: false })));
  assert.equal(imports, 0);
  notify([{ target: blocks[0], isIntersecting: true }]);
  assert.equal(imports, 1);
  blocks[0].top = -5000; // Its observer exit may arrive later than the download.
  notify([1, 2].map(index => ({ target: blocks[index], isIntersecting: true })));
  finishImport();
  await setImmediate();
  assert.deepEqual(rendered, [2], 'prefer the visible diagram over merely nearby ones');
  blocks[3].top = 10;
  notify([{ target: blocks[3], isIntersecting: true }]);
  assert.deepEqual(rendered, [2], 'only one layout in progress');
  finish();
  await setImmediate();
  frame!(0);
  frame = undefined;
  await setImmediate();
  assert.deepEqual(rendered, [2, 3], 'jumping deep into the article bypasses earlier offscreen diagrams');
  lifetime.abort();
  finish();
  await setImmediate();
  assert.equal(observed.size, 0);
  assert.equal(frame, undefined);
  assert.equal(imports, 1);
  assert.deepEqual(rendered, [2, 3]);

  // Browsers without observation still render every diagram, one at a time.
  Reflect.deleteProperty(context, 'IntersectionObserver');
  const fallback = new AbortController();
  observe(blocks.slice(0, 2), fallback.signal);
  await setImmediate();
  finish();
  await setImmediate();
  frame!(0);
  await setImmediate();
  assert.deepEqual(rendered.slice(2), [0, 1]);
  finish();
  await setImmediate();
  fallback.abort();
});

test('diagram articles let native heading jumps finish, then honor the scroll margin and release on reader input', async () => {
  const script = await mermaidScript();
  const timers = new Map<number, () => void>();
  let id = 0;
  const window = Object.assign(new EventTarget(), {
    setTimeout(callback: () => void) { timers.set(++id, callback); return id; },
    clearTimeout(id: number) { timers.delete(id); },
  });
  function tick() {
    const callbacks = Array.from(timers.values());
    timers.clear();
    callbacks.forEach(run => run());
  }
  let top = -1722;
  let alignments = 0;
  const heading = {
    matches: () => true,
    getBoundingClientRect: () => ({ top }),
    scrollIntoView(options: { behavior: string }) {
      assert.equal(options.behavior, 'instant');
      alignments++;
      top = 96;
    },
  };
  let resize!: () => void;
  let observing = false;
  class Resize {
    constructor(callback: () => void) { resize = callback; }
    observe() { observing = true; }
    disconnect() { observing = false; }
  }
  const document = Object.assign(new EventTarget(), {
    readyState: 'complete', body: {}, querySelectorAll: () => [],
    getElementById: (name: string) => name === '应答' && heading,
  });
  const article = { contains: (element: unknown) => element === heading };
  const history = { state: { scrollY: 0 } };
  const hash = '#' + encodeURIComponent('应答');
  const watch = runInNewContext(script + '\nwatchDiagramFragment', {
    window, document, history, location: { hash }, ResizeObserver: Resize, AbortController,
    getComputedStyle: () => ({ scrollMarginTop: '96px' }), console,
  });
  const lifetime = new AbortController();
  let resumes = 0;
  let rendering = true;
  const fragment = watch(article, lifetime.signal, () => rendering, () => { resumes++; });
  assert.equal(fragment.travelling(), true);
  window.dispatchEvent(new Event('scroll'));
  window.dispatchEvent(new Event('scroll'));
  resize();
  assert.equal(alignments, 0, 'keep native smooth scrolling in control while moving');
  assert.equal(timers.size, 1);
  tick();
  assert.equal(fragment.travelling(), false);
  assert.equal(resumes, 1);
  assert.equal(top, 96);
  tick();
  assert.equal(observing, true, 'late diagram size changes can still move the heading');
  top = -400;
  resize();
  assert.equal(top, 96);
  window.dispatchEvent(new Event('wheel'));
  top = -100;
  resize();
  assert.equal(top, -100, 'a reader scroll cancels corrections, even with a layout pending');
  assert.equal(observing, false);
  assert.equal(timers.size, 0);
  history.state.scrollY = 4000;
  lifetime.abort();
  const visit = new AbortController();
  const restored = watch(article, visit.signal, () => rendering, () => { resumes++; });
  assert.equal(restored.travelling(), false, 'preserve history reading position even when the URL contains a fragment');
  const click = Object.assign(new Event('click'), { button: 0 });
  Object.defineProperty(click, 'target', { value: { closest: () => ({ hash, target: '', hasAttribute: () => false }) } });
  document.dispatchEvent(click);
  assert.equal(restored.travelling(), true);
  rendering = false;
  tick();
  tick();
  assert.equal(observing, false, 'release as soon as nearby layouts have settled');
  visit.abort();
});
