import test from 'node:test';
import assert from 'node:assert/strict';
import { listenForPointerDrag, preloadPhotos, resolvePhotoWallSize } from '../src/utils/photo-wall.ts';

test('a zero-height island measures the main instead of keeping desktop defaults', () => {
  assert.deepEqual(resolvePhotoWallSize(
    { width: 390, height: 0 },
    { width: 390, height: 844 },
    { width: 390, height: 844 },
  ), { width: 390, height: 844 });
});

test('a valid photo container takes priority over main and viewport dimensions', () => {
  assert.deepEqual(resolvePhotoWallSize(
    { width: 800, height: 600 },
    { width: 1280, height: 720 },
    { width: 1280, height: 720 },
  ), { width: 800, height: 600 });
});

test('a zero-height island follows the main size after a resize', () => {
  const portrait = resolvePhotoWallSize(
    { width: 390, height: 0 }, { width: 390, height: 844 }, { width: 390, height: 844 },
  );
  const landscape = resolvePhotoWallSize(
    { width: 844, height: 0 }, { width: 844, height: 390 }, { width: 844, height: 390 },
  );
  assert.deepEqual(portrait, { width: 390, height: 844 });
  assert.deepEqual(landscape, { width: 844, height: 390 });
});

test('a missing or unusable container falls back to the current viewport', () => {
  assert.deepEqual(resolvePhotoWallSize(null, null, { width: 1024, height: 768 }),
    { width: 1024, height: 768 });
  assert.deepEqual(resolvePhotoWallSize(
    { width: NaN, height: 600 }, { width: 390, height: 0 }, { width: 390, height: 844 },
  ), { width: 390, height: 844 });
});

function pointer(type: string, pointerId: number, clientX = 0, clientY = 0) {
  const event = new Event(type);
  Object.defineProperties(event, {
    pointerId: { value: pointerId },
    clientX: { value: clientX },
    clientY: { value: clientY },
  });
  return event;
}

test('a drag follows its own pointer and removes all listeners on release', () => {
  const target = new EventTarget();
  const moves: number[] = [];
  let releases = 0;
  let cancels = 0;
  listenForPointerDrag(target, 7, {
    onMove: (event) => moves.push(event.clientX),
    onEnd: () => {
      releases++;
      target.dispatchEvent(pointer('pointermove', 7, 99));
    },
    onCancel: () => cancels++,
  });
  target.dispatchEvent(pointer('pointermove', 8, 12));
  target.dispatchEvent(pointer('pointerup', 8));
  target.dispatchEvent(pointer('pointercancel', 8));
  target.dispatchEvent(pointer('pointermove', 7, 24));
  target.dispatchEvent(pointer('pointerup', 7));
  target.dispatchEvent(pointer('pointercancel', 7));
  assert.deepEqual(moves, [24]);
  assert.equal(releases, 1);
  assert.equal(cancels, 0);
});

test('pointer cancellation ends the drag without treating it as a click', () => {
  const target = new EventTarget();
  const events: string[] = [];
  listenForPointerDrag(target, 3, {
    onMove: () => events.push('move'),
    onEnd: () => events.push('release'),
    onCancel: () => events.push('cancel'),
  });
  target.dispatchEvent(pointer('pointercancel', 3));
  target.dispatchEvent(pointer('pointermove', 3));
  target.dispatchEvent(pointer('pointerup', 3));
  assert.deepEqual(events, ['cancel']);
});

test('unmount cleanup is idempotent and lets the next visit bind a fresh drag', () => {
  const target = new EventTarget();
  let oldCallbacks = 0;
  const old = listenForPointerDrag(target, 1, {
    onMove: () => oldCallbacks++,
    onEnd: () => oldCallbacks++,
    onCancel: () => oldCallbacks++,
  });
  old();
  old();
  let newCallbacks = 0;
  listenForPointerDrag(target, 1, {
    onMove: () => newCallbacks++,
    onEnd: () => newCallbacks++,
    onCancel: () => newCallbacks++,
  });
  target.dispatchEvent(pointer('pointermove', 1));
  target.dispatchEvent(pointer('pointerup', 1));
  target.dispatchEvent(pointer('pointercancel', 1));
  assert.equal(oldCallbacks, 0);
  assert.equal(newCallbacks, 2);
});

function mockImage(complete = false, decode?: () => Promise<void>) {
  return {
    src: '',
    complete,
    decode,
    onload: null as (() => void) | null,
    onerror: null as (() => void) | null,
  };
}

test('thumbnail readiness handles cached images without the decode API', async () => {
  const image = mockImage(true);
  await preloadPhotos([{ src: '/cached.webp' }], () => image as unknown as HTMLImageElement);
  assert.equal(image.src, '/cached.webp');
  assert.equal(image.onload, null);
  assert.equal(image.onerror, null);
});

test('a failed thumbnail or decode cannot leave the wall permanently blocked', async () => {
  const failed = mockImage();
  const decodeFailed = mockImage(true, () => Promise.reject(new Error('decode failed')));
  const images = [failed, decodeFailed];
  const ready = preloadPhotos([{ src: '/missing.webp' }, { src: '/invalid.webp' }],
    () => images.shift() as unknown as HTMLImageElement);
  failed.onerror?.();
  await ready;
  assert.equal(failed.onerror, null);
  assert.equal(decodeFailed.onload, null);
});

test('a slow thumbnail keeps the static wall until decoding finishes', async () => {
  let finishDecode!: () => void;
  const decoding = new Promise<void>((resolve) => { finishDecode = resolve; });
  const image = mockImage(false, () => decoding);
  let isReady = false;
  const ready = preloadPhotos([{ src: '/slow.webp' }],
    () => image as unknown as HTMLImageElement).then(() => { isReady = true; });
  image.onload?.();
  await Promise.resolve();
  assert.equal(isReady, false);
  finishDecode();
  await ready;
  assert.equal(isReady, true);
});
