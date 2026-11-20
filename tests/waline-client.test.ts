import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

test('the deferred comment client formats the first render and cleans up a failed or completed mount', async () => {
  const source = stripTypeScriptTypes(await readFile(new URL('../src/scripts/waline-client.ts', import.meta.url), 'utf8'))
    .replace(/^import .*;$/gm, '').replace('export function', 'function');
  const events: string[] = [];
  let fail = true;
  const mount = runInNewContext(source + '\nmountWaline', {
    keepCommentDisplayEmojiFree() {
      events.push('format');
      return () => events.push('stop formatting');
    },
    init() {
      events.push('render');
      return { destroy: () => events.push('destroy') };
    },
    enhanceCommentInteractions() {
      if (fail) throw new Error('interrupted');
      events.push('interactions');
      return () => events.push('stop interactions');
    },
  });
  const container = { dataset: { path: '/test-post/' } };
  assert.throws(() => mount(container, 'https://comments.example'), /interrupted/);
  assert.deepEqual(events, ['format', 'render', 'stop formatting', 'destroy']);

  fail = false;
  events.length = 0;
  const unmount = mount(container, 'https://comments.example');
  assert.deepEqual(events, ['format', 'render', 'interactions']);
  unmount();
  assert.deepEqual(events.slice(3), ['stop interactions', 'stop formatting', 'destroy']);
});

