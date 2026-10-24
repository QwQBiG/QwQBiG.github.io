export interface MusicPreloadResult {
  blob: Blob;
  fromCache: boolean;
}

interface MusicPreloaderOptions {
  url: string;
  type: string;
  storage?: CacheStorage;
  fetch?: typeof globalThis.fetch;
  cacheName?: string;
}

function browserStorage(): CacheStorage | undefined {
  try { return globalThis.caches; } catch { return undefined; }
}

function isCompleteAudio(response: Response): boolean {
  const type = response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  return response.status === 200 && !response.headers.has('content-range')
    && !!type && (type.startsWith('audio/') || type === 'application/octet-stream');
}

function versionIdentity(url: string) {
  const parsed = new URL(url, typeof location === 'undefined' ? 'https://music-cache.invalid/' : location.href);
  const version = parsed.searchParams.get('v');
  parsed.searchParams.delete('v');
  parsed.searchParams.sort();
  parsed.hash = '';
  return { resource: parsed.href, version };
}

/** Prepare one complete audio resource without taking control of the media element. */
export function createMusicPreloader(options: MusicPreloaderOptions) {
  const lifetime = new AbortController();
  const fetcher = options.fetch ?? (typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : undefined);
  const storage = options.storage ?? browserStorage();
  let pending: Promise<MusicPreloadResult | null> | undefined;
  let finish: ((result: MusicPreloadResult | null) => void) | undefined;
  const asAudio = (blob: Blob) => blob.type === options.type
    ? blob
    : blob.slice(0, blob.size, options.type);

  async function store(cache: Cache, response: Response) {
    try {
      if (lifetime.signal.aborted) return;
      await cache.put(options.url, response);
      if (lifetime.signal.aborted) return;
      const current = versionIdentity(options.url);
      if (!current.version) return;
      const keys = await cache.keys();
      if (lifetime.signal.aborted) return;
      await Promise.all(keys.filter((key) => {
        const old = versionIdentity(key.url);
        return old.resource === current.resource && !!old.version && old.version !== current.version;
      }).map((key) => cache.delete(key)));
    } catch {
      // Storage quotas or permissions must not prevent using the in-memory audio.
    }
  }

  async function prepare(): Promise<MusicPreloadResult | null> {
    let cache: Cache | undefined;
    try {
      cache = await storage?.open(options.cacheName ?? 'iqwqi-music-v1');
      if (lifetime.signal.aborted) return null;
      const cached = await cache?.match(options.url);
      if (lifetime.signal.aborted) return null;
      if (cached && isCompleteAudio(cached)) {
        const blob = await cached.blob();
        if (lifetime.signal.aborted) return null;
        if (blob.size > 0) return { blob: asAudio(blob), fromCache: true };
      }
    } catch {
      // A denied or unusable cache falls back to a normal audio request.
    }

    if (lifetime.signal.aborted || !fetcher) return null;
    const response = await fetcher(options.url, {
      signal: lifetime.signal,
      cache: 'force-cache',
      priority: 'low',
    });
    if (lifetime.signal.aborted || !isCompleteAudio(response)) return null;
    const blob = await response.blob();
    if (lifetime.signal.aborted || blob.size === 0) return null;
    // Keep the selected media type even when a host uses audio/mp3 or generic binary.
    const ready = asAudio(blob);
    if (cache) {
      // Persist in the background; even a stalled write must not delay playback.
      void store(cache, new Response(ready, { status: 200, headers: { 'content-type': ready.type } }));
    }
    return { blob: ready, fromCache: false };
  }

  return {
    warm(): Promise<MusicPreloadResult | null> {
      if (lifetime.signal.aborted) return Promise.resolve(null);
      if (pending) return pending;
      pending = new Promise((resolve) => { finish = resolve; });
      void prepare().then((result) => {
        const ready = lifetime.signal.aborted ? null : result;
        finish?.(ready);
        finish = undefined;
        if (!ready && !lifetime.signal.aborted) pending = undefined;
      }, () => {
        finish?.(null);
        finish = undefined;
        if (!lifetime.signal.aborted) pending = undefined;
      });
      return pending;
    },
    cancel() {
      lifetime.abort();
      finish?.(null);
      finish = undefined;
    },
  };
}
