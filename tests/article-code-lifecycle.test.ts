import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

test('article code decorates nearby blocks once, prepares matching blocks for search and ignores stale viewport callbacks', async () => {
  function article(...ids: string[]) {
    const blocks = ids.map(id => {
      const code = { id, hasAttribute: (name: string) => name === 'data-code-lines' && id !== 'custom' };
      return Object.assign(new EventTarget(), {
        id, className: 'language-rust', dataset: { processed: 'false' },
        matches: () => true, querySelector: () => code,
      });
    });
    const body = Object.assign(new EventTarget(), {
      dataset: { pageCode: 'true' }, querySelectorAll: () => blocks,
      contains: (block: typeof blocks[number]) => blocks.includes(block),
    });
    return { blocks, body };
  }
  type Block = ReturnType<typeof article>['blocks'][number];
  type Entries = { target: Block; isIntersecting: boolean }[];

  const first = article('near', 'far', 'unrelated', 'custom');
  const window = new EventTarget();
  const document = Object.assign(new EventTarget(), { body: first.body });
  const callbacks: Array<(entries: Entries) => void> = [];
  const prepared: string[] = [];
  const decorated: string[] = [];
  const numbered: string[] = [];
  const context = {
    document, window, AbortController, Event,
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
  const { prepareCodeSearch: prepareSearch, whenCodeReady } = runInNewContext(source.replace(/^import .*;$/gm, '').replaceAll('export function', 'function') + '\n({ prepareCodeSearch, whenCodeReady })', context);

  document.dispatchEvent(new Event('astro:page-load'));
  assert.deepEqual(prepared, ['custom'], 'only custom blocks need immediate toolbar layout');
  assert.deepEqual(decorated, []);
  assert.deepEqual(numbered, []);
  assert.equal(callbacks.length, 1);
  const [notify] = callbacks;
  const [near, far] = first.blocks;
  notify([{ target: near, isIntersecting: true }, { target: far, isIntersecting: false }]);
  notify([{ target: near, isIntersecting: true }]);
  assert.deepEqual(prepared, ['custom', 'near']);
  assert.deepEqual(decorated, ['near']);
  const painted: string[] = [];
  const firstQuery = new AbortController();
  whenCodeReady(near, () => painted.push('visible'), firstQuery.signal);
  whenCodeReady(far, () => painted.push('stale'), firstQuery.signal);
  assert.deepEqual(painted, ['visible']);
  assert.deepEqual(decorated, ['near']);
  firstQuery.abort();
  whenCodeReady(far, () => painted.push('current query'), new AbortController().signal);
  prepareSearch([far]);
  prepareSearch([far]);
  assert.deepEqual(painted, ['visible', 'current query']);
  assert.deepEqual(decorated, ['near', 'far']);
  const tab = Object.assign(new Event('keydown'), { key: 'Tab', shiftKey: true });
  first.body.dispatchEvent(tab);
  assert.deepEqual(prepared, ['custom', 'near', 'far', 'unrelated'], 'Tab can reach offscreen tools');
  assert.deepEqual(numbered, ['near', 'far'], 'Tab leaves offscreen syntax and rows deferred');

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
  assert.deepEqual(prepared, ['custom', 'near', 'far', 'unrelated', 'print', 'appendix', 'next']);
  assert.deepEqual(decorated, ['near', 'far', 'print', 'appendix', 'next'], 'without a viewport observer blocks enhance immediately');
  assert.deepEqual(numbered, decorated);
});
