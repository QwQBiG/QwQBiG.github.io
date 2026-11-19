import type { PhotoItem, PhotoState } from '../types/photo';

interface PhotoWallSize {
  width: number;
  height: number;
}

// Ordered exactly like an HTML sizes list: use the first matching viewport.
export const photoWallTiers = [
  { width: 120, belowWidth: 480 },
  { width: 150, belowWidth: 768 },
  { width: 150, belowWidth: 1024, belowHeight: 480 },
] as const;
export const desktopPhotoWidth = 360;

export function photoWallMedia(tier: typeof photoWallTiers[number]) {
  const width = `(width < ${tier.belowWidth}px)`;
  return 'belowHeight' in tier ? `${width} and (height < ${tier.belowHeight}px)` : width;
}

export function photoWallSizes(scale: number) {
  return [...photoWallTiers.map(tier => `${photoWallMedia(tier)} ${tier.width * scale}px`),
    `${desktopPhotoWidth * scale}px`].join(', ');
}

export function photoWallCardWidth(viewport: PhotoWallSize) {
  return photoWallTiers.find(tier => viewport.width < tier.belowWidth
    && (!('belowHeight' in tier) || viewport.height < tier.belowHeight))?.width ?? desktopPhotoWidth;
}

export function photoAnchorY(width: number) {
  // Stored y is relative to this original anchor, rather than the geometric center.
  return width < 250 ? width * 0.6 : 100;
}

/** Reuse the static card's initial pose, keeping raw offsets across viewport changes. */
export function readInitialPhotoPosition(style: CSSStyleDeclaration, wall: PhotoWallSize, cardWidth: number): PhotoState {
  const x = parseFloat(style.getPropertyValue('--initial-x'));
  const y = parseFloat(style.getPropertyValue('--initial-y'));
  return {
    x: Number.isFinite(x) ? x : parseFloat(style.left) - wall.width / 2 + cardWidth / 2,
    y: Number.isFinite(y) ? y : parseFloat(style.top) - wall.height / 2 + photoAnchorY(cardWidth),
    rotation: parseFloat(style.getPropertyValue('--rotation')),
    zIndex: Number(style.zIndex),
  };
}

export function photoFrameHeightRatio(photo: Pick<PhotoItem, 'width' | 'height'>) {
  return photo.width && photo.height ? photo.height / photo.width : 1;
}

export function photoPositionBounds(wall: PhotoWallSize, cardWidth: number, ratio: number, rotation: number) {
  const cardHeight = 8 + (cardWidth - 8) * ratio; // 4px white frame on each edge
  const angle = rotation * Math.PI / 180;
  const cos = Math.abs(Math.cos(angle));
  const sin = Math.abs(Math.sin(angle));
  const maxX = Math.max(0, (wall.width - cardWidth * cos - cardHeight * sin) / 2 - 12);
  const radiusY = Math.max(0, (wall.height - cardWidth * sin - cardHeight * cos) / 2 - 12);
  const centerY = photoAnchorY(cardWidth) - cardHeight / 2;
  return { minX: -maxX, maxX, minY: centerY - radiusY, maxY: centerY + radiusY };
}

export function fitPhotoPosition(point: { x: number; y: number }, bounds: ReturnType<typeof photoPositionBounds>) {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, point.x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, point.y)),
  };
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

/** A card takes over its static thumbnail as soon as its own image can paint. */
export function whenPhotoSettles(image: HTMLImageElement, callback: () => void) {
  let active = true;
  function cleanup() {
    active = false;
    image.removeEventListener('load', loaded);
    image.removeEventListener('error', finish);
  }
  function finish() {
    if (!active) return;
    cleanup();
    callback();
  }
  function loaded() {
    image.removeEventListener('load', loaded);
    if (typeof image.decode === 'function') void image.decode().then(finish, finish);
    else finish();
  }
  image.addEventListener('load', loaded);
  image.addEventListener('error', finish);
  if (image.complete) loaded();
  return cleanup;
}

export function photoPreviewSize(photo: Pick<PhotoItem, 'previewWidth' | 'previewHeight' | 'width' | 'height'>, mobile: boolean) {
  const width = photo.previewWidth ?? photo.width;
  const height = photo.previewHeight ?? photo.height;
  const viewportWidth = mobile ? '95vw' : '85vw';
  if (!width || !height) return viewportWidth;
  // Match the preview's viewport and natural-size caps before choosing a source for the screen's DPR.
  return `min(${viewportWidth}, ${width}px, ${(mobile ? 86 : 92) * width / height}vh)`;
}

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
