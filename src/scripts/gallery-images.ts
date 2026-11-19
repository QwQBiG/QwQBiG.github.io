// The wall and the dialog share one image element, request and decoded bitmap.
const readiness = new WeakMap<HTMLImageElement, Promise<boolean>>();

async function decodeFullImage(image: HTMLImageElement): Promise<boolean> {
  if (typeof image.decode === 'function') {
    try { await image.decode(); } catch { return false; }
  } else if (!image.complete) {
    await new Promise<void>(resolve => {
      const settle = () => {
        image.removeEventListener('load', settle);
        image.removeEventListener('error', settle);
        resolve();
      };
      image.addEventListener('load', settle);
      image.addEventListener('error', settle);
    });
  }
  if (!image.naturalWidth) return false;
  image.dataset.decoded = '';
  return true;
}

export function whenGalleryFullReady(image: HTMLImageElement, { retryFailedLoad = false } = {}): Promise<boolean> {
  let ready = readiness.get(image);
  if (!ready) {
    // Retry a failed request when the reader opens this photo again.
    if (retryFailedLoad && image.complete && !image.naturalWidth) image.src = image.src;
    ready = decodeFullImage(image);
    readiness.set(image, ready);
    void ready.then(decoded => {
      if (!decoded) readiness.delete(image);
    });
  }
  return ready;
}
