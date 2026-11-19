import type { GalleryPhoto } from '../types/photo';

type PhotoDimensions = Partial<Pick<GalleryPhoto, 'width' | 'height'>>;

interface PhotoWallSize {
  width: number;
  height: number;
}

// Ordered exactly like an HTML sizes list: use the first matching viewport.
export const photoWallTiers = [
  { width: 120, belowWidth: 480 },
  { width: 120, belowWidth: 768, belowHeight: 400 },
  { width: 150, belowWidth: 768 },
  { width: 150, belowHeight: 560 },
  { width: 240, belowWidth: 1200 },
  { width: 240, belowHeight: 800 },
] as const;
export const desktopPhotoWidth = 360;

export function photoWallMedia(tier: typeof photoWallTiers[number]) {
  const conditions = [];
  if ('belowWidth' in tier) conditions.push(`(width < ${tier.belowWidth}px)`);
  if ('belowHeight' in tier) conditions.push(`(height < ${tier.belowHeight}px)`);
  return conditions.join(' and ');
}

export function photoWallSizes(scale: number) {
  return [...photoWallTiers.map(tier => `${photoWallMedia(tier)} ${tier.width * scale}px`),
    `${desktopPhotoWidth * scale}px`].join(', ');
}

export function photoAnchorY(width: number) {
  // Stored y is relative to this original anchor, rather than the geometric center.
  return width < 250 ? width * 0.6 : 100;
}

export function photoWallBreakpoints() {
  const compact = photoWallTiers.map(photoWallMedia).join(', ');
  return [
    `:root { --gallery-card-size: ${desktopPhotoWidth}px; }`,
    ...[...photoWallTiers].reverse().map(tier =>
      `@media ${photoWallMedia(tier)} { :root { --gallery-card-size: ${tier.width}px; } }`),
    `@media ${compact} {
      .gallery-main { height: 100dvh; flex: none; }
      body:has(.gallery-main) { min-height: 100dvh; }
      .photo-wall .photo-card { --anchor-y: calc(var(--frame-width) * .6); }
    }`,
  ].join('');
}

export function photoCardStyle(photo: Pick<GalleryPhoto, 'id' | 'scale'> & PhotoDimensions, index: number, count: number) {
  const direction = (index * 360 / count - 81) * Math.PI / 180;
  const rotation = [-5, 6, -4, 5, -6][index % 5];
  const radians = rotation * Math.PI / 180;
  const scale = photo.scale ?? 1;
  const prefix = `--photo-${photo.id}-`;
  return {
    '--scale': scale,
    '--ratio': photoFrameHeightRatio(photo),
    '--desktop-anchor': `${photoAnchorY(desktopPhotoWidth * scale)}px`,
    '--ring-cos': count > 1 ? Number(Math.cos(direction).toFixed(6)) : 0,
    '--ring-sin': count > 1 ? Number(Math.sin(direction).toFixed(6)) : 0,
    '--initial-x': `var(${prefix}x)`,
    '--initial-y': `var(${prefix}y)`,
    '--rotation': `var(${prefix}rotation, ${rotation}deg)`,
    '--cos': `var(${prefix}cos, ${Math.abs(Math.cos(radians))})`,
    '--sin': `var(${prefix}sin, ${Math.abs(Math.sin(radians))})`,
    'z-index': `var(${prefix}z, ${index})`,
  };
}

export function photoFrameHeightRatio(photo: PhotoDimensions) {
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

export function photoPreviewSize(photo: PhotoDimensions & Partial<Pick<GalleryPhoto, 'previewWidth' | 'previewHeight'>>, mobile: boolean) {
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

/** Convert a frame's visible center inside the wall to the original saved drag anchor. */
export function photoPositionFromCenter(center: { x: number; y: number }, wall: PhotoWallSize, frame: PhotoWallSize) {
  return {
    x: center.x - wall.width / 2,
    y: center.y - wall.height / 2 + photoAnchorY(frame.width) - frame.height / 2,
  };
}
