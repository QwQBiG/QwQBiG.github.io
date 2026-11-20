import { startGalleryEntrance } from './gallery-entrance';
import { initializeGalleryInteractions } from './gallery-interactions';

const wall = document.querySelector<HTMLElement>('[data-photo-wall]');
if (wall) {
  void startGalleryEntrance(wall);
  const dispose = initializeGalleryInteractions(wall);
  // A history-cached page resumes with the same photos and event listeners.
  window.addEventListener('pagehide', event => {
    if (!event.persisted) dispose();
  });
}
