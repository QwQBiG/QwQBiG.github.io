import { whenGalleryFullReady } from './gallery-images.ts';

export async function startGalleryEntrance(wall: HTMLElement) {
  const images = wall.querySelectorAll<HTMLImageElement>('[data-gallery-full]');
  const ready = Array.from(images, image => whenGalleryFullReady(image));

  // Give the first two frames a head start. CSS owns every departure after that.
  await Promise.all(ready.slice(0, 2));
  wall.ownerDocument.documentElement.removeAttribute('data-gallery-entrance');
}
