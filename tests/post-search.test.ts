import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

const script = stripTypeScriptTypes(await readFile(new URL('../src/scripts/post-search.ts', import.meta.url), 'utf8'))
  .replace('export function initializePostSearch', 'function initializePostSearch');
const posts = [{ title: 'C++ <示例>', description: '示例 & E', slug: 'posts/cpp', collection: 'cs', date: '2026-01-01', tags: ['基础', 'tag'] }];

function setup() {
  const input = Object.assign(new EventTarget(), { value: '' });
  const retry = new EventTarget();
  const results = { innerHTML: '', querySelector: () => retry };
  const frames: Array<() => void> = [];
  const requests: Array<(value: Response) => void> = [];
  runInNewContext(script + '\ninitializePostSearch(input, results)', {
    input, results,
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
  return { input, retry, results, frames, requests, type, paint, respond };
}

test('the next paint shows the latest query, including while the article index is loading', async () => {
  const page = setup();
  page.type('no match');
  page.type('c++');
  page.paint();
  assert.match(page.results.innerHTML, /正在加载文章/);
  await page.respond(Response.json(posts));
  page.paint();
  assert.match(page.results.innerHTML, /href="\/cs\/posts\/cpp\/"/);
  assert.match(page.results.innerHTML, />C\+\+<\/mark> &lt;示例&gt;/);
  assert.match(page.results.innerHTML, /示例 &amp; E/);
  page.type('tag');
  page.paint();
  assert.match(page.results.innerHTML, /search-result-item/);
  page.type('missing');
  page.paint();
  assert.match(page.results.innerHTML, /没有找到相关文章/);
  page.type(' ');
  page.paint();
  assert.match(page.results.innerHTML, /输入关键词开始搜索/);
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

test('a failed HTTP response offers a retry which uses the current input', async () => {
  const page = setup();
  page.type('old');
  await page.respond(new Response(null, { status: 503 }));
  page.paint();
  assert.match(page.results.innerHTML, /重试/);
  page.retry.dispatchEvent(new Event('click'));
  assert.equal(page.requests.length, 1);
  page.type('示例');
  page.paint();
  assert.match(page.results.innerHTML, /正在加载文章/);
  await page.respond(Response.json(posts));
  page.paint();
  assert.match(page.results.innerHTML, /search-result-item/);
});
