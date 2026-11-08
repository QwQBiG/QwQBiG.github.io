import assert from 'node:assert/strict';
import { getEventListeners } from 'node:events';
import { setImmediate } from 'node:timers/promises';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import { isContentNavigationPath } from '../src/utils/content-navigation.ts';

test('client navigation stays within content routes and leaves presentation pages native', () => {
  for (const pathname of ['/cs/', '/cs/posts/rustseries/rustbasics/', '/series/', '/poetry/posts/verse/', '/tags/c%2B%2B/', '/archives/']) {
    assert.equal(isContentNavigationPath(pathname), true, pathname);
  }
  for (const pathname of ['/', '/about/', '/gallery/', '/search/', '/404/', '/cs-other/', '/archives/extra/']) {
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

test('TOC binds each current article once, handles numeric heading IDs and cleans old listeners', async () => {
  class ClassList {
    values = new Set<string>();
    add(name: string) { this.values.add(name); }
    remove(name: string) { this.values.delete(name); }
  }
  class Link extends EventTarget {
    classList = new ClassList();
    readonly href: string;
    constructor(href: string) { super(); this.href = href; }
    getAttribute() { return this.href; }
  }
  const first = new Link('#1-heading');
  const second = new Link('#next');
  let links = [first];
  let scrolled = '';
  let headings = [{ id: '1-heading', offsetTop: 100, offsetHeight: 40 }];
  const document = new EventTarget() as EventTarget & Record<string, any>;
  document.querySelectorAll = (selector: string) => selector.startsWith('.toc') ? links : headings;
  document.getElementById = (id: string) => ({ scrollIntoView() { scrolled = id; } });
  const window = new EventTarget() as EventTarget & { scrollY: number };
  window.scrollY = 0;
  let nextFrame = 0;
  const frames = new Map<number, () => void>();
  const code = stripTypeScriptTypes(await readFile(new URL('../src/scripts/article-toc.ts', import.meta.url), 'utf8'));
  runInNewContext(code, {
    document, window, AbortController,
    requestAnimationFrame: (callback: () => void) => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: (id: number) => frames.delete(id),
  });
  assert.equal(first.classList.values.has('active'), true);
  first.dispatchEvent(new Event('click', { cancelable: true }));
  assert.equal(scrolled, '1-heading');
  document.dispatchEvent(new Event('astro:page-load'));
  document.dispatchEvent(new Event('astro:page-load'));
  assert.equal(getEventListeners(window, 'scroll').length, 1);
  window.dispatchEvent(new Event('scroll'));
  assert.equal(frames.size, 1);
  document.dispatchEvent(new Event('astro:before-swap'));
  assert.equal(frames.size, 0);
  assert.equal(getEventListeners(window, 'scroll').length, 0);
  assert.equal(getEventListeners(first, 'click').length, 0);
  links = [second];
  headings = [{ id: 'next', offsetTop: 100, offsetHeight: 40 }];
  document.dispatchEvent(new Event('astro:page-load'));
  assert.equal(second.classList.values.has('active'), true);
  links = [];
  document.dispatchEvent(new Event('astro:before-swap'));
  document.dispatchEvent(new Event('astro:page-load'));
  assert.equal(getEventListeners(window, 'scroll').length, 0);
});

test('a late diagram import cannot initialize a departed article and the next page initializes once', async () => {
  const source = await readFile(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');
  const script = source.match(/<!-- Mermaid 图表支持 -->\s*<script>([\s\S]*?)<\/script>/)![1];
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
