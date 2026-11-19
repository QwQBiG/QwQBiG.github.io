import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

test('the homepage ships its responsive and interactive utilities without reading typography', async () => {
  const file = fileURLToPath(new URL('../src/styles/home-utilities.css', import.meta.url));
  const input = await readFile(file, 'utf8');
  const { root } = await postcss([tailwindcss()]).process(input, { from: file });
  const selectors = new Set<string>();
  root.walkRules(rule => { selectors.add(rule.selector); });

  assert.ok(selectors.has('.grid')); // Homepage layout.
  assert.ok(selectors.has('.md\\:p-8')); // Padding supplied by the glass card component.
  assert.ok(selectors.has('.hidden')); // Updated by the music controls.
  assert.ok(selectors.has('.\\[\\@media\\(min-width\\:924px\\)\\]\\:translate-x-64')); // Avatar return.
  assert.ok(!selectors.has('.prose'));
});