test('far comments wait for proximity or interaction and still load without a visibility observer', async () => {
  const source = stripTypeScriptTypes(await readFile(new URL('../src/scripts/waline-runtime.ts', import.meta.url), 'utf8'))
    .replace(/^import .*;$/gm, '');
  for (const trigger of ['proximity', 'focusin', 'pointerenter', 'fallback', 'waline', 'rss', 'change', 'token', 'section', 'restored', 'interrupted', 'footer-stay', 'footer-leave', 'footer-cancel', 'footer-focus', 'approach', 'approach-leave', 'approach-unmount', 'approach-navigate']) {
    let rendered = false;
    let connections = 0;
    let cancellations = 0;
    let scrolled = false;
    let dwell: (() => void) | undefined;
    const link = {};
    const footer = { contains: (node: unknown) => node === link };
    const card = { scrollIntoView() { scrolled = true; } };
    const element = Object.assign(new EventTarget(), {
      id: 'waline', isConnected: true, dataset: {}, setAttribute() {}, querySelector: () => null,
      contains: (node: unknown) => node === card,
    });
    const document = Object.assign(new EventTarget(), {
      getElementById: (id: string) => id === 'waline' ? element : id === '1' || (id === '9' && rendered) ? card : null,
      querySelector: (selector: string) => selector.includes('data-post-navigation') && (trigger.startsWith('footer-') || trigger === 'approach-navigate') ? footer : null,
      createElement: () => ({ dataset: {} }),
      head: { append() { connections++; } },
    });
    let visibility: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
    let approach: typeof visibility;
    class IntersectionObserver {
      constructor(callback: typeof visibility, options: { rootMargin: string }) {
        if (options.rootMargin === '3000px 0px') approach = callback;
        else {
          assert.equal(options.rootMargin, '1200px');
          visibility = callback;
        }
      }
      observe(target: unknown) { assert.equal(target, element); }
      disconnect() {}
    }
    let mutation: (() => void) | undefined;
    class MutationObserver {
      constructor(callback: () => void) { mutation = callback; }
      observe() {}
      disconnect() { mutation = undefined; }
    }
    const hash = trigger === 'waline' ? '#waline' : trigger === 'section' ? '#1'
      : ['rss', 'restored', 'interrupted'].includes(trigger) ? '#9' : '';
    const window = Object.assign(new EventTarget(), { location: { hash, search: trigger === 'token' ? '?token=sample' : '' } });
    Object.assign(window, {
      scrollY: 600,
      setTimeout(callback: () => void) { dwell = callback; return 1; },
      clearTimeout() { dwell = undefined; },
    });
    if (trigger !== 'fallback') Object.assign(window, { IntersectionObserver });
    const priorities: string[] = [];
    const history = { state: trigger === 'section' ? null : { scrollY: trigger === 'restored' ? 400 : 0 }, scrollRestoration: 'manual' };
    runInNewContext(source, {
      document, window, IntersectionObserver, MutationObserver, AbortController, URL, URLSearchParams,
      history, queueMicrotask,
      scheduleBackgroundTask(options: { priority: string }) {
        priorities.push(options.priority);
        return { done: new Promise(() => {}), cancel() { cancellations++; } };
      },
    });
    if (trigger.startsWith('approach')) {
      approach!([{ isIntersecting: false }]);
      assert.equal(connections, 0);
      approach!([{ isIntersecting: true }]);
      assert.equal(connections, 1);
      assert.deepEqual(priorities, []);
      assert.ok(dwell);
      if (trigger === 'approach-navigate') {
        dwell();
        const navigation = new AbortController();
        document.dispatchEvent(Object.assign(new Event('astro:before-preparation'), { sourceElement: link, signal: navigation.signal }));
        assert.deepEqual(priorities, ['prefetch']);
        assert.equal(cancellations, 1);
      } else if (trigger === 'approach') {
        dwell();
        assert.deepEqual(priorities, ['prefetch']);
        visibility!([{ isIntersecting: true }]);
        assert.deepEqual(priorities, ['prefetch', 'navigation']);
      } else {
        if (trigger === 'approach-leave') approach!([{ isIntersecting: false }]);
        else document.dispatchEvent(new Event('astro:before-swap'));
        assert.equal(dwell, undefined);
        assert.deepEqual(priorities, []);
      }
      continue;
    }
    if (trigger.startsWith('footer-')) {
      visibility!([{ isIntersecting: true }]);
      assert.deepEqual(priorities, []);
      assert.ok(dwell);
      if (trigger === 'footer-focus') element.dispatchEvent(new Event('focusin'));
      else if (trigger === 'footer-stay') dwell();
      else {
        const navigation = new AbortController();
        document.dispatchEvent(Object.assign(new Event('astro:before-preparation'), { sourceElement: link, signal: navigation.signal }));
        visibility!([{ isIntersecting: true }]);
        assert.equal(dwell, undefined);
        if (trigger === 'footer-leave') {
          document.dispatchEvent(new Event('astro:before-swap'));
          navigation.abort();
          assert.equal(dwell, undefined);
          assert.deepEqual(priorities, []);
          continue;
        }
        navigation.abort();
        assert.ok(dwell);
        (dwell as () => void)();
      }
    }
    if (trigger === 'fallback') {
      assert.deepEqual(priorities, ['prefetch']);
      continue;
    }
    if (trigger === 'section') {
      assert.deepEqual(priorities, [], 'static numeric chapter IDs belong to the article');
      assert.equal(history.scrollRestoration, 'auto');
      continue;
    }
    if (trigger === 'change') {
      assert.equal(priorities.length, 0);
      window.location.hash = '#9';
      window.dispatchEvent(new Event('hashchange'));
    }
    if (['rss', 'change', 'restored', 'interrupted'].includes(trigger)) {
      if (trigger === 'interrupted') window.dispatchEvent(new Event('wheel'));
      rendered = true;
      mutation?.();
      assert.equal(scrolled, trigger === 'rss' || trigger === 'change');
      assert.equal(mutation, undefined);
    }
    if (['proximity', 'focusin', 'pointerenter'].includes(trigger)) {
      visibility!([{ isIntersecting: false }]);
      assert.deepEqual(priorities, []);
      if (trigger === 'proximity') visibility!([{ isIntersecting: true }]);
      else element.dispatchEvent(new Event(trigger));
    }
    assert.deepEqual(priorities, ['navigation']);
    document.dispatchEvent(new Event('astro:before-swap'));
    element.dispatchEvent(new Event('focusin'));
    assert.equal(priorities.length, 1);
  }
});

test('older mobile syntax is used throughout the comment module graph', async () => {
  const { mobileCommentSyntax } = await import('../scripts/waline-compat.mjs');
  const entry = { fileName: 'entry', moduleIds: ['/site/src/scripts/waline-runtime.ts'], imports: ['shared'], dynamicImports: ['client'] };
  const chunk = (name: string) => ({ fileName: name, moduleIds: [], imports: [], dynamicImports: [] });
  const chunks = { entry, shared: chunk('shared'), client: chunk('client'), other: chunk('other') };
  const { handler } = mobileCommentSyntax().renderChunk;
  const code = 'export class Editor { value; read() { this.value ??= 1; return this.value; } }';
  for (const part of [chunks.entry, chunks.shared, chunks.client]) {
    const output = await handler(code, part, {}, { chunks });
    assert.ok(output);
    assert.doesNotMatch(output.code, /\?\?=|class \w+\{value;/);
  }
  assert.equal(await handler(code, chunks.other, {}, { chunks }), undefined);
});
