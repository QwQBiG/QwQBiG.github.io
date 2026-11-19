import { whenGalleryFullReady } from './gallery-images';

export async function startGalleryEntrance(wall: HTMLElement) {
  // Start all decodes together. Only the order in which the cards depart is serial.
  const photos = Array.from(wall.querySelectorAll<HTMLElement>('.photo-card'), card => {
    const full = card.querySelector<HTMLImageElement>('[data-gallery-full]');
    return { card, ready: full && whenGalleryFullReady(full) };
  });
  const root = document.documentElement;
  const staggerMs = Number(wall.dataset.staggerMs);
  for (const [index, photo] of photos.entries()) {
    if (!root.hasAttribute('data-gallery-entrance')) return;
    if (index > 0) await new Promise(resolve => setTimeout(resolve, staggerMs));
    const sharp = await photo.ready;
    // CSS already started any remaining cards if the deadline passed.
    if (!root.hasAttribute('data-gallery-entrance')) return;
    photo.card.dataset.entry = sharp ? 'sharp' : 'fallback';
  }
}
