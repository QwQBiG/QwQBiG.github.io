import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { test } from 'node:test';
import { createPortraitCache, createPortraitSwitcher, decodePortrait } from '../src/utils/portrait.ts';

function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test('a ready newer expression does not wait for a superseded slow image', async () => {
  const slow = deferred<string>();
  const prepared: string[] = [];
  const shown: number[] = [];
  const switcher = createPortraitSwitcher({
    count: 4,
    load: (index) => index === 1 ? slow.promise : Promise.resolve(`image-${index}`),
    prepare: async (asset) => { prepared.push(asset); },
    fade: async (index) => { shown.push(index); },
    onChange: () => {},
  });

  switcher.next();
  switcher.next();
  await setImmediate();
  assert.deepEqual(shown, [2]);
  assert.equal(switcher.state.displayed, 2);
  assert.equal(switcher.state.busy, false);
  slow.resolve('image-1');
  await setImmediate();
  assert.deepEqual(prepared, ['image-2']);
  assert.deepEqual(shown, [2]);
});

test('rapid clicks preserve the current fade and then display only the latest request', async () => {
  const currentFade = deferred();
  const staleImage = deferred<string>();
  const prepared: number[] = [];
  const shown: number[] = [];
  const switcher = createPortraitSwitcher({
    count: 4,
    load: (index) => index === 2 ? staleImage.promise : Promise.resolve(`image-${index}`),
    prepare: async (_asset, index) => { prepared.push(index); },
    fade: (index) => {
      shown.push(index);
      return index === 1 ? currentFade.promise : Promise.resolve();
    },
    onChange: () => {},
  });

  switcher.next();
  await setImmediate();
  switcher.next();
  switcher.next();
  await setImmediate();
  assert.deepEqual(prepared, [1], 'the other layer cannot be overwritten during a fade');
  assert.deepEqual(shown, [1]);
  currentFade.resolve();
  await setImmediate();
  assert.deepEqual(prepared, [1, 3]);
  assert.deepEqual(shown, [1, 3]);
  assert.equal(switcher.state.displayed, 3);
  staleImage.resolve('image-2');
  await setImmediate();
  assert.deepEqual(shown, [1, 3]);
});

test('failed expression loads retry the same expression without changing the portrait', async () => {
  const requests: number[] = [];
  const switcher = createPortraitSwitcher({
    count: 4,
    load: async (index) => {
      requests.push(index);
      if (requests.length === 1) throw new Error('network unavailable');
      return `image-${index}`;
    },
    prepare: async () => {},
    fade: async () => {},
    onChange: () => {},
  });
  switcher.next();
  await setImmediate();
  assert.deepEqual(switcher.state, { displayed: 0, requested: 1, busy: false, failed: true });
  switcher.next();
  await setImmediate();
  assert.deepEqual(requests, [1, 1]);
  assert.deepEqual(switcher.state, { displayed: 1, requested: 1, busy: false, failed: false });
});

test('normal clicks retain the original four-expression cycle', async () => {
  const shown: number[] = [];
  const switcher = createPortraitSwitcher({
    count: 4,
    load: async (index) => index,
    prepare: async () => {},
    fade: async (index) => { shown.push(index); },
    onChange: () => {},
  });
  for (let click = 0; click < 4; click += 1) {
    switcher.next();
    await setImmediate();
  }
  assert.deepEqual(shown, [1, 2, 3, 0]);
});

test('decoded assets are reused and failed assets can be loaded again', async () => {
  const image = { decoded: true };
  let loads = 0;
  const cache = createPortraitCache(async (index) => {
    loads += 1;
    if (index === 2 && loads === 2) throw new Error('temporary image failure');
    return image;
  });
  const first = cache.load(1);
  assert.equal(cache.load(1), first);
  assert.equal(await first, image);
  assert.equal(await cache.load(1), image);
  assert.equal(loads, 1);
  await assert.rejects(cache.load(2), /temporary image failure/);
  assert.equal(await cache.load(2), image);
  assert.equal(loads, 3);
  cache.dispose();
});

test('removal aborts image work and prevents pending loads from touching detached layers', async () => {
  let aborted = false;
  const cache = createPortraitCache((_index, signal) => new Promise<string>((_resolve, reject) => {
    signal.addEventListener('abort', () => { aborted = true; reject(new Error('removed')); }, { once: true });
  }));
  const pendingImage = cache.load(1);
  cache.dispose();
  await assert.rejects(pendingImage, /removed/);
  await assert.rejects(cache.load(1), /Portrait removed/);
  assert.equal(aborted, true);

  for (const phase of ['loading', 'preparing', 'fading']) {
    const gate = deferred();
    const actions: string[] = [];
    const switcher = createPortraitSwitcher({
      count: 4,
      load: async () => { if (phase === 'loading') await gate.promise; return 'image'; },
      prepare: async () => { actions.push('prepare'); if (phase === 'preparing') await gate.promise; },
      fade: async () => { actions.push('fade'); if (phase === 'fading') await gate.promise; },
      onChange: (_state, reason) => { actions.push(reason); },
    });
    switcher.next();
    await setImmediate();
    switcher.dispose();
    const before = [...actions];
    gate.resolve();
    switcher.next();
    await setImmediate();
    assert.deepEqual(actions, before, `${phase}: removal must suppress later work and updates`);
  }
});

test('a new connection starts from the visible expression while the removed connection stays silent', async () => {
  const oldFade = deferred();
  const displays: number[] = [];
  const removed = createPortraitSwitcher({
    count: 4,
    load: async (index) => index,
    prepare: async () => {},
    fade: () => oldFade.promise,
    onChange: (_state, reason) => { if (reason === 'display') displays.push(-1); },
  });
  removed.next();
  await setImmediate();
  removed.dispose();
  // Reattachment reads the already visible layer, including a fade interrupted at removal.
  const reconnected = createPortraitSwitcher({
    count: 4,
    initial: 1,
    load: async (index) => index,
    prepare: async () => {},
    fade: async (index) => { displays.push(index); },
    onChange: () => {},
  });
  reconnected.next();
  oldFade.resolve();
  await setImmediate();
  assert.deepEqual(displays, [2]);
  assert.equal(reconnected.state.displayed, 2);
});

test('image decode supports older engines and always settles on load, failure, or removal', async () => {
  class ImageWithoutDecode extends EventTarget {
    complete = false;
    naturalWidth = 0;
  }
  const lifetime = new AbortController();
  const loaded = new ImageWithoutDecode();
  const loading = decodePortrait(loaded as unknown as HTMLImageElement, lifetime.signal);
  loaded.dispatchEvent(new Event('load'));
  await loading;

  const cached = new ImageWithoutDecode();
  cached.complete = true;
  cached.naturalWidth = 760;
  await decodePortrait(cached as unknown as HTMLImageElement, lifetime.signal);

  const broken = new ImageWithoutDecode();
  const failure = decodePortrait(broken as unknown as HTMLImageElement, lifetime.signal);
  broken.dispatchEvent(new Event('error'));
  await assert.rejects(failure, /Portrait image unavailable/);

  const waiting = new ImageWithoutDecode();
  const pending = decodePortrait(waiting as unknown as HTMLImageElement, lifetime.signal);
  const slowDecode = Object.assign(new ImageWithoutDecode(), { decode: () => new Promise<void>(() => {}) });
  const decoding = decodePortrait(slowDecode as unknown as HTMLImageElement, lifetime.signal);
  lifetime.abort();
  await assert.rejects(pending, /Portrait removed/);
  await assert.rejects(decoding, /Portrait removed/);
});
