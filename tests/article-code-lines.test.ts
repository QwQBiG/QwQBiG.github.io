import assert from 'node:assert/strict';
import { test } from 'node:test';
import { markArticleCodeBlocks } from '../src/utils/article-code-lines.ts';
import { wrapArticleTables } from '../src/utils/article-tables.ts';

const block = (source: string) => `<pre class="language-js" data-language="js"><code is:raw class="language-js">${source}</code></pre>`;

test('preserves code HTML and counts visible rows separately from the fold threshold', () => {
  const cases: [string, number, number][] = [
    ['', 1, 0], ['<span class="token string"></span>', 1, 0], ['x', 1, 1],
    ['\n', 2, 1], ['x\n\n', 3, 2], ['&#10;&#10;', 3, 2], ['x&#10;<span class="token string"></span>', 2, 1],
    ['\t&lt;tag&gt; &AMP; &#13;&#10;  ', 2, 2], ['x\r\n \t', 2, 2],
    ['<span class="token comment">/* <span class="token nested">a\n\n&lt;b</span> */</span>\n', 4, 3],
  ];
  for (const [source, count, visible] of cases) {
    const html = block(source);
    const output = markArticleCodeBlocks(html);
    const spacer = visible ? ` data-code-spacer="${'&#10;'.repeat(visible)}"` : '';
    assert.equal(output, html.replace('<code ', `<div class="code-content"${spacer}><code `)
      .replace('class="language-js">', `class="language-js" data-code-lines="${count}">`)
      .replace('</code>', '</code></div>'));
    assert.equal(markArticleCodeBlocks(output), output);
  }
});

test('changes only supported static blocks and coexists with scrollable tables and MDX islands', () => {
  const unsupported = [
    '<pre><code>plain</code></pre>',
    '<pre class="language-mermaid"><code>graph TD\n A --&gt; B</code></pre>',
    '<pre class="language-js"><button>run</button><code>1</code></pre>',
    block('<a href="/example">x</a>\ny'),
    block('<span class="token string" id="custom">a\nb</span>'),
    block('<span class="line">authored row</span>'),
    block('x').replace('<pre ', '<pre contenteditable '),
    '<astro-island props=\'{"text":"&lt;pre&gt;"}\'>' + block('island') + '</astro-island>',
    '<template>' + block('inert') + '</template>',
    '<!--' + block('comment') + '-->',
  ].join('');
  const table = '<table><tr><td>cell</td></tr></table>';
  const html = unsupported + table + block('first') + '<p data-raw=bare>你好</p>' + block('last');
  const output = markArticleCodeBlocks(wrapArticleTables(html));
  assert.ok(output.startsWith(unsupported + wrapArticleTables(table)));
  assert.ok(output.includes('<p data-raw=bare>你好</p>'));
  assert.equal(output.match(/data-code-lines=/g)?.length, 2);
  const reordered = '<table><tr><td>' + block('one') + '</td></tr>' + block('two') + '</table>';
  assert.equal(markArticleCodeBlocks(reordered), reordered
    .replace(block('one'), markArticleCodeBlocks(block('one')))
    .replace(block('two'), markArticleCodeBlocks(block('two'))));
});
