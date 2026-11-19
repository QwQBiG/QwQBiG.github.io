import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const script = await readFile(new URL('../src/scripts/home-interactions.js', import.meta.url), 'utf8');
const pageTemplate = await readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const earlyScript = pageTemplate.match(/<script is:inline>([\s\S]*?)<\/script>/)![1];

function homePage(touch = false, search = '', storedReturn = false) {
  const preference = { matches: false };
  const location = new URL('https://example.test/' + search);
  const timers = new Map<number, () => void>();
  const frames: Array<() => void> = [];
  const flags = new Map<string, string>();
  const gridProperties = new Map<string, string>();
  const card = {
    style: { position: '' },
    parentElement: { style: { setProperty: (key: string, value: string) => gridProperties.set(key, value) } },
    getBoundingClientRect() { return { height: this.style.position === 'fixed' ? 52 : 332.25 }; },
    classList: { add() {}, remove() {} },
    setAttribute(key: string, value: string) { flags.set(key, value); },
    removeAttribute(key: string) { flags.delete(key); },
  };
  const link = Object.assign(new EventTarget(), {
    target: '', href: '/cs/', dataset: {} as Record<string, string>, download: false,
    hasAttribute(key: string) { return key === 'download' && this.download; },
    getAttribute() { return this.href; },
  });
  const storage = new Map<string, string>();
  if (storedReturn) storage.set('home-return-motion', '1');
  const dataset: { homeReturnMotion?: string } = {};
  const avatarPreload = { media: '(min-width: 924px)' };
  const document = Object.assign(new EventTarget(), {
    documentElement: { dataset, removeAttribute() { delete dataset.homeReturnMotion; } },
    getElementById: (id: string) => id === 'navCard' ? card : id === 'home-avatar-preload' ? avatarPreload : null,
    querySelector: () => null, querySelectorAll: () => [link],
  });
  const context = {
    URL, URLSearchParams, document,
    window: Object.assign(new EventTarget(), { location,
      history: { replaceState(_state: unknown, _unused: string, path: string) { location.href = new URL(path, location).href; } },
      matchMedia: (query: string) => query.includes('reduced-motion') ? preference : { matches: touch },
    }),
    sessionStorage: { getItem: (key: string) => storage.get(key), removeItem: (key: string) => storage.delete(key) },
    requestAnimationFrame: (run: () => void) => frames.push(run),
    setTimeout: (run: () => void, delay: number) => { timers.set(delay, run); return delay; },
    clearTimeout: (id: number) => timers.delete(id),
  };
  runInNewContext(earlyScript, context);
  runInNewContext(script, context);
  function click(props = {}) {
    const e = Object.assign(new Event('click', { cancelable: true }), { button: 0 }, props);
    return link.dispatchEvent(e); // true leaves the link's native navigation in charge
  }
  return { preference, location, link, flags, timers, frames, click, dataset, avatarPreload, gridProperties };
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

test('the narrow homepage reserves the card’s original height before its exit animation', () => {
  for (const narrow of [true, false]) {
    const page = homePage(narrow);
    page.click();
    while (page.frames.length) page.frames.shift()!();
    assert.equal(page.gridProperties.get('--home-nav-slot-height'), narrow ? '332.25px' : undefined);
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

test('avatar returns prepare the first paint and clear only their own marker', () => {
  for (const [url, expected] of [
    ['#home-return-motion', '/'],
    ['?source=series#home-return-motion', '/?source=series'],
    ['?homeReturnMotion=1&source=tags#navCard', '/?source=tags#navCard'],
    ['?source=series&homeReturnMotion=1#home-return-motion', '/?source=series'],
  ]) {
    const page = homePage(false, url);
    page.preference.matches = true;
    assert.equal(page.dataset.homeReturnMotion, '1');
    assert.equal(page.frames.length, 1);
    while (page.frames.length) page.frames.shift()!();
    assert.equal(page.dataset.homeReturnMotion, undefined);
    assert.equal(page.location.href, 'https://example.test' + expected);
    assert.equal(page.click(), true);
    assert.equal(page.timers.size, 0);
  }
});

test('ordinary homepage links keep their query and anchor, including a storage-only return', () => {
  const suffix = '?source=posts#navCard';
  const page = homePage(false, suffix);
  assert.equal(page.dataset.homeReturnMotion, undefined);
  assert.equal(page.frames.length, 0);
  const stored = homePage(false, suffix, true);
  assert.equal(stored.dataset.homeReturnMotion, '1');
  while (stored.frames.length) stored.frames.shift()!();
  assert.equal(stored.location.href, 'https://example.test/' + suffix);
});

test('the offscreen mobile avatar gets its early preload back for a compact avatar return', () => {
  assert.equal(homePage(true).avatarPreload.media, '(min-width: 924px)');
  for (const marker of ['#home-return-motion', '?homeReturnMotion=1']) {
    assert.equal(homePage(true, marker).avatarPreload.media, 'all');
  }
});
