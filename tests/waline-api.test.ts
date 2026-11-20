import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as original from '@waline/api';
import * as api from '../src/scripts/waline-api.ts';

const options = {
  serverURL: 'https://comments.example', lang: 'en-US', path: '/post/',
  page: 1, pageSize: 10, sortBy: 'insertedAt_desc',
};

test('a stalled list times out, a retry can read the same page, and navigation still cancels silently', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const reads: string[] = [];
  const data = { data: [], count: 0, page: 1, pageSize: 10, totalPages: 0 };
  t.mock.method(globalThis, 'fetch', (url: string, init: RequestInit) => {
    reads.push(url);
    assert.equal(init.method ?? 'GET', 'GET');
    if (reads.length === 2) return Promise.resolve(Response.json({ errno: 0, data }));
    const signal = init.signal!;
    return new Promise((_, reject) => {
      if (signal.aborted) reject(signal.reason);
      else signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
  });

  const pending = api.getComment(options);
  t.mock.timers.tick(12000);
  await assert.rejects(pending, /timed out/);
  assert.deepEqual(await api.getComment(options), data);
  const navigation = new AbortController();
  const leaving = api.getComment({ ...options, signal: navigation.signal });
  navigation.abort();
  await assert.rejects(leaving, { name: 'AbortError' });
  assert.deepEqual(reads, Array(3).fill(reads[0]));
  assert.equal(api.addComment, original.addComment);
  assert.equal(api.updateComment, original.updateComment);
  assert.equal(api.deleteComment, original.deleteComment);
});
