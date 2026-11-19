import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

test('article code decorates nearby blocks once, flushes for search and ignores stale viewport callbacks', async () => {
  function article(...ids: string[]) {
    const blocks = ids.map(id => ({
      id, className: 'language-rust', dataset: { processed: 'false' },
      matches: () => true, querySelector: () => ({ id }),
    }));
    const body = Object.assign(new EventTarget(), {
      dataset: { pageCode: 'true' }, querySelectorAll: () => blocks,
      contains: (block: typeof blocks[number]) => blocks.includes(block),
    });
    return { blocks, body };
  }
  type Block = ReturnType<typeof article>['blocks'][number];
  type Entries = { target: Block; isIntersecting: boolean }[];

  const first = article('near', 'far');
  const window = new EventTarget();
  const document = Object.assign(new EventTarget(), { body: first.body });
  const callbacks: Array<(entries: Entries) => void> = [];
  const prepared: string[] = [];
  const decorated: string[] = [];
  const numbered: string[] = [];
  const context = {
    document, window, AbortController,
    IntersectionObserver: class {
      constructor(callback: (entries: Entries) => void) { callbacks.push(callback); }
      observe() {} unobserve() {} disconnect() {}
    } as unknown,
    MutationObserver: class { observe() {} disconnect() {} takeRecords() { return []; } },
    prepareCodeBlock(pre: Block) { prepared.push(pre.id); pre.dataset.processed = 'true'; },
    prepareCodeLines(code: { id: string }) { numbered.push(code.id); },
    decorateBrackets(code: { id: string }) { decorated.push(code.id); },
    enhanceSyntaxHighlighting() {}, fixXMLHighlighting() {},
  };
  const source = await readFile(new URL('../src/scripts/prism/article-code.js', import.meta.url), 'utf8');
  const prepareSearch = runInNewContext(source.replace(/^import .*;$/gm, '').replace('export function', 'function') + '\nprepareCodeSearch', context);

  document.dispatchEvent(new Event('astro:page-load'));
  assert.deepEqual(prepared, ['near', 'far']);
  assert.deepEqual(decorated, []);
  assert.deepEqual(numbered, []);
  assert.equal(callbacks.length, 1);
  const [notify] = callbacks;
  const [near, far] = first.blocks;
  notify([{ target: near, isIntersecting: true }, { target: far, isIntersecting: false }]);
  notify([{ target: near, isIntersecting: true }]);
  assert.deepEqual(decorated, ['near']);
  prepareSearch();
  prepareSearch();
  assert.deepEqual(decorated, ['near', 'far']);

  document.dispatchEvent(new Event('astro:before-swap'));
  const outgoing = article('print', 'appendix');
  document.body = outgoing.body;
  document.dispatchEvent(new Event('astro:page-load'));
  window.dispatchEvent(new Event('beforeprint'));
  assert.deepEqual(decorated, ['near', 'far', 'print', 'appendix']);
  const stale = callbacks[1];
  document.dispatchEvent(new Event('astro:before-swap'));
  const next = article('next');
  document.body = next.body;
  context.IntersectionObserver = undefined;
  stale([outgoing.blocks[0], next.blocks[0]].map(target => ({ target, isIntersecting: true })));
  assert.deepEqual(decorated, ['near', 'far', 'print', 'appendix']);
  document.dispatchEvent(new Event('astro:page-load'));
  assert.deepEqual(prepared, ['near', 'far', 'print', 'appendix', 'next']);
  assert.deepEqual(decorated, ['near', 'far', 'print', 'appendix', 'next'], 'without a viewport observer blocks enhance immediately');
  assert.deepEqual(numbered, decorated);
});
