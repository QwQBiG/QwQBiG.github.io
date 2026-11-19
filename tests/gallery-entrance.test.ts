import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { startGalleryEntrance } from '../src/scripts/gallery-entrance.ts';

function pendingPhoto() {
  let finish!: () => void;
  let fail!: (error: Error) => void;
  const pending = new Promise<void>((resolve, reject) => { finish = resolve; fail = reject; });
  const image = {
    naturalWidth: 1024,
    dataset: {} as { decoded?: string },
    decodeCalls: 0,
    decode() { this.decodeCalls++; return pending; },
  };
  return { image, finish, fail };
}

function galleryWith(photos: ReturnType<typeof pendingPhoto>[]) {
  const released: string[] = [];
  const wall = {
    ownerDocument: { documentElement: { removeAttribute(name: string) { released.push(name); } } },
    querySelectorAll: () => photos.map(photo => photo.image),
  };
  return { released, wall: wall as unknown as HTMLElement };
}

test('all gallery photos decode in parallel and a late photo cannot hold or restart the entrance', async () => {
  const photos = [pendingPhoto(), pendingPhoto(), pendingPhoto()];
  const { wall, released } = galleryWith(photos);
  const entrance = startGalleryEntrance(wall);
  assert.deepEqual(photos.map(photo => photo.image.decodeCalls), [1, 1, 1]);

  photos[1].finish();
  await nextTurn();
  assert.deepEqual(released, []);
  photos[0].finish();
  await nextTurn();
  assert.deepEqual(released, ['data-gallery-entrance']);
  assert.equal(photos[2].image.dataset.decoded, undefined);

  photos[2].finish();
  await entrance;
  await nextTurn();
  assert.equal(photos[2].image.dataset.decoded, '');
  assert.deepEqual(released, ['data-gallery-entrance']);
});

test('a single photo can enter with its fallback after a decode failure', async () => {
  const photo = pendingPhoto();
  const { wall, released } = galleryWith([photo]);
  const entrance = startGalleryEntrance(wall);
  photo.fail(new Error('Image unavailable'));
  await entrance;
  assert.deepEqual(released, ['data-gallery-entrance']);
  assert.equal(photo.image.dataset.decoded, undefined);
});
