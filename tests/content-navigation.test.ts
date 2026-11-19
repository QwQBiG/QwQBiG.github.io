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

test('floating navigation preserves native actions and continues the existing background animation', async () => {
  const handlers = new Map<string, (event: any) => void>();
  const navigation: string[] = [];
  class Link {
    href: string;
    target = '';
    dataset: Record<string, string> = {};
    attributes = new Set<string>();
    insideNavigation = true;
    constructor(href: string) { this.href = new URL(href, 'https://example.test/cs/').href; }
    closest(selector: string) { return selector === '#floatingNavCard' && !this.insideNavigation ? null : this; }
    hasAttribute(name: string) { return this.attributes.has(name) || (name === 'data-astro-reload' && 'astroReload' in this.dataset); }
  }
  let links = [new Link('/cs/posts/next/'), new Link('/about/'), new Link('/?homeReturnMotion=1')];
  let clock = 1000;
  let animation = { animationName: 'gradientShift', currentTime: 2500 };
  const document = {
    querySelectorAll: () => links,
    body: { getAnimations: () => [animation] },
    addEventListener: (name: string, handler: (event: unknown) => void) => handlers.set(name, handler),
  };
  const code = stripTypeScriptTypes(await readFile(new URL('../src/scripts/content-navigation.ts', import.meta.url), 'utf8'))
    .replace(/^import .*;$/gm, '');
  runInNewContext(code, {
    document,
    window: { location: { href: 'https://example.test/cs/', origin: 'https://example.test', pathname: '/cs/', search: '' } },
    Element: Link, URL,
    performance: { now: () => clock },
    isContentNavigationPath,
    isTransitionBeforeSwapEvent: (event: { type: string }) => event.type === 'astro:before-swap',
    navigate: (href: string) => { navigation.push(href); return Promise.resolve(); },
  });
  assert.equal('astroReload' in links[1].dataset, true);
  assert.equal('astroReload' in links[2].dataset, true);
  const click = (link: Link, options: Record<string, unknown> = {}) => {
    const event = { target: link, button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...options };
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
  let skipped = false;
  handlers.get('astro:before-swap')!({ type: 'astro:before-swap', viewTransition: { skipTransition() { skipped = true; } } });
  animation = { animationName: 'gradientShift', currentTime: 0 };
  clock = 1016;
  handlers.get('astro:after-swap')!({});
  assert.equal(skipped, true);
  assert.equal(animation.currentTime, 2516);
  links = [new Link('/gallery/')];
  handlers.get('astro:page-load')!({});
  assert.equal('astroReload' in links[0].dataset, true);
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
  const mobile = Object.assign(new EventTarget(), { open: false });
  let page = original;
  const document = Object.assign(new EventTarget(), {
    querySelector: (selector: string) => selector === '[data-article-toc]' ? page.toc : mobile,
    getElementById: (id: string) => page.headings.get(id),
  });
  const window = new EventTarget();
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
  assert.deepEqual(active(), []);
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

  page.toc.parentElement = mobile;
  offset = 1400;
  window.dispatchEvent(new Event('scroll'));
  assert.equal(frames.size, 0, 'scrolling with a closed mobile TOC schedules no geometry work');
  mobile.open = true;
  mobile.dispatchEvent(new Event('toggle'));
  flush();
  assert.deepEqual(active(), ['#section-2']);
  page.toc.parentElement = null;

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
  assert.deepEqual(active(), ['#1-heading']);
  page = fixture([]);
  document.dispatchEvent(new Event('astro:page-load'));
  assert.equal(getEventListeners(window, 'scroll').length, 0);
});

test('a late diagram import cannot initialize a departed article and the next page initializes once', async () => {
  const source = await readFile(new URL('../src/components/content/MermaidDiagrams.astro', import.meta.url), 'utf8');
  const script = source.match(/<script>([\s\S]*?)<\/script>/)![1];
  const code = stripTypeScriptTypes(script).replace("import('mermaid')", 'loadMermaid()');
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
  blocks = [{ hasAttribute: () => false, querySelector: () => null }];
  document.dispatchEvent(new Event('astro:page-load'));
  document.dispatchEvent(new Event('astro:before-swap'));
  document.body = {};
  blocks = [];
  document.dispatchEvent(new Event('astro:page-load'));
  resolveImport({ default: { initialize() { initialized += 1; } } });
  await setImmediate();
  assert.equal(initialized, 0);
  document.body = {};
  blocks = [{ hasAttribute: () => false, querySelector: () => null }];
  document.dispatchEvent(new Event('astro:page-load'));
  await setImmediate();
  document.dispatchEvent(new Event('astro:page-load'));
  await setImmediate();
  assert.equal(initialized, 1);
});
