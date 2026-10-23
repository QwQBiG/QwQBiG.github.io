export interface PortraitState {
  displayed: number;
  requested: number;
  busy: boolean;
  failed: boolean;
}

/** Older engines can wait for load; removal must settle even a pending decode. */
export function decodePortrait(image: HTMLImageElement, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error?: unknown) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener('abort', abort);
      image.removeEventListener('load', loaded);
      image.removeEventListener('error', failed);
      if (error) reject(error);
      else resolve();
    };
    const abort = () => finish(new Error('Portrait removed'));
    const loaded = () => finish();
    const failed = () => finish(new Error('Portrait image unavailable'));
    if (signal.aborted) { abort(); return; }
    signal.addEventListener('abort', abort, { once: true });
    if (typeof image.decode === 'function') {
      try { void image.decode().then(loaded, finish); }
      catch (error) { finish(error); }
    } else if (image.complete) {
      if (image.naturalWidth > 0) loaded();
      else failed();
    } else {
      image.addEventListener('load', loaded, { once: true });
      image.addEventListener('error', failed, { once: true });
    }
  });
}

/** Keep network waits outside the single pair of fading image layers. */
export function createPortraitSwitcher<T>(options: {
  count: number;
  initial?: number;
  load: (index: number) => Promise<T>;
  prepare: (asset: T, index: number) => Promise<void>;
  fade: (index: number) => Promise<void>;
  onChange: (state: Readonly<PortraitState>, reason: 'request' | 'display' | 'error') => void;
}) {
  const state: PortraitState = {
    displayed: options.initial ?? 0,
    requested: options.initial ?? 0,
    busy: false,
    failed: false,
  };
  let revision = 0;
  let disposed = false;
  let changing = false;
  let ready: { asset: T; index: number; revision: number } | undefined;
  const notify = (reason: 'request' | 'display' | 'error') => options.onChange({ ...state }, reason);

  const fail = (token: number) => {
    if (disposed || token !== revision) return;
    state.failed = true;
    state.busy = false;
    notify('error');
  };

  const flush = async () => {
    if (disposed || changing || !ready) return;
    const next = ready;
    ready = undefined;
    changing = true;
    try {
      await options.prepare(next.asset, next.index);
      if (disposed || next.revision !== revision) return;
      await options.fade(next.index);
      if (disposed) return;
      state.displayed = next.index;
      if (next.revision === revision) {
        state.busy = false;
        state.failed = false;
      }
      notify('display');
    } catch {
      fail(next.revision);
    } finally {
      changing = false;
      if (!disposed) void flush();
    }
  };

  return {
    get state(): Readonly<PortraitState> { return { ...state }; },
    next() {
      if (disposed) return;
      const index = state.failed ? state.requested : (state.requested + 1) % options.count;
      const token = ++revision;
      state.requested = index;
      state.failed = false;
      state.busy = true;
      ready = undefined;
      notify('request');
      // A superseded slow image must never hold up a newer, already decoded image.
      void options.load(index).then((asset) => {
        if (disposed || token !== revision) return;
        ready = { asset, index, revision: token };
        void flush();
      }, () => fail(token));
    },
    dispose() {
      disposed = true;
      revision += 1;
      ready = undefined;
    },
  };
}

/** Retain decoded assets, evict failures for retry, and release them on removal. */
export function createPortraitCache<T>(load: (index: number, signal: AbortSignal) => Promise<T>) {
  const lifetime = new AbortController();
  const cache = new Map<number, Promise<T>>();
  return {
    load(index: number): Promise<T> {
      if (lifetime.signal.aborted) return Promise.reject(new Error('Portrait removed'));
      const existing = cache.get(index);
      if (existing) return existing;
      const pending = load(index, lifetime.signal).catch((error: unknown) => {
        if (cache.get(index) === pending) cache.delete(index);
        throw error;
      });
      cache.set(index, pending);
      return pending;
    },
    dispose() {
      lifetime.abort();
      cache.clear();
    },
  };
}
