import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getPageFeatures } from '../src/utils/page-features.ts';

test('detects rendered code and inline or display math independently', () => {
  assert.deepEqual(getPageFeatures('<article><pre class="language-cpp"><code>int n;</code></pre></article>'), {
    hasCode: true, hasMath: false,
  });
  assert.deepEqual(getPageFeatures('<p><span class="formula katex">x</span></p>'), {
    hasCode: false, hasMath: true,
  });
  assert.deepEqual(getPageFeatures('<pre>text</pre><span class="katex-display">x</span>'), {
    hasCode: true, hasMath: true,
  });
});

test('ignores comments, escaped examples, scripts, styles and inactive templates', () => {
  const content = `
    <!-- <pre></pre><span class="katex"></span> -->
    <p>&lt;pre&gt; &lt;span class="katex"&gt;</p>
    <script>const example = '<pre></pre><span class="katex"></span>';</script>
    <style>.example::before { content: '<pre><span class="katex">'; }</style>
    <template><pre></pre><span class="katex"></span></template>
    <noscript><pre></pre><span class="katex"></span></noscript>
    <span class="not-katex katex-html"></span>
    <span class="katex&#160;example"></span>
  `;
  assert.deepEqual(getPageFeatures(content), { hasCode: false, hasMath: false });
});

test('recognizes HTML class tokens and content inside server-rendered islands', () => {
  const content = '<astro-island><span CLASS="other&#9;katex&#10;formula">x</span><pre>code</pre></astro-island>';
  assert.deepEqual(getPageFeatures(content), { hasCode: true, hasMath: true });
  assert.deepEqual(getPageFeatures(''), { hasCode: false, hasMath: false });
});
