import assert from 'node:assert/strict';
import test from 'node:test';
import { markCodeMatches } from '../src/scripts/prism/code-search-matches.js';

// Each part represents a separate syntax text node. Keep replacements inside
// the same token to check both the source and the grouped highlights.
function search(parts: string[], pattern: RegExp) {
  interface Mark { className: string; textContent: string; dataset: { matchIndex?: string } }
  interface Fragment { pieces: Array<string | Mark>; append(piece: string | Mark): void }
  const nodes = parts.map(data => ({
    data, pieces: [data] as Array<string | Mark>,
    replaceWith(fragment: Fragment) { this.pieces = fragment.pieces; },
  }));
  const ownerDocument = {
    createTreeWalker() {
      const iterator = nodes.values();
      return { nextNode: () => iterator.next().value };
    },
    createDocumentFragment(): Fragment { return { pieces: [], append(piece) { this.pieces.push(piece); } }; },
    createElement(): Mark { return { className: '', textContent: '', dataset: {} }; },
  };
  const hits: Mark[][] = markCodeMatches({ ownerDocument }, Array.from(parts.join('').matchAll(pattern)), 4);
  assert.deepEqual(nodes.map(node => node.pieces.map(part => typeof part === 'string' ? part : part.textContent).join('')), parts);
  hits.forEach((group, index) => {
    for (const mark of group) {
      assert.equal(mark.className, 'token search-match');
      assert.equal(mark.dataset.matchIndex, String(4 + index));
    }
  });
  return hits.map(group => group.map(mark => mark.textContent));
}

test('code search groups source offsets across adjacent and nested token text nodes', t => {
  Object.defineProperty(globalThis, 'NodeFilter', { configurable: true, value: { SHOW_TEXT: 4 } });
  t.after(() => Reflect.deleteProperty(globalThis, 'NodeFilter'));
  assert.deepEqual(search(['  ', 'fn', '', ' ', 'Main', '(', '); fn main();'], /fn main\(\)/gi), [
    ['fn', ' ', 'Main', '(', ')'], ['fn main()'],
  ]);
  assert.deepEqual(search(['xxa', 'aaa', 'aaxx'], /aa/g), [['a', 'a'], ['aa'], ['aa']]);
  assert.deepEqual(search(['System.', '\n', 'out', '; System', '.', 'out'], /system\.out/gi), [['System', '.', 'out']]);
  assert.deepEqual(search(['no match'], /other/g), []);
});
