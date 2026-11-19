import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const script = await readFile(new URL('../src/scripts/home-interactions.js', import.meta.url), 'utf8');

function homePage(touch = false, search = '') {
  const preference = { matches: false };
  const location = new URL('https://example.test/' + search);
  const timers = new Map<number, () => void>();
  const frames: Array<() => void> = [];
  const flags = new Map<string, string>();
  const card = {
    style: {}, classList: { add() {}, remove() {} },
    setAttribute(key: string, value: string) { flags.set(key, value); },
    removeAttribute(key: string) { flags.delete(key); },
  };
  const link = Object.assign(new EventTarget(), {
    target: '', href: '/cs/', dataset: {} as Record<string, string>, download: false,
    hasAttribute(key: string) { return key === 'download' && this.download; },
    getAttribute() { return this.href; },
  });
  const storage = new Map<string, string>();
  const document = Object.assign(new EventTarget(), {
    documentElement: { removeAttribute() {} },
    getElementById: (id: string) => id === 'navCard' ? card : null,
    querySelector: () => null, querySelectorAll: () => [link],
  });
  runInNewContext(script, {
    URL, URLSearchParams, document,
    window: Object.assign(new EventTarget(), { location,
      history: { replaceState(_state: unknown, _unused: string, path: string) { location.href = new URL(path, location).href; } },
      matchMedia: (query: string) => query.includes('reduced-motion') ? preference : { matches: touch },
    }),
    sessionStorage: { getItem: (key: string) => storage.get(key), removeItem: (key: string) => storage.delete(key) },
    requestAnimationFrame: (run: () => void) => frames.push(run),
    setTimeout: (run: () => void, delay: number) => { timers.set(delay, run); return delay; },
    clearTimeout: (id: number) => timers.delete(id),
  });
  function click(props = {}) {
    const e = Object.assign(new Event('click', { cancelable: true }), { button: 0 }, props);
    return link.dispatchEvent(e); // true leaves the link's native navigation in charge
  }
  return { preference, location, link, flags, timers, frames, click };
}

test('a live reduced-motion preference keeps the native link, while normal clicks retain their animation', () => {
  for (const touch of [false, true]) {
    const page = homePage(touch);
    assert.equal(page.link.dataset.astroPrefetch, 'hover');
    page.preference.matches = true;
    assert.equal(page.click(), true);
    assert.equal(page.frames.length + page.timers.size + page.flags.size, 0);

    page.preference.matches = false;
    assert.equal(page.click(), false);
    assert.equal(page.flags.get('aria-busy'), 'true');
    const delay = touch ? 650 : 750;
    assert.deepEqual([...page.timers.keys()], [delay, delay + 3000]);
    assert.ok(page.frames.length > 0);
    page.preference.matches = true;
    assert.equal(page.click(), false); // A second click cannot race the pending navigation.
    page.timers.get(delay)!();
    assert.equal(page.location.pathname, '/cs/');
  }
});

test('modified clicks, downloads, new tabs and same-page links keep their native behavior', () => {
  const page = homePage();
  for (const props of [{ metaKey: true }, { ctrlKey: true }, { altKey: true }, { shiftKey: true }, { button: 1 }]) {
    assert.equal(page.click(props), true);
  }
  page.link.download = true;
  assert.equal(page.click(), true);
  page.link.download = false;
  page.link.target = '_blank';
  assert.equal(page.click(), true);
  page.link.target = '';
  page.link.href = '/#top';
  assert.equal(page.click(), true);
  assert.equal(page.frames.length + page.timers.size, 0);
});

test('returning through the avatar still completes the home transition and clears its marker', () => {
  const page = homePage(false, '?homeReturnMotion=1');
  page.preference.matches = true;
  assert.equal(page.frames.length, 1);
  while (page.frames.length) page.frames.shift()!();
  assert.equal(page.location.search, '');
  assert.equal(page.click(), true);
  assert.equal(page.timers.size, 0);
});
