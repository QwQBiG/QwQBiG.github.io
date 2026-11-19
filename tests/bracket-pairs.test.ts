import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decorateBrackets } from '../src/scripts/prism/prism-rainbow-brackets.js';

test('bracket decoration pairs across tokens, preserving mismatches and limiting click updates to the selected pair', t => {
  const brackets: any[] = [];
  const handlers: Function[] = [];
  let classWrites = 0;
  let walks = 0;
  function span() {
    const classes = new Set<string>();
    const element = {
      classes, dataset: {}, className: '', textContent: '',
      classList: {
        add(...names: string[]) { classWrites++; for (const name of names) classes.add(name); },
        remove(...names: string[]) { classWrites++; for (const name of names) classes.delete(name); },
      },
      closest() { return element; },
    };
    brackets.push(element);
    return element;
  }
  function text(data: string, isNumber = false) {
    return {
      data,
      parentElement: { closest: () => isNumber },
      replaceWith(replacement: any) { assert.equal(isNumber, false); this.data = replacement.textContent; },
    };
  }
  // The mismatched sequence ([)] keeps pairing independently per delimiter type.
  const nodes = [text('123()', true), text('fn ('), text('['), text(')x] }{')];
  Object.defineProperty(globalThis, 'NodeFilter', { configurable: true, value: { SHOW_TEXT: 4 } });
  t.after(() => Reflect.deleteProperty(globalThis, 'NodeFilter'));
  const code = {
    ownerDocument: {
      createTreeWalker() {
        walks++;
        const it = nodes.values();
        return { nextNode: () => it.next().value ?? null };
      },
      createDocumentFragment: () => ({
        textContent: '',
        append(value: string | { textContent: string }) { this.textContent += typeof value === 'string' ? value : value.textContent; },
      }),
      createElement: span,
    },
    addEventListener(type: string, handler: Function) { assert.equal(type, 'click'); handlers.push(handler); },
  };
  decorateBrackets(code);
  decorateBrackets(code);
  assert.equal(walks, 1);
  assert.equal(handlers.length, 1);
  assert.deepEqual(nodes.map(n => n.data), ['123()', 'fn (', '[', ')x] }{']);
  assert.deepEqual(brackets.map(b => b.dataset.bracket), ['(', '[', ')', ']', '}', '{']);
  assert.deepEqual(brackets.map(b => [...b.classes]), [
    ['rainbow-bracket-level-1'], ['rainbow-bracket-level-2'],
    ['rainbow-bracket-level-1'], ['rainbow-bracket-level-2'],
    ['rainbow-bracket-unmatched'], ['rainbow-bracket-level-1', 'rainbow-bracket-unmatched'],
  ]);
  function click(index: number) {
    classWrites = 0;
    handlers[0]({ target: brackets[index], stopPropagation() {} });
    assert.ok(classWrites <= 4);
    return brackets.flatMap((b, i) => b.classes.has('bracket-match-highlight') ? [i] : []);
  }
  assert.deepEqual(click(3), [1, 3]);
  assert.deepEqual(click(0), [0, 2]);
  assert.deepEqual(click(5), [5]);
  assert.ok(brackets[5].classes.has('bracket-unmatched'));
});
