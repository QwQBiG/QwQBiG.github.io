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
  for (const trigger of ['proximity', 'focusin', 'pointerenter', 'fallback']) {
    const element = Object.assign(new EventTarget(), { isConnected: true, dataset: {}, setAttribute() {} });
    const document = Object.assign(new EventTarget(), {
      getElementById: (id: string) => id === 'waline' ? element : null,
      querySelector: () => null,
      createElement: () => ({ dataset: {} }),
      head: { append() {} },
    });
    let visibility: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
    class IntersectionObserver {
      constructor(callback: typeof visibility, options: { rootMargin: string }) {
        assert.equal(options.rootMargin, '1200px');
        visibility = callback;
      }
      observe(target: unknown) { assert.equal(target, element); }
      disconnect() {}
    }
    const window = new EventTarget();
    if (trigger !== 'fallback') Object.assign(window, { IntersectionObserver });
    const priorities: string[] = [];
    runInNewContext(source, {
      document, window, IntersectionObserver, AbortController, URL,
      scheduleBackgroundTask(options: { priority: string }) {
        priorities.push(options.priority);
        return { done: new Promise(() => {}), cancel() {} };
      },
    });
    if (trigger === 'fallback') {
      assert.deepEqual(priorities, ['prefetch']);
      continue;
    }
    visibility!([{ isIntersecting: false }]);
    assert.deepEqual(priorities, []);
    if (trigger === 'proximity') visibility!([{ isIntersecting: true }]);
    else element.dispatchEvent(new Event(trigger));
    assert.deepEqual(priorities, ['navigation']);
    document.dispatchEvent(new Event('astro:before-swap'));
    element.dispatchEvent(new Event('focusin'));
    assert.equal(priorities.length, 1);
  }
});
