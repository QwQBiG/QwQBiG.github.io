import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getPageFeatures } from '../src/utils/page-features.ts';

test('detects rendered code and inline or display math independently', () => {
  assert.deepEqual(getPageFeatures('<article><pre class="language-cpp"><code>int n;</code></pre></article>'), {
    hasCode: true, hasMath: false, hasMermaid: false,
  });
  assert.deepEqual(getPageFeatures('<p><span class="formula katex">x</span></p>'), {
    hasCode: false, hasMath: true, hasMermaid: false,
  });
  assert.deepEqual(getPageFeatures('<pre>text</pre><span class="katex-display">x</span>'), {
    hasCode: true, hasMath: true, hasMermaid: false,
  });
});

test('ignores comments, escaped examples, scripts, styles and inactive templates', () => {
  const content = `
    <!-- <pre class="mermaid"></pre><span class="katex"></span> -->
    <p>&lt;pre&gt; &lt;span class="katex"&gt;</p>
    <script>const example = '<pre></pre><span class="katex"></span>';</script>
    <style>.example::before { content: '<pre><span class="katex">'; }</style>
    <template><pre class="language-mermaid"></pre><span class="katex"></span></template>
    <noscript><pre class="language-mermaid"></pre><span class="katex"></span></noscript>
    <span class="not-katex katex-html"></span>
    <span class="katex&#160;example"></span>
  `;
  assert.deepEqual(getPageFeatures(content), { hasCode: false, hasMath: false, hasMermaid: false });
});

test('recognizes HTML class tokens and content inside server-rendered islands', () => {
  const content = '<astro-island><span CLASS="other&#9;katex&#10;formula">x</span><pre>code</pre></astro-island>';
  assert.deepEqual(getPageFeatures(content), { hasCode: true, hasMath: true, hasMermaid: false });
  assert.deepEqual(getPageFeatures(''), { hasCode: false, hasMath: false, hasMermaid: false });
});

test('detects diagram blocks beyond earlier code and math, including legacy pre classes', () => {
  for (const diagramClass of ['language-mermaid', 'other mermaid', 'custom-mermaid-flow']) {
    const content = `<pre>regular code</pre><span class="katex"></span><pre class="${diagramClass}"><code>x</code></pre>`;
    assert.deepEqual(getPageFeatures(content), { hasCode: true, hasMath: true, hasMermaid: true });
  }
  assert.deepEqual(getPageFeatures('<pre><code class="language-mermaid">example</code></pre>'), {
    hasCode: true, hasMath: false, hasMermaid: false,
  });
  assert.deepEqual(getPageFeatures('<pre class="mermaid">diagram</pre>'), {
    hasCode: true, hasMath: false, hasMermaid: true,
  });
});
