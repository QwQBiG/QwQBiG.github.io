export type NavigationAsset = {
  url: string;
  type: 'style' | 'script' | 'image' | 'font';
  bytes: number;
  sources?: { url: string; width: number }[];
  sizes?: string;
};
export type NavigationManifest = { version: 1; assets: NavigationAsset[]; routes: Record<string, number[]> };
export type NavigationConnection = { saveData?: boolean; effectiveType?: string } | undefined;

export function navigationDestination(href: string, current: string): URL | null {
  try {
    const destination = new URL(href, current);
    const location = new URL(current);
    if (destination.origin !== location.origin || destination.username || destination.password ||
      !/^https?:$/.test(destination.protocol) ||
      (destination.pathname === location.pathname && destination.search === location.search)) return null;
    destination.hash = '';
    return destination;
  } catch {
    return null;
  }
}

export function allowNavigationAssets(connection: NavigationConnection, online = true): boolean {
  return online && !connection?.saveData;
}

export function readNavigationManifest(value: unknown): NavigationManifest | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Partial<NavigationManifest>;
  if (data.version !== 1 || !Array.isArray(data.assets) ||
    !data.routes || typeof data.routes !== 'object' || Array.isArray(data.routes)) return null;
  if (!data.assets.every((asset) => asset && typeof asset.url === 'string' &&
    ['style', 'script', 'image', 'font'].includes(asset.type) && Number.isSafeInteger(asset.bytes) &&
    asset.bytes > 0)) return null;
  return data as NavigationManifest;
}

export function selectNavigationAssets(
  manifest: NavigationManifest,
  destination: URL,
  current: string,
  known: ReadonlySet<string>,
  connection?: NavigationConnection,
): NavigationAsset[] {
  const location = new URL(current);
  if (destination.origin !== location.origin || !allowNavigationAssets(connection)) return [];
  const route = manifest.routes[destination.pathname] ?? manifest.routes[destination.pathname + '/'];
  if (!Array.isArray(route)) return [];
  const result: NavigationAsset[] = [];
  const seen = new Set(known);
  for (const index of route) {
    if (!Number.isSafeInteger(index)) continue;
    const asset = manifest.assets[index];
    if (!asset) continue;
    let url: URL;
    try { url = new URL(asset.url, location); } catch { continue; }
    if (url.origin !== location.origin || url.username || url.password || seen.has(url.href)) continue;
    const extension = { style: /\.css$/i, script: /\.m?js$/i, image: /\.(?:avif|webp|png|jpe?g|gif|svg)$/i, font: /\.woff2?$/i };
    if (!extension[asset.type].test(url.pathname)) continue;
    seen.add(url.href);
    result.push({ ...asset, url: url.href });
  }
  return result;
}

// Native image preloads use the browser's own viewport and DPR selection. A
// fetch of the fallback URL would warm the wrong file for smaller cards.
function preloadResponsiveImage(asset: NavigationAsset, signal: AbortSignal, priority: RequestPriority): Promise<boolean> {
  const hint = document.createElement('link');
  if (!('imageSrcset' in hint) || !hint.relList.supports('preload') || signal.aborted || !Array.isArray(asset.sources)) {
    return Promise.resolve(false);
  }
  const urls: string[] = [];
  for (const source of asset.sources) {
    if (!source || typeof source.url !== 'string' || !Number.isSafeInteger(source.width) || source.width < 1) return Promise.resolve(false);
    let url: URL;
    try { url = new URL(source.url, asset.url); } catch { return Promise.resolve(false); }
    if (url.origin !== location.origin || url.username || url.password || /[,\s]/.test(url.href)) return Promise.resolve(false);
    urls.push(`${url.href} ${source.width}w`);
  }
  if (!urls.length) return Promise.resolve(false);
  hint.rel = 'preload';
  hint.as = 'image';
  hint.imageSizes = asset.sizes || '100vw';
  hint.imageSrcset = urls.join(', ');
  hint.fetchPriority = priority;
  return new Promise(resolve => {
    const finish = (loaded: boolean) => {
      signal.removeEventListener('abort', cancel);
      hint.onload = null;
      hint.onerror = null;
      hint.remove();
      resolve(loaded);
    };
    const cancel = () => finish(false);
    hint.onload = () => finish(true);
    hint.onerror = cancel;
    signal.addEventListener('abort', cancel, { once: true });
    document.head.append(hint);
  });
}

export async function fetchNavigationAsset(
  asset: NavigationAsset,
  signal: AbortSignal,
  request: typeof fetch = fetch,
  priority: RequestPriority = 'low',
): Promise<boolean> {
  if (asset.type === 'image' && asset.sources) return preloadResponsiveImage(asset, signal, priority);
  const response = await request(asset.url, {
    signal,
    cache: 'force-cache',
    credentials: 'same-origin',
    mode: 'cors',
    priority,
  });
  if (signal.aborted || response.status !== 200 || response.headers.has('content-range')) return false;
  const type = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  const types = {
    style: type === 'text/css',
    script: /^(?:text|application)\/(?:javascript|ecmascript)$/.test(type),
    image: type.startsWith('image/'),
    font: /^(?:font\/|application\/(?:font-|x-font-|vnd\.ms-fontobject|octet-stream))/.test(type),
  };
  if (!types[asset.type]) return false;
  // Consume the response so a complete file is available in the HTTP cache.
  // Never import, evaluate, apply styles, or decode images on the current page.
  const body = await response.arrayBuffer();
  return !signal.aborted && body.byteLength > 0;
}
