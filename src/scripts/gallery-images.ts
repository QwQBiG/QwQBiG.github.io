type ImageReadiness = { promise: Promise<boolean>; decodedSource?: string };
const readiness = new WeakMap<HTMLImageElement, ImageReadiness>();

function waitForLoad(image: HTMLImageElement) {
  if (image.complete) return;
  return new Promise<void>(resolve => {
    const settle = () => {
      image.removeEventListener('load', settle);
      image.removeEventListener('error', settle);
      resolve();
    };
    image.addEventListener('load', settle);
    image.addEventListener('error', settle);
  });
}

async function decodeImage(image: HTMLImageElement): Promise<boolean> {
  if (typeof image.decode !== 'function') {
    await waitForLoad(image);
  } else {
    const source = image.currentSrc;
    try { await image.decode(); } catch {
      // A responsive candidate can be replaced while the first decode is in progress.
      if (image.currentSrc === source && image.complete) return false;
      await waitForLoad(image);
      if (!image.naturalWidth) return false;
      try { await image.decode(); } catch { return false; }
    }
  }
  return Boolean(image.naturalWidth);
}

export function whenGalleryImageReady(image: HTMLImageElement): Promise<boolean> {
  const cached = readiness.get(image);
  if (cached && (cached.decodedSource === undefined ||
      (image.complete && image.naturalWidth > 0 && cached.decodedSource === image.currentSrc))) {
    return cached.promise;
  }
  delete image.dataset.decoded;
  const entry: ImageReadiness = { promise: decodeImage(image) };
  readiness.set(image, entry);
  void entry.promise.then(decoded => {
    if (decoded) {
      entry.decodedSource = image.currentSrc;
      image.dataset.decoded = '';
    } else {
      readiness.delete(image);
    }
  });
  return entry.promise;
}

export function whenGalleryFullReady(image: HTMLImageElement, { retryFailedLoad = false } = {}): Promise<boolean> {
  const source = image.dataset.galleryFull;
  const activate = source && !image.src;
  const cached = readiness.get(image);
  const retry = retryFailedLoad && image.complete && !image.naturalWidth &&
    (!cached || cached.decodedSource !== undefined);
  if (activate || retry) {
    // sizes is already on the element. Install candidates before the fallback URL.
    const candidates = image.dataset.srcset || image.srcset;
    if (candidates) image.srcset = candidates;
    image.src = source || image.src;
  }
  return whenGalleryImageReady(image);
}
