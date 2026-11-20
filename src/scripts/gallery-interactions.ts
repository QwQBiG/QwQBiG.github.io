import { whenGalleryFullReady } from './gallery-images';
import { fitPhotoPosition, listenForPointerDrag, photoPositionFromCenter, photoPositionBounds, photoPreviewSize } from '../utils/photo-wall';

function displayPhoto(card: HTMLAnchorElement, dialog: HTMLDialogElement, closeButton: HTMLButtonElement) {
  const thumbnail = card.querySelector<HTMLImageElement>('picture img')!;
  const full = card.querySelector<HTMLImageElement>('[data-gallery-full]')!;
  dialog.setAttribute('aria-label', thumbnail.alt || 'Photo preview');
  const dimensions = {
    previewWidth: Number(card.dataset.previewWidth) || thumbnail.naturalWidth || thumbnail.width,
    previewHeight: Number(card.dataset.previewHeight) || thumbnail.naturalHeight || thumbnail.height,
  };
  const compact = photoPreviewSize(dimensions, true);
  const desktop = photoPreviewSize(dimensions, false);
  closeButton.style.setProperty('--preview-compact-width', compact);
  closeButton.style.setProperty('--preview-width', desktop);
  closeButton.style.aspectRatio = `${dimensions.previewWidth} / ${dimensions.previewHeight}`;

  const holder = full.parentElement!;
  const previousPriority = full.fetchPriority;
  full.fetchPriority = 'high';
  const ready = whenGalleryFullReady(full, { retryFailedLoad: true });
  const alreadyDecoded = full.hasAttribute('data-decoded');
  let showing = true;
  let fade: Animation | undefined;

  function showThumbnail() {
    if (!thumbnail.complete || !thumbnail.naturalWidth) return;
    // Keep real wall pixels under the full-size reveal, including transparent edges.
    closeButton.style.backgroundImage = `url(${JSON.stringify(thumbnail.currentSrc)})`;
  }

  if (alreadyDecoded) {
    closeButton.dataset.sharp = '';
  } else {
    showThumbnail();
    thumbnail.addEventListener('load', showThumbnail, { once: true });
  }
  closeButton.append(full);

  if (!alreadyDecoded) {
    void ready.then(decoded => {
      if (!decoded || !showing || !dialog.open || dialog.hasAttribute('data-closing')) return;
      thumbnail.removeEventListener('load', showThumbnail);
      closeButton.dataset.sharp = '';
      if (matchMedia('(prefers-reduced-motion: reduce)').matches || !full.animate) {
        closeButton.style.removeProperty('background-image');
        return;
      }
      // Only the decoded image fades in. The existing pixels stay fully visible underneath.
      fade = full.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140, easing: 'ease-out' });
      void fade.finished.then(() => {
        if (showing) closeButton.style.removeProperty('background-image');
      }, () => {});
    });
  }
  return () => {
    showing = false;
    thumbnail.removeEventListener('load', showThumbnail);
    fade?.cancel();
    full.fetchPriority = previousPriority;
    holder.append(full);
    delete closeButton.dataset.sharp;
    closeButton.style.removeProperty('background-image');
  };
}

