import assert from 'node:assert/strict';
import { test } from 'node:test';
import { wrapArticleTables } from '../src/utils/article-tables.ts';

const table = '<table><caption>端口</caption><tr><th scope="col">编号</th><td>42</td></tr></table>';

test('wraps each rendered article table, preserving the original markup and table semantics', () => {
  const island = '<astro-island data-props=\'{"content":"&lt;table&gt;"}\'></astro-island>';
  const html = island + table + '<p>读完第一张表</p>' + table;
  const output = wrapArticleTables(html);
  assert.equal(output.split('class="article-table-scroll"').length - 1, 2);
  assert.equal(output.replace(/<div class="article-table-scroll"[^>]*>(<table>[\s\S]*?<\/table>)<\/div>/g, '$1'), html);
  assert.equal(wrapArticleTables(output), output);
});

test('preserves authored scroll regions, nested tables and inactive markup', () => {
  for (const attributes of ['role="region" tabindex="0" style="overflow-x: auto;"', 'class="wrapper overflow-auto"']) {
    const region = '<div ' + attributes + '><div style="min-width:32rem">' + table + '</div></div>';
    assert.equal(wrapArticleTables(region), region);
  }
  const inert = '<template>' + table + '</template><!--' + table + '--><code>&lt;table&gt;</code>';
  assert.equal(wrapArticleTables(inert), inert);
  const nested = '<table><tr><td>' + table + '</td></tr></table>';
  assert.equal(wrapArticleTables(nested).split('article-table-scroll').length - 1, 1);
});
