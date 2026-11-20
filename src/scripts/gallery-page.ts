import { startGalleryEntrance } from './gallery-entrance';
import { initializeGalleryInteractions } from './gallery-interactions';

const wall = document.querySelector<HTMLElement>('[data-photo-wall]');
if (wall) {
  void startGalleryEntrance(wall);
  // Clear the backing image after decode so transparent pixels show the white frame.
  for (const image of wall.querySelectorAll<HTMLImageElement>('picture > img')) {
    const picture = image.parentElement!;
    const showImage = async () => {
      try { await image.decode?.(); } catch { return; }
      picture.dataset.loaded = '';
      delete picture.dataset.failed;
    };
    const showPlaceholder = () => {
      delete picture.dataset.loaded;
      picture.dataset.failed = '';
    };
    image.addEventListener('load', showImage);
    image.addEventListener('error', showPlaceholder);
    if (image.complete) {
      if (image.naturalWidth) void showImage();
      else showPlaceholder();
    }
  }
  const dispose = initializeGalleryInteractions(wall);
  // A history-cached page resumes with the same photos and event listeners.
  window.addEventListener('pagehide', event => {
    if (!event.persisted) dispose();
  });
}
