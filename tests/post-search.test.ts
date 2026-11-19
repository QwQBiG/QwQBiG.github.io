import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
import { formatDisplayDate } from '../src/utils/date.ts';

const script = stripTypeScriptTypes(await readFile(new URL('../src/scripts/post-search.ts', import.meta.url), 'utf8'))
  .replace(/^import .*;$/gm, '').replace(/^export /gm, '');
const posts = [{ title: 'C++ <示例>', description: '示例 & E', slug: 'posts/cpp', collection: 'cs', date: '2026-01-01', tags: ['基础', 'tag'] }];

function setup(history = { state: {}, replaceState(value: object) { this.state = value; } }, restoreY = 0) {
  const document = {};
  const scrolls: number[] = [];
  const window = Object.assign(new EventTarget(), { scrollTo({ top }: { top: number }) { scrolls.push(top); } });
  const input = Object.assign(new EventTarget(), { value: restoreY ? 'c++' : '', ownerDocument: document, isConnected: true });
  const retry = new EventTarget();
  const results = { innerHTML: '', querySelector: () => retry };
  const frames: Array<() => void> = [];
  const requests: Array<(value: Response) => void> = [];
  runInNewContext(script + '\ninitializePostSearch(input, results, restoreY)', {
    input, results, AbortController, document, window, restoreY, history, formatDisplayDate,
    requestAnimationFrame: (callback: () => void) => frames.push(callback),
    fetch: () => new Promise(resolve => requests.push(resolve)),
  });
  function paint() {
    assert.equal(frames.length, 1);
    frames.shift()!();
  }
  function type(value: string) {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }
  async function respond(response: Response) {
    requests.shift()!(response);
    await new Promise(resolve => setImmediate(resolve));
  }
  return { input, retry, results, frames, requests, type, paint, respond, window, scrolls };
}

test('the next paint shows the latest query, including while the article index is loading', async () => {
  const page = setup();
  page.type('no match');
  page.type('c++');
  page.paint();
  assert.match(page.results.innerHTML, /Loading posts/);
  await page.respond(Response.json(posts));
  page.paint();
  assert.match(page.results.innerHTML, /href="\/cs\/posts\/cpp\/"/);
  assert.match(page.results.innerHTML, />C\+\+<\/mark> &lt;示例&gt;/);
  assert.match(page.results.innerHTML, /示例 &amp; E/);
  assert.match(page.results.innerHTML, /Jan 1, 2026/);
  page.type('tag');
  page.paint();
  assert.match(page.results.innerHTML, /search-result-item/);
  page.type('missing');
  page.paint();
  assert.match(page.results.innerHTML, /No matching posts/);
  page.type(' ');
  page.paint();
  assert.match(page.results.innerHTML, /Type to search/);
});

test('a frame queued before IME composition and an index arrival never paint partial input', async () => {
  const page = setup();
  page.type('c');
  page.input.dispatchEvent(new Event('compositionstart'));
  page.type('s');
  await page.respond(Response.json(posts));
  page.paint();
  assert.equal(page.results.innerHTML, '');
  page.type('示');
  assert.equal(page.frames.length, 0);
  page.input.dispatchEvent(new Event('compositionend'));
  page.type('示例');
  page.paint();
  assert.match(page.results.innerHTML, />示例<\/mark>/);
});

test('pasted queries keep their input text and show matching tags even beyond the preview limit', async () => {
  const history = { state: {} as { postSearchQuery?: string }, replaceState(value: object) { this.state = value; } };
  const page = setup(history);
  const tags = ['First', 'Second', 'Third', 'My <C++> & tools', 'C++ Primer'];
  await page.respond(Response.json([{ ...posts[0], title: 'Notes', description: '', tags }]));
  page.paint();
  const query = '　c++ ';
  page.type(query);
  page.paint();
  assert.equal(page.input.value, query);
  assert.equal(history.state.postSearchQuery, query);
  assert.match(page.results.innerHTML, /My &lt;<mark[^>]*>C\+\+<\/mark>&gt; &amp; tools, <mark[^>]*>C\+\+<\/mark> Primer, First/);
  assert.doesNotMatch(page.results.innerHTML, /Second|Third/);
});

