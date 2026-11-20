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
  const updates: Array<readonly [number, number | null]> = [];
  const subscription = new AbortController();
  api.observeCommentPages(options.path, subscription.signal, {
    rootIds: () => new Set(),
    receive: ({ page, totalPages }) => updates.push([page, totalPages]),
  });
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
  assert.deepEqual(updates, [[1, null], [1, 0]]);
  subscription.abort();
  assert.equal(api.addComment, original.addComment);
  assert.equal(api.updateComment, original.updateComment);
  assert.equal(api.deleteComment, original.deleteComment);
});

test('paging skips overlapping root IDs and recovers shifted rows after a deletion', async t => {
  const subscription = new AbortController();
  const rendered = new Set(['1', '2', '3']);
  api.observeCommentPages(options.path, subscription.signal, {
    rootIds: () => new Set(rendered),
    receive() {},
  });
  try {
    const source = [0, 1, 2, 3, 4, 5, 6];
    const reads: number[] = [];
    t.mock.method(globalThis, 'fetch', async (url: string) => {
      const page = Number(new URL(url).searchParams.get('page'));
      reads.push(page);
      const ids = source.slice((page - 1) * 3, page * 3);
      return Response.json({ errno: 0, data: {
        page, pageSize: 3, totalPages: Math.ceil(source.length / 3),
        count: source.length, data: ids.map(objectId => ({ objectId })),
      } });
    });
    rendered.add('0'); // Waline already prepended the posted root.
    const second = await api.getComment({ ...options, pageSize: 3, page: 2 });
    assert.deepEqual(second.data.map(root => root.objectId), [4, 5]);
    assert.deepEqual(reads, [2]);

    // Deleting two earlier rows puts root 6 on the previous server page.
    source.splice(0, 2);
    rendered.clear();
    for (const id of [2, 3, 4, 5]) rendered.add(String(id));
    const last = await api.getComment({ ...options, pageSize: 3, page: 3 });
    assert.deepEqual(last.data.map(root => root.objectId), [6]);
    assert.deepEqual(reads, [2, 2]);
  } finally {
    subscription.abort();
  }
});
