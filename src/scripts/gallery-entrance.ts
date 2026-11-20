import { whenGalleryFullReady, whenGalleryImageReady } from './gallery-images.ts';

export async function startGalleryEntrance(wall: HTMLElement) {
  const frames = wall.querySelectorAll<HTMLElement>('.photo-frame');
  const photos = Array.from(frames, frame => {
    const picture = frame.querySelector('picture')!;
    const thumbnail = picture.querySelector('img')!;
    const preview = frame.querySelector<HTMLImageElement>('[data-gallery-full]')!;
    frame.dataset.awaitingPhoto = '';

    async function warmPreview() {
      if (await whenGalleryFullReady(preview)) {
        delete frame.dataset.awaitingPhoto;
      } else {
        void wallReady.then(loaded => {
          if (!loaded && 'awaitingPhoto' in frame.dataset) {
            picture.dataset.failed = '';
            delete frame.dataset.awaitingPhoto;
          }
        });
      }
    }
    const wallReady = whenGalleryImageReady(thumbnail).then(loaded => {
      if (loaded) delete frame.dataset.awaitingPhoto;
      else {
        // A different wall candidate can recover after rotation or a network error.
        thumbnail.addEventListener('load', () => {
          delete picture.dataset.failed;
          delete frame.dataset.awaitingPhoto;
        }, { once: true });
        void warmPreview();
      }
      return loaded;
    });
    return { frame, wallReady, warmPreview };
  });

  // Give the leading wall images a head start, even when one request stalls.
  await new Promise<void>(resolve => {
    const timeout = setTimeout(() => {
      // A stalled thumbnail can still be replaced with its preview.
      for (const photo of photos) {
        if ('awaitingPhoto' in photo.frame.dataset) void photo.warmPreview();
      }
      resolve();
    }, 1600);
    const wallImages = photos.map(photo => photo.wallReady);
    void Promise.all(wallImages.slice(0, 2)).then(() => resolve());
    void Promise.all(wallImages).then(() => clearTimeout(timeout));
  });
  wall.ownerDocument.documentElement.removeAttribute('data-gallery-entrance');
  // Leave bandwidth for the photo a reader taps. Opening the dialog skips this queue.
  const remaining = photos.values();
  async function warmInOrder() {
    for (const photo of remaining) await photo.warmPreview();
  }
  void warmInOrder();
  void warmInOrder();
}
