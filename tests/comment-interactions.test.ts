import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

test('draft updates skip the comment list while structural changes and loaded comment images refresh it', async () => {
  class TestNode extends EventTarget {
    parentElement?: TestElement;
  }
  class TestElement extends TestNode {
    inside = '';
    closest(selectors: string) {
      return selectors.split(', ').includes(this.inside) ? this : null;
    }
  }
  const panel = new TestElement();
  panel.inside = '.wl-comment > .wl-panel';
  const counter = new TestNode();
  counter.parentElement = panel;
  const card = new TestElement();
  const document = new EventTarget();
  const frames: Array<() => void> = [];
  const window = Object.assign(new EventTarget(), {
    matchMedia: () => new EventTarget(),
    requestAnimationFrame: (cb: () => void) => frames.push(cb),
    cancelAnimationFrame() {},
  });
  let scans = 0;
  const container = Object.assign(new TestElement(), {
    ownerDocument: Object.assign(document, { defaultView: window }),
    querySelectorAll(selector: string) {
      if (selector === '.wl-card-item') scans++;
      return [];
    },
  });
  type Changes = Array<{ target: TestNode }>;
  let notify!: (changes: Changes) => void;
  class Observer {
    constructor(callback: typeof notify) { notify = callback; }
    observe() {} disconnect() {} takeRecords() { return []; }
  }
  const code = stripTypeScriptTypes(await readFile(new URL('../src/scripts/waline-interactions.ts', import.meta.url), 'utf8'))
    .replace(/^import .*;$/gm, '').replace('export function', 'function');
  const dispose = runInNewContext(code + '\nenhanceCommentInteractions(container)', {
    container, Element: TestElement, Node: TestNode, MutationObserver: Observer, AbortController,
  });
  assert.equal(scans, 1);
  for (let i = 0; i < 10; i++) notify([{ target: counter }, { target: panel }]);
  function loadIn(element: TestElement) {
    container.dispatchEvent(Object.defineProperty(new Event('load'), 'target', { value: element }));
  }
  loadIn(panel);
  assert.equal(frames.length, 0);
  notify([{ target: counter }, { target: card }]);
  notify([{ target: container }]);
  assert.equal(frames.length, 1);
  frames.shift()!();
  assert.equal(scans, 2);
  loadIn(card);
  assert.equal(frames.length, 1);
  frames.shift()!();
  dispose();
  notify([{ target: container }]);
  assert.equal(frames.length, 0);
});
