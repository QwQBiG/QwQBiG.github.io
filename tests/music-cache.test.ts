import test from 'node:test';
import assert from 'node:assert/strict';
import { createMusicPreloader } from '../src/utils/music-cache.ts';

const url = 'https://example.test/music/track.mp3?v=current';
const audio = (body = 'complete audio', status = 200, type = 'audio/mpeg') => (
  new Response(body, { status, headers: { 'content-type': type } })
);
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
};

function storageFixture(entries: Array<[string, Response]> = []) {
  const data = new Map(entries);
  const opened: string[] = [];
  const deleted: string[] = [];
  const cache = {
    match: async (key: RequestInfo | URL) => data.get(String(key))?.clone(),
    put: async (key: RequestInfo | URL, response: Response) => { data.set(String(key), response.clone()); },
    keys: async () => [...data.keys()].map((key) => new Request(key)),
    delete: async (key: RequestInfo | URL) => {
      const value = key instanceof Request ? key.url : String(key);
      deleted.push(value);
      return data.delete(value);
    },
  };
  const storage = { open: async (name: string) => { opened.push(name); return cache; } };
  return { data, opened, deleted, cache, storage: storage as unknown as CacheStorage };
}

test('a complete versioned cache hit prepares audio without a network request', async () => {
  const fixture = storageFixture([[url, audio('cached audio')]]);
  const preloader = createMusicPreloader({
    url, type: 'audio/mpeg', storage: fixture.storage,
    fetch: async () => { throw new Error('cache hits must not fetch'); },
  });
  const ready = await preloader.warm();
  assert(ready);
  assert.equal(ready.fromCache, true);
  assert.equal(await ready.blob.text(), 'cached audio');
  assert.deepEqual(fixture.opened, ['iqwqi-music-v1']);
});

test('a cache miss fetches the whole file at low priority and persists it', async () => {
  const fixture = storageFixture();
  let receivedURL: unknown;
  let receivedInit: RequestInit | undefined;
  const ready = await createMusicPreloader({
    url, type: 'audio/mpeg', storage: fixture.storage,
    fetch: async (input, init) => { receivedURL = input; receivedInit = init; return audio(); },
  }).warm();
  assert(ready);
  assert.equal(ready.fromCache, false);
  assert.equal(await ready.blob.text(), 'complete audio');
  assert.equal(receivedURL, url);
  assert.equal(receivedInit?.priority, 'low');
  assert.equal(receivedInit?.cache, 'force-cache');
  assert.equal(new Headers(receivedInit?.headers).has('range'), false);
  await tick();
  assert.equal(await fixture.data.get(url)?.text(), 'complete audio');
});

test('partial, empty, non-audio and unsuccessful responses never become ready or cached', async () => {
  for (const response of [audio('part', 206), audio(''), audio('page', 200, 'text/html'), audio('missing', 404)]) {
    const fixture = storageFixture();
    const ready = await createMusicPreloader({
      url, type: 'audio/mpeg', storage: fixture.storage, fetch: async () => response,
    }).warm();
    assert.equal(ready, null);
    await tick();
    assert.equal(fixture.data.size, 0);
  }
  const fixture = storageFixture();
  const incomplete = audio('part');
  incomplete.headers.set('content-range', 'bytes 0-3/100');
  assert.equal(await createMusicPreloader({
    url, type: 'audio/mpeg', storage: fixture.storage, fetch: async () => incomplete,
  }).warm(), null);
});

test('an invalid cache entry is bypassed and replaced by a complete response', async () => {
  const fixture = storageFixture([[url, audio('partial', 206)]]);
  let requests = 0;
  const ready = await createMusicPreloader({
    url, type: 'audio/mpeg', storage: fixture.storage,
    fetch: async () => { requests++; return audio('replacement'); },
  }).warm();
  assert(ready);
  assert.equal(ready.fromCache, false);
  assert.equal(requests, 1);
  await tick();
  assert.equal(fixture.data.get(url)?.status, 200);
});

test('denied storage and failed quota writes still leave playable audio in memory', async () => {
  const denied = { open: async () => { throw new Error('storage denied'); } } as unknown as CacheStorage;
  const first = await createMusicPreloader({
    url, type: 'audio/mpeg', storage: denied, fetch: async () => audio('memory'),
  }).warm();
  assert.equal(await first?.blob.text(), 'memory');

  const fixture = storageFixture();
  fixture.cache.put = async () => { throw new Error('quota exceeded'); };
  const second = await createMusicPreloader({
    url, type: 'audio/mpeg', storage: fixture.storage, fetch: async () => audio('still ready'),
  }).warm();
  assert.equal(await second?.blob.text(), 'still ready');
  await tick();
});

test('a slow cache write does not delay preparing the in-memory audio', async () => {
  const fixture = storageFixture();
  const write = deferred<void>();
  fixture.cache.put = () => write.promise;
  const ready = await createMusicPreloader({
    url, type: 'audio/mpeg', storage: fixture.storage, fetch: async () => audio(),
  }).warm();
  assert(ready);
  assert.equal(await ready.blob.text(), 'complete audio');
  write.resolve();
  await tick();
});

