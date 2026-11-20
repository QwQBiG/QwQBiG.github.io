import assert from 'node:assert/strict';
import test from 'node:test';
import { whenGalleryFullReady, whenGalleryImageReady } from '../src/scripts/gallery-images.ts';

class TestImage extends EventTarget {
  complete = false;
  naturalWidth = 0;
  src = '';
  srcset = '';
  currentSrc = '';
  dataset: { decoded?: string; galleryFull?: string; srcset?: string } = {};
  decode?: () => Promise<void>;
}

function ready(image: TestImage) {
  return whenGalleryFullReady(image as unknown as HTMLImageElement);
}

test('wall readiness leaves deferred preview sources untouched until the first preview request', async () => {
  const wall = new TestImage();
  wall.complete = true;
  wall.naturalWidth = 180;
  const preview = new TestImage();
  const element = preview as unknown as HTMLImageElement;
  preview.dataset.galleryFull = '/gallery/full.webp';
  preview.dataset.srcset = '/gallery/compact.webp 480w, /gallery/full.webp 1200w';
  const writes: [string, string][] = [];
  for (const name of ['srcset', 'src'] as const) {
    let value = '';
    Object.defineProperty(preview, name, {
      get: () => value,
      set: (next: string) => {
        value = next;
        preview.complete = false;
        writes.push([name, next]);
      },
    });
  }
  assert.equal(await whenGalleryImageReady(wall as unknown as HTMLImageElement), true);
  assert.deepEqual(writes, []);

  const first = ready(preview);
  assert.deepEqual(writes, [['srcset', preview.dataset.srcset], ['src', preview.dataset.galleryFull]]);
  assert.equal(whenGalleryFullReady(element, { retryFailedLoad: true }), first);
  preview.complete = true;
  preview.dispatchEvent(new Event('error'));
  assert.equal(await first, false);
  const retry = whenGalleryFullReady(element, { retryFailedLoad: true });
  assert.equal(whenGalleryFullReady(element, { retryFailedLoad: true }), retry);
  assert.deepEqual(writes.slice(2), writes.slice(0, 2));
  preview.currentSrc = '/gallery/compact.webp';
  preview.complete = true;
  preview.naturalWidth = 480;
  preview.dispatchEvent(new Event('load'));
  assert.equal(await retry, true);
  assert.equal(whenGalleryImageReady(element), retry);
});

test('a new responsive candidate gets decoded after a change of viewport size', async () => {
  const image = new TestImage();
  const element = image as unknown as HTMLImageElement;
  image.complete = true;
  image.naturalWidth = 480;
  image.currentSrc = '/gallery/compact.webp';
  let calls = 0;
  image.decode = async () => { calls++; };
  const first = whenGalleryImageReady(element);
  assert.equal(await first, true);
  assert.equal(whenGalleryFullReady(element), first);
  image.currentSrc = '/gallery/wide.webp';
  const second = whenGalleryFullReady(element);
  assert.notEqual(second, first);
  assert.equal(image.dataset.decoded, undefined);
  assert.equal(await second, true);
  assert.equal(image.dataset.decoded, '');
  assert.equal(calls, 2);
});

test('the wall and preview share a decode and keep the thumbnail until it finishes', async () => {
  const image = new TestImage();
  let finishDecode!: () => void;
  let decodeCalls = 0;
  image.decode = () => {
    decodeCalls++;
    return new Promise<void>(resolve => { finishDecode = resolve; });
  };

  const wall = ready(image);
  image.naturalWidth = 1254;
  image.complete = true;
  image.dispatchEvent(new Event('load'));
  const preview = ready(image);
  assert.equal(wall, preview);
  assert.equal(image.dataset.decoded, undefined);

  finishDecode();
  assert.equal(await preview, true);
  assert.equal(image.dataset.decoded, '');
  assert.equal(ready(image), wall);
  assert.equal(decodeCalls, 1);
});

test('a decode failure keeps the fallback even after the full image reports a size', async () => {
  const image = new TestImage();
  image.complete = true;
  image.naturalWidth = 1254;
  image.decode = async () => { throw new Error('Invalid image'); };

  assert.equal(await ready(image), false);
  assert.equal(image.dataset.decoded, undefined);
});

test('reopening after a failed request retries the same URL once and shares the result', async () => {
  const image = new TestImage();
  const element = image as unknown as HTMLImageElement;
  const url = 'https://example.test/gallery/full.webp';
  const retriedUrls: string[] = [];
  Object.defineProperty(image, 'src', {
    get: () => url,
    set: (value: string) => {
      retriedUrls.push(value);
      image.complete = false;
    },
  });
  let finishDecode!: () => void;
  let decodeCalls = 0;
  image.decode = () => {
    decodeCalls++;
    if (decodeCalls === 1) return Promise.reject(new Error('Connection interrupted'));
    return new Promise<void>(resolve => { finishDecode = resolve; });
  };

  image.complete = true;
  assert.equal(await ready(image), false);
  assert.deepEqual(retriedUrls, []);
  const reopen = () => whenGalleryFullReady(element, { retryFailedLoad: true });
  const pending = reopen();
  assert.deepEqual(retriedUrls, [url]);
  assert.equal(reopen(), pending);
  assert.equal(ready(image), pending);
  assert.equal(image.dataset.decoded, undefined);

  image.complete = true;
  image.naturalWidth = 1024;
  finishDecode();
  assert.equal(await pending, true);
  assert.equal(image.dataset.decoded, '');
  assert.equal(reopen(), pending);
  assert.deepEqual(retriedUrls, [url]);
  assert.equal(decodeCalls, 2);
});

test('without decode, both cached and pending images need a successful load', async () => {
  for (const alreadyComplete of [false, true]) {
    for (const width of [0, 1024]) {
      const image = new TestImage();
      image.complete = alreadyComplete;
      image.naturalWidth = alreadyComplete ? width : 0;
      const result = ready(image);
      if (!alreadyComplete) {
        assert.equal(image.dataset.decoded, undefined);
        image.complete = true;
        image.naturalWidth = width;
        image.dispatchEvent(new Event(width ? 'load' : 'error'));
      }
      assert.equal(await result, width > 0);
      assert.equal(image.dataset.decoded, width ? '' : undefined);
    }
  }
});
