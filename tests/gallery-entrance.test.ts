import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { startGalleryEntrance } from '../src/scripts/gallery-entrance.ts';

function pendingImage() {
  let finish!: () => void;
  let fail!: (error: Error) => void;
  const pending = new Promise<void>((resolve, reject) => { finish = resolve; fail = reject; });
  return Object.assign(new EventTarget(), {
    naturalWidth: 1024, complete: true, currentSrc: '/photo.webp', dataset: {} as { decoded?: string }, finish, fail, decodeCalls: 0,
    decode() { this.decodeCalls++; return pending; },
  });
}

function photo() {
  const thumb = pendingImage();
  const full = pendingImage();
  const picture = { querySelector: () => thumb, dataset: {} as { failed?: string } };
  const frame = { querySelector: (selector: string) => selector === 'picture' ? picture : full, dataset: {} as { awaitingPhoto?: string } };
  return { thumb, full, picture, frame };
}

function galleryWith(photos: ReturnType<typeof photo>[]) {
  const released: string[] = [];
  const wall = {
    ownerDocument: { documentElement: { removeAttribute(name: string) { released.push(name); } } },
    querySelectorAll: () => photos.map(photo => photo.frame),
  };
  return { released, wall: wall as unknown as HTMLElement };
}

test('the first two wall images start the stagger before any large preview is needed', async () => {
  const photos = [photo(), photo(), photo()];
  const { wall, released } = galleryWith(photos);
  const entrance = startGalleryEntrance(wall);
  assert.deepEqual(photos.map(p => p.thumb.decodeCalls), [1, 1, 1]);
  assert.deepEqual(photos.map(p => p.full.decodeCalls), [0, 0, 0]);

  photos[1].thumb.finish();
  await nextTurn();
  assert.deepEqual(released, []);
  photos[0].thumb.finish();
  await entrance;
  assert.deepEqual(released, ['data-gallery-entrance']);
  assert.deepEqual(photos.map(p => p.full.decodeCalls), [1, 1, 0]);
  assert.deepEqual(photos.map(p => p.frame.dataset.awaitingPhoto), [undefined, undefined, '']);

  photos[1].full.finish();
  await nextTurn();
  assert.equal(photos[2].full.decodeCalls, 1);
  photos[2].full.finish();
  await nextTurn();
  assert.equal(photos[2].frame.dataset.awaitingPhoto, undefined);
  assert.deepEqual(released, ['data-gallery-entrance']);
});

test('a stalled first wall image can still enter using its decoded preview', async () => {
  const item = photo();
  const { wall, released } = galleryWith([item]);
  await startGalleryEntrance(wall);
  assert.deepEqual(released, ['data-gallery-entrance']);
  assert.equal(item.frame.dataset.awaitingPhoto, '');
  assert.equal(item.full.decodeCalls, 1);
  item.full.finish();
  await nextTurn();
  assert.equal(item.frame.dataset.awaitingPhoto, undefined);
});

test('the placeholder appears only if both real images failed', async () => {
  const item = photo();
  const { wall } = galleryWith([item]);
  const entrance = startGalleryEntrance(wall);
  item.thumb.fail(new Error('Wall unavailable'));
  await entrance;
  assert.equal(item.picture.dataset.failed, undefined);
  item.full.fail(new Error('Preview unavailable'));
  await nextTurn();
  assert.equal(item.picture.dataset.failed, '');
  assert.equal(item.frame.dataset.awaitingPhoto, undefined);
  item.thumb.dispatchEvent(new Event('load'));
  assert.equal(item.picture.dataset.failed, undefined);
});
