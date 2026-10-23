import type { PhotoItem } from '../types/photo';

interface PhotoWallSize {
  width: number;
  height: number;
}

export function resolvePhotoWallSize(
  container: PhotoWallSize | null | undefined,
  main: PhotoWallSize | null | undefined,
  viewport: PhotoWallSize,
): PhotoWallSize {
  const measured = [container, main].find((size) => size
    && Number.isFinite(size.width) && size.width > 0
    && Number.isFinite(size.height) && size.height > 0) ?? viewport;
  return { width: measured.width, height: measured.height };
}

// Keep the static wall visible until every thumbnail has either decoded or failed.
export const preloadPhotos = (
  photos: readonly Pick<PhotoItem, 'src'>[],
  createImage: () => HTMLImageElement = () => new Image(),
) => Promise.all(photos.map((photo) => new Promise<void>((resolve) => {
  const image = createImage();
  let decoding = false;
  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    image.onload = null;
    image.onerror = null;
    resolve();
  };
  const decode = () => {
    if (decoding || settled) return;
    decoding = true;
    Promise.resolve().then(() => image.decode?.()).catch(() => {}).then(finish);
  };

  image.onload = decode;
  image.onerror = finish;
  image.src = photo.src;
  if (image.complete) decode();
})));

interface PointerDragCallbacks {
  onMove: (event: PointerEvent) => void;
  onEnd: (event: PointerEvent) => void;
  onCancel: (event: PointerEvent) => void;
}

// One pointer owns a drag; every completion path removes the window listeners.
export function listenForPointerDrag(
  target: EventTarget,
  pointerId: number,
  { onMove, onEnd, onCancel }: PointerDragCallbacks,
) {
  let active = true;
  const move = (event: Event) => {
    const pointer = event as PointerEvent;
    if (active && pointer.pointerId === pointerId) onMove(pointer);
  };
  const end = (event: Event) => {
    const pointer = event as PointerEvent;
    if (!active || pointer.pointerId !== pointerId) return;
    cleanup();
    onEnd(pointer);
  };
  const cancel = (event: Event) => {
    const pointer = event as PointerEvent;
    if (!active || pointer.pointerId !== pointerId) return;
    cleanup();
    onCancel(pointer);
  };
  const cleanup = () => {
    if (!active) return;
    active = false;
    target.removeEventListener('pointermove', move);
    target.removeEventListener('pointerup', end);
    target.removeEventListener('pointercancel', cancel);
  };

  target.addEventListener('pointermove', move, { passive: true });
  target.addEventListener('pointerup', end);
  target.addEventListener('pointercancel', cancel);
  return cleanup;
}