test('simultaneous warm calls share one fetch and the completed result', async () => {
  const fixture = storageFixture();
  const request = deferred<Response>();
  let count = 0;
  const preloader = createMusicPreloader({
    url, type: 'audio/mpeg', storage: fixture.storage,
    fetch: async () => { count++; return request.promise; },
  });
  const first = preloader.warm();
  const second = preloader.warm();
  assert.equal(first, second);
  await tick();
  assert.equal(count, 1);
  request.resolve(audio());
  assert.equal(await first, await second);
  assert.equal(preloader.warm(), first);
});

test('cancellation aborts a fetch and settles even when the fetch ignores abort', async () => {
  const fixture = storageFixture();
  const request = deferred<Response>();
  let signal: AbortSignal | null | undefined;
  const preloader = createMusicPreloader({
    url, type: 'audio/mpeg', storage: fixture.storage,
    fetch: async (_, init) => { signal = init?.signal; return request.promise; },
  });
  const ready = preloader.warm();
  await tick();
  preloader.cancel();
  assert.equal(signal?.aborted, true);
  assert.equal(await ready, null);
  assert.equal(await preloader.warm(), null);
  request.resolve(audio('late response'));
  await tick();
  assert.equal(fixture.data.size, 0);
});

test('cancellation while reading the cache cannot publish a late cached result or fetch', async () => {
  const fixture = storageFixture();
  const read = deferred<Response>();
  fixture.cache.match = () => read.promise;
  let count = 0;
  const preloader = createMusicPreloader({
    url, type: 'audio/mpeg', storage: fixture.storage,
    fetch: async () => { count++; return audio(); },
  });
  const ready = preloader.warm();
  await tick();
  preloader.cancel();
  assert.equal(await ready, null);
  read.resolve(audio('late cache'));
  await tick();
  assert.equal(count, 0);
});

test('a new content version does not reuse or delete unrelated cached tracks', async () => {
  const oldURL = 'https://example.test/music/track.mp3?v=old';
  const otherTrack = 'https://example.test/music/another.mp3?v=old';
  const otherOrigin = 'https://other.test/music/track.mp3?v=old';
  const otherVariant = 'https://example.test/music/track.mp3?language=en&v=old';
  const fixture = storageFixture([
    [oldURL, audio('old')], [otherTrack, audio('other')],
    [otherOrigin, audio('other origin')], [otherVariant, audio('variant')],
  ]);
  const ready = await createMusicPreloader({
    url, type: 'audio/mpeg', cacheName: 'my-track-cache', storage: fixture.storage,
    fetch: async () => audio('current'),
  }).warm();
  assert.equal(await ready?.blob.text(), 'current');
  await tick();
  assert.deepEqual(fixture.opened, ['my-track-cache']);
  assert.deepEqual(fixture.deleted, [oldURL]);
  assert.equal(fixture.data.has(otherTrack), true);
  assert.equal(fixture.data.has(otherOrigin), true);
  assert.equal(fixture.data.has(otherVariant), true);
});

test('generic binary audio receives the selected media type and failed requests may retry', async () => {
  const fixture = storageFixture();
  let count = 0;
  const preloader = createMusicPreloader({
    url, type: 'audio/mpeg', storage: fixture.storage,
    fetch: async () => {
      if (count++ === 0) throw new Error('offline');
      return audio('binary MP3', 200, 'application/octet-stream');
    },
  });
  assert.equal(await preloader.warm(), null);
  const ready = await preloader.warm();
  assert(ready);
  assert.equal(ready.blob.type, 'audio/mpeg');
  assert.equal(await ready.blob.text(), 'binary MP3');
});

test('binary cache hits also receive the selected audio type without refetching', async () => {
  const fixture = storageFixture([[url, audio('cached binary', 200, 'application/octet-stream; charset=binary')]]);
  const ready = await createMusicPreloader({
    url, type: 'audio/mpeg', storage: fixture.storage,
    fetch: async () => { throw new Error('binary cache hits must not fetch'); },
  }).warm();
  assert(ready);
  assert.equal(ready.fromCache, true);
  assert.equal(ready.blob.type, 'audio/mpeg');
  assert.equal(await ready.blob.text(), 'cached binary');
});

test('the production audio/mp3 MIME becomes audio/mpeg without changing audio bytes', async () => {
  const bytes = new Uint8Array([0xff, 0xfb, 0x90, 0x64, 0x00, 0xe2, 0x01]);
  const response = () => new Response(bytes, { headers: { 'content-type': 'audio/mp3' } });
  for (const cached of [false, true]) {
    const fixture = storageFixture(cached ? [[url, response()]] : []);
    const ready = await createMusicPreloader({
      url, type: 'audio/mpeg', storage: fixture.storage,
      fetch: async () => response(),
    }).warm();
    assert(ready);
    assert.equal(ready.fromCache, cached);
    assert.equal(ready.blob.type, 'audio/mpeg');
    assert.deepEqual(new Uint8Array(await ready.blob.arrayBuffer()), bytes);
  }
});