function openPreview(card: HTMLAnchorElement, onClose: () => void) {
  const photos = [...card.parentElement!.querySelectorAll<HTMLAnchorElement>('a.photo-card[data-photo-id]')];
  let index = photos.indexOf(card);
  const dialog = document.createElement('dialog');
  dialog.className = 'gallery-preview';
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close photo preview');
  dialog.append(closeButton);
  let releasePhoto = displayPhoto(card, dialog, closeButton);

  function changePhoto(step: number) {
    if (photos.length < 2 || dialog.hasAttribute('data-closing')) return;
    releasePhoto();
    index = (index + step + photos.length) % photos.length;
    releasePhoto = displayPhoto(photos[index], dialog, closeButton);
  }
  function dispose() {
    if (!dialog.isConnected) return;
    if (dialog.open) dialog.close();
    releasePhoto();
    dialog.remove();
    if (photos[index] !== card) photos[index].focus({ preventScroll: true });
    onClose();
  }
  function dismiss() {
    if (dialog.hasAttribute('data-closing')) return;
    dialog.dataset.closing = '';
    const animations = dialog.getAnimations();
    if (animations.length) {
      void Promise.allSettled(animations.map(animation => animation.finished)).then(dispose);
    } else {
      dispose();
    }
  }
  dialog.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      changePhoto(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  let start: { x: number; y: number; id: number } | undefined;
  let swiped = false;
  dialog.addEventListener('pointerdown', event => {
    swiped = false;
    start = event.pointerType === 'touch' && event.isPrimary
      ? { x: event.clientX, y: event.clientY, id: event.pointerId } : undefined;
  });
  dialog.addEventListener('pointercancel', () => { start = undefined; });
  dialog.addEventListener('pointerup', event => {
    if (!start || event.pointerId !== start.id) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    start = undefined;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    swiped = true;
    changePhoto(dx < 0 ? 1 : -1);
  });
  dialog.addEventListener('click', event => {
    if (!swiped || event.detail === 0) dismiss();
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  document.body.append(dialog);
  dialog.showModal();
  return dispose;
}

function isModified(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.altKey || event.shiftKey;
}

export function initializeGalleryInteractions(wall: HTMLElement) {
  const lifetime = new AbortController();
  const options = { signal: lifetime.signal };
  let highestZ: number | undefined;
  let cancelDrag: (() => void) | undefined;
  let suppressClick: HTMLAnchorElement | undefined;
  let disposePreview: (() => void) | undefined;

  const findCard = (event: Event) => event.target instanceof Element
    ? event.target.closest<HTMLAnchorElement>('a.photo-card[data-photo-id]') : null;

  wall.dataset.interactive = '';
  wall.addEventListener('pointerdown', event => {
    const target = findCard(event);
    if (!target || cancelDrag || !event.isPrimary || event.button !== 0 || isModified(event)) return;
    const card: HTMLAnchorElement = target;
    suppressClick = undefined;
    const animation = card.getAnimations?.().find(effect =>
      'animationName' in effect && effect.animationName === 'gallery-entrance',
    );
    const entrance = animation?.playState === 'running' ? animation : undefined;
    entrance?.pause();

    // The flight and the anchored card share a center transform origin. Take the
    // visible center in wall coordinates so grabbing a moving frame never snaps to its destination.
    const style = getComputedStyle(card);
    const box = card.getBoundingClientRect();
    const wallBox = wall.getBoundingClientRect();
    const size = { width: wall.clientWidth, height: wall.clientHeight };
    const frame = { width: card.offsetWidth, height: parseFloat(style.height) };
    const start = photoPositionFromCenter({
      x: box.left + box.width / 2 - wallBox.left,
      y: box.top + box.height / 2 - wallBox.top,
    }, size, frame);
    const destination = photoPositionFromCenter({
      x: parseFloat(style.left) + frame.width / 2,
      y: parseFloat(style.top) + frame.height / 2,
    }, size, frame);
    const rotation = parseFloat(style.getPropertyValue('--rotation')) || 0;
    const bounds = photoPositionBounds(size, frame.width, Number(card.dataset.ratio) || 1, rotation);
    let current = start;
    let moved = false;
    const pointer = event.pointerId;
    const down = { x: event.clientX, y: event.clientY };
    highestZ ??= Math.max(0, ...Array.from(wall.querySelectorAll('.photo-card'), el => Number(getComputedStyle(el).zIndex) || 0));
    const zIndex = ++highestZ;
    card.style.zIndex = String(zIndex);
    card.setPointerCapture(pointer);

    function move(next: PointerEvent) {
      const dx = next.clientX - down.x;
      const dy = next.clientY - down.y;
      if (!moved) {
        if (Math.hypot(dx, dy) < 6) return;
        moved = true;
        card.dataset.dragging = '';
        if (entrance && entrance.playState !== 'idle') {
          // Keep the remaining tilt/scale while the card lifts into the reader's hand.
          const pose = new DOMMatrixReadOnly(style.transform === 'none' ? undefined : style.transform);
          const opacity = style.opacity;
          entrance.cancel();
          if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
            card.animate([
              { transform: `matrix(${pose.a},${pose.b},${pose.c},${pose.d},0,0)`, opacity },
              { transform: 'none', opacity: 1 },
            ], { duration: 140, easing: 'ease-out' });
          }
        }
      }
      current = fitPhotoPosition({ x: start.x + dx, y: start.y + dy }, bounds);
      // Translation can stay on the compositor until the last pointer event.
      card.style.translate = `${current.x - destination.x}px ${current.y - destination.y}px`;
    }

    function finish() {
      if (cancelDrag !== finish) return;
      cancelDrag = undefined;
      stopListening();
      card.removeEventListener('lostpointercapture', finish);
      window.removeEventListener('blur', finish);
      window.removeEventListener('resize', finish);
      if (card.hasPointerCapture(pointer)) card.releasePointerCapture(pointer);
      if (moved) {
        suppressClick = card;
        card.style.setProperty('--initial-x', `${current.x}px`);
        card.style.setProperty('--initial-y', `${current.y}px`);
        card.style.removeProperty('translate');
        delete card.dataset.dragging;
        try {
          localStorage.setItem('photo-wall-' + card.dataset.photoId, JSON.stringify({ ...current, rotation, zIndex }));
        } catch { /* Dragging still works when storage is unavailable. */ }
      } else if (entrance && entrance.playState !== 'idle' && entrance.playState !== 'finished') {
        // play() also reverses a pending pause when a quick tap ends in the same frame.
        entrance.play();
      }
    }
    const stopListening = listenForPointerDrag(window, pointer, {
      onMove: move,
      onEnd: end => { move(end); finish(); },
      onCancel: finish,
    });
    card.addEventListener('lostpointercapture', finish);
    window.addEventListener('blur', finish);
    window.addEventListener('resize', finish);
    cancelDrag = finish;
  }, options);

  wall.addEventListener('click', event => {
    const card = findCard(event);
    if (!card || event.defaultPrevented || event.button !== 0 || isModified(event)) return;
    if (event.detail && suppressClick === card) {
      event.preventDefault();
      suppressClick = undefined;
      return;
    }
    if (typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) return;
    event.preventDefault();
    disposePreview?.();
    disposePreview = openPreview(card, () => { disposePreview = undefined; });
  }, options);

  return () => {
    cancelDrag?.();
    disposePreview?.();
    lifetime.abort();
    delete wall.dataset.interactive;
  };
}
