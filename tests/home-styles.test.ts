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

test('reading and homepage styles are independent of build order', async () => {
  const home = fileURLToPath(new URL('../src/styles/home-utilities.css', import.meta.url));
  const site = fileURLToPath(new URL('../src/styles/site-utilities.css', import.meta.url));
  async function compile(order: string[]) {
    const processor = postcss([tailwindcss()]);
    const output = new Map<string, string>();
    for (const file of order) {
      const input = await readFile(file, 'utf8');
      const { css } = await processor.process(input, { from: file });
      output.set(file, css);
    }
    return output;
  }
  const homeFirst = await compile([home, site]);
  const siteFirst = await compile([site, home]);
  assert.equal(homeFirst.get(site), siteFirst.get(site));
  assert.equal(homeFirst.get(home), siteFirst.get(home));
  assert.ok(homeFirst.get(site)!.includes('.lg\\:grid-cols-12'));
  assert.ok(homeFirst.get(site)!.includes('.lg\\:col-span-9'));
  assert.ok(!homeFirst.get(home)!.includes('.lg\\:grid-cols-12'));
});
