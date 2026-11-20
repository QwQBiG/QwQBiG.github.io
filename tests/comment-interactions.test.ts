import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

test('drafts and avatars skip the list, inline images remeasure only their reply, structural changes refresh the list', async () => {
  class TestNode extends EventTarget {
    parentElement?: TestElement;
  }
  class TestElement extends TestNode {
    inside = '';
    closest(selectors: string): TestElement | null {
      return selectors.split(', ').includes(this.inside) ? this : this.parentElement?.closest(selectors) ?? null;
    }
  }
  class TestImage extends TestElement {}
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
  let measures = 0;
  const reply = Object.assign(new TestElement(), { inside: '.wl-card > .wl-content' });
  Object.defineProperty(reply, 'scrollHeight', { get: () => { measures++; return 10; } });
  const image = Object.assign(new TestImage(), { parentElement: reply });
  const container = Object.assign(new TestElement(), {
    contains: (node: unknown) => node === reply,
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
    createRootPages: () => ({ refresh() {}, dispose() {} }),
    createThreadPages: () => ({ refresh() {}, dispose() {} }),
    container, Element: TestElement, HTMLImageElement: TestImage, Node: TestNode, MutationObserver: Observer, AbortController,
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
  loadIn(new TestImage());
  assert.equal(frames.length, 0);
  loadIn(image);
  loadIn(image);
  assert.equal(frames.length, 1);
  frames.shift()!();
  assert.equal(scans, 2);
  assert.equal(measures, 1);
  dispose();
  notify([{ target: container }]);
  assert.equal(frames.length, 0);
});

test('a thread starts closed and keeps its five-reply pages independent of other threads', async () => {
  const load = async (name: string) => stripTypeScriptTypes(await readFile(
    new URL(`../src/scripts/${name}.ts`, import.meta.url), 'utf8',
  )).replace(/^import .*;$/gm, '').replace('export function', 'function');
  const script = await load('waline-page-controls') + '\n' + await load('waline-thread-pages');
  class Control extends EventTarget {
    ownerDocument = { createElement: () => new Control() };
    id = '';
    hidden = false;
    disabled = false;
    textContent = '';
    children: Control[] = [];
    attributes = new Map<string, string>();
    beforeButton?: Control;
    afterNav?: Control;
    append(...children: Control[]) { this.children.push(...children); }
    before(button: Control) { this.beforeButton = button; }
    after(nav: Control) { this.afterNav = nav; }
    setAttribute(name: string, value: string) { this.attributes.set(name, value); }
    toggleAttribute(name: string, present: boolean) {
      if (present) this.attributes.set(name, '');
      else this.attributes.delete(name);
    }
    removeAttribute(name: string) { this.attributes.delete(name); }
    click() { if (!this.disabled) this.dispatchEvent(new Event('click')); }
    focus() {}
    scrollIntoView() {}
  }

  const create = runInNewContext(script + '\ncreateThread', {});
  const first = new Control(), second = new Control();
  const a = create(first, 'thread-a'), b = create(second, 'thread-b');
  const replies = Array.from({ length: 12 }, () => new Control());
  a.update(replies);
  b.update([new Control()]);
  assert.ok(first.hidden && second.hidden);
  assert.equal(first.beforeButton?.textContent, 'Show 12 replies');
  assert.equal(second.beforeButton?.textContent, 'Show 1 reply');

  const visible = () => replies.filter(card => !card.hidden);
  first.beforeButton!.click();
  assert.deepEqual(visible(), replies.slice(0, 5));
  assert.ok(second.hidden);
  first.afterNav!.children.at(-1)!.click();
  assert.deepEqual(visible(), replies.slice(5, 10));
  a.reveal(replies[11]);
  assert.deepEqual(visible(), replies.slice(10));
  first.beforeButton!.click();
  assert.ok(first.hidden);
  a.update(replies.slice(0, 5));
  a.reveal(replies[0]);
  assert.equal(first.hidden, false);
  assert.ok(first.afterNav?.hidden, 'hide pagination after the list shrinks to one page');
});
