import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseFragment, type DefaultTreeAdapterTypes } from 'parse5';
import { prepareCodeBlock, prepareCodeLines, splitCodeLines } from '../src/scripts/prism/prism-code-blocks.js';

// Model only the DOM operations used when moving an already-highlighted token.
// parse5 supplies the same decoded text and nested spans as the article HTML.
class TokenNode {
  nodeType: number;
  data: string;
  attrs: Record<string, string>;
  childNodes: TokenNode[] = [];
  parent?: TokenNode;
  ownerDocument = { createTextNode: (value: string) => new TokenNode(3, value) };

  constructor(nodeType: number, data = '', attrs: Record<string, string> = {}) {
    this.nodeType = nodeType;
    this.data = data;
    this.attrs = attrs;
  }
  get textContent(): string {
    return this.nodeType === 3 ? this.data : this.childNodes.map(child => child.textContent).join('');
  }
  cloneNode() { return new TokenNode(this.nodeType, this.data, { ...this.attrs }); }
  removeAttribute(name: string) { delete this.attrs[name]; }
  append(text: string) { this.appendChild(this.ownerDocument.createTextNode(text)); }
  appendChild(node: TokenNode) {
    if (node.parent) node.parent.childNodes.splice(node.parent.childNodes.indexOf(node), 1);
    node.parent = this;
    this.childNodes.push(node);
  }
}

function fromHTML(node: DefaultTreeAdapterTypes.Node): TokenNode {
  if ('value' in node) return new TokenNode(3, node.value);
  const attrs = 'attrs' in node ? Object.fromEntries(node.attrs.map(a => [a.name, a.value])) : {};
  const element = new TokenNode(1, '', attrs);
  if ('childNodes' in node) for (const child of node.childNodes) element.appendChild(fromHTML(child));
  return element;
}

test('line splitting preserves original source and nested syntax across newlines', () => {
  const root = fromHTML(parseFragment(
    '<span class="token comment" id="example">/* &lt;&amp;\n<span class="token nested">x\n\ty</span> */</span> ' +
    '<span class="token keyword">fn</span>\n\n  ',
  ));
  const keyword = root.childNodes[2];
  const original = root.textContent;
  const lines = splitCodeLines(root);
  const text = lines.map(nodes => nodes.map(n => n.textContent).join(''));
  assert.deepEqual(text, ['/* <&', 'x', '\ty */ fn', '', '  ']);
  assert.equal(text.join('\n'), original);
  assert.equal(lines[2].at(-1), keyword, 'the single-line keyword keeps its original node');
  for (const index of [0, 1, 2]) assert.equal(lines[index][0].attrs.class, 'token comment');
  assert.equal(lines[1][0].childNodes[0].attrs.class, 'token nested');
  assert.equal(lines[2][0].childNodes[0].attrs.class, 'token nested');
  assert.deepEqual(lines.slice(0, 3).map(row => row[0].attrs.id), ['example', undefined, undefined]);
});

test('deferred rows keep exact source text, including empty lines, and bind once', t => {
  const document = {
    createDocumentFragment: () => new TokenNode(11),
    createElement: () => new TokenNode(1),
  };
  Object.defineProperty(globalThis, 'document', { configurable: true, value: document });
  t.after(() => Reflect.deleteProperty(globalThis, 'document'));
  for (const input of ['', ' ', '\n', '\n\n', 'one\n', 'one\n\n', 'one\n  ', '\t&lt;a&gt; &amp;\n',
    '<span class="token comment">/*\n\t*/</span>\n']) {
    const handlers: string[] = [];
    const root = Object.assign(fromHTML(parseFragment(input)), {
      hasAttribute(name: string) { return Object.hasOwn(this.attrs, name); },
      setAttribute(name: string, value: string) { this.attrs[name] = value; },
      replaceChildren(fragment: TokenNode) {
        this.childNodes.length = 0;
        for (const child of [...fragment.childNodes]) this.appendChild(child);
      },
      addEventListener(event: string) { handlers.push(event); },
    });
    root.setAttribute('data-code-lines', '');
    const original = root.textContent;
    prepareCodeLines(root);
    prepareCodeLines(root);
    assert.equal(root.textContent, original);
    const lines = original.split('\n');
    if (!lines.at(-1)) lines.pop();
    assert.equal(root.childNodes.length, lines.length);
    assert.deepEqual(handlers, ['mouseover', 'mouseout', 'click']);
  }
});

test('static blocks bind one toolbar without touching the source until copy', t => {
  class Control extends EventTarget {
    className = '';
    appendChild() {}
    classList = { add() {}, remove() {} };
  }
  const controls: Control[] = [];
  const document = {
    body: { dataset: { pageCode: 'true' } },
    createElement() {
      const element = new Control();
      controls.push(element);
      return element;
    },
  };
  const copies: string[] = [];
  Object.defineProperty(globalThis, 'document', { configurable: true, value: document });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
    async writeText(text: string) { copies.push(text); },
  } });
  t.mock.method(globalThis, 'setTimeout', () => {});
  t.after(() => {
    Reflect.deleteProperty(globalThis, 'document');
    Reflect.deleteProperty(navigator, 'clipboard');
  });

  for (const count of [15, 16]) {
    controls.length = 0;
    let reads = 0;
    const source = 'fn run() {}\n'.repeat(count - 1);
    class StaticCode extends EventTarget {
      dataset = { codeLines: String(count) };
      hasAttribute(name: string) { return name === 'data-code-lines'; }
      get textContent() { reads++; return source; }
    }
    const code = new StaticCode();
    let headers = 0;
    const pre = { classList: ['language-rust'], dataset: {}, querySelector: () => code, insertBefore() { headers++; } };
    assert.equal(prepareCodeBlock(pre), code);
    assert.equal(prepareCodeBlock(pre), code);
    assert.equal(headers, 1);
    assert.equal(reads, 0);
    assert.equal(controls.some(c => c.className === 'code-fold-toggle'), count > 15);
    controls.find(c => c.className === 'custom-copy-code')!.dispatchEvent(new Event('click'));
    assert.equal(reads, 1);
    assert.equal(copies.at(-1), source);
  }
});