test('a failed HTTP response offers a retry which uses the current input', async () => {
  const page = setup();
  page.type('old');
  await page.respond(new Response(null, { status: 503 }));
  page.paint();
  assert.match(page.results.innerHTML, /Try again/);
  page.retry.dispatchEvent(new Event('click'));
  assert.equal(page.requests.length, 1);
  page.type('示例');
  page.paint();
  assert.match(page.results.innerHTML, /Loading posts/);
  await page.respond(Response.json(posts));
  page.paint();
  assert.match(page.results.innerHTML, /search-result-item/);
});

test('search visits share a pending index and restore results before history traversal scrolls', async () => {
  function searchPage() {
    const input = Object.assign(new EventTarget(), { value: '' });
    const results = { innerHTML: '' };
    const preload = { removed: false, remove() { this.removed = true; } };
    const querySelector = (selector: string) => {
      if (selector === '#search-input') return input;
      if (selector === '#search-results') return results;
      return preload;
    };
    return { input, results, preload, querySelector };
  }

  const first = searchPage();
  const document = Object.assign(new EventTarget(), { querySelector: first.querySelector });
  type Entry = { index: number; scrollY: number; postSearchQuery?: string };
  const history = {
    state: { index: 3, scrollY: 0 } as Entry,
    replaceState(value: Entry) { this.state = value; },
  };
  let resolveIndex!: (response: Response) => void;
  let requests = 0;
  const frames = new Map<number, () => void>();
  let nextFrame = 1;
  runInNewContext(script + '\nstartPostSearch()', {
    document, history, AbortController, formatDisplayDate, window: new EventTarget(),
    fetch() { requests++; return new Promise(resolve => { resolveIndex = resolve; }); },
    requestAnimationFrame(callback: () => void) {
      const id = nextFrame++;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id: number) { frames.delete(id); },
  });

  function swap(to: { querySelector: (selector: string) => unknown }, navigationType: 'traverse' | 'push') {
    document.dispatchEvent(Object.assign(new Event('astro:before-swap'), { newDocument: to, navigationType }));
    document.querySelector = to.querySelector as typeof document.querySelector;
    document.dispatchEvent(new Event('astro:page-load'));
  }
  function type(target: typeof first.input, value: string) {
    target.value = value;
    target.dispatchEvent(new Event('input'));
  }

  type(first.input, 'c++');
  assert.deepEqual({ ...history.state }, { index: 3, scrollY: 0, postSearchQuery: 'c++' });
  const entry = { ...history.state, scrollY: 600 };
  const article = { querySelector: () => null };
  swap(article, 'push');
  assert.equal(frames.size, 0);
  type(first.input, 'detached');
  assert.equal(history.state.postSearchQuery, 'c++');

  history.state = entry;
  const pending = searchPage();
  swap(pending, 'traverse');
  assert.equal(pending.input.value, 'c++');
  assert.equal(pending.preload.removed, true);
  assert.equal(requests, 1);
  swap(article, 'push');
  resolveIndex(Response.json(posts));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(frames.size, 0, 'an old response does not redraw either outgoing page');
  assert.equal(first.results.innerHTML, '');
  assert.equal(pending.results.innerHTML, '');

  const restored = searchPage();
  swap(restored, 'traverse');
  assert.equal(restored.input.value, 'c++');
  assert.match(restored.results.innerHTML, /posts\/cpp/);
  assert.equal(frames.size, 0, 'result layout is ready for the router to restore scrolling');
  assert.equal(requests, 1);
  assert.equal(history.state.scrollY, 600);

  swap(article, 'push');
  const fresh = searchPage();
  swap(fresh, 'push');
  assert.equal(fresh.input.value, '');
  assert.doesNotMatch(fresh.results.innerHTML, /result-item/);
  assert.equal(requests, 1);
});

test('typing still renders results when history writes are rate-limited', async () => {
  const page = setup({ state: {}, replaceState() { throw new Error('History unavailable'); } });
  await page.respond(Response.json(posts));
  page.paint();
  page.type('c++');
  page.paint();
  assert.match(page.results.innerHTML, /posts\/cpp/);
});

test('a cold history entry restores the saved offset after loading unless the reader has moved on', async () => {
  for (const interacted of [false, true]) {
    const page = setup(undefined, 500);
    page.paint();
    assert.match(page.results.innerHTML, /Loading posts/);
    if (interacted) page.window.dispatchEvent(new Event('wheel'));
    await page.respond(Response.json(posts));
    page.paint();
    assert.match(page.results.innerHTML, /posts\/cpp/);
    assert.deepEqual(page.scrolls, interacted ? [] : [500]);
  }
});
