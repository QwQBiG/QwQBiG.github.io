import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Script } from 'node:vm';
import { createLegacyLoader } from '../scripts/legacy-code-entry.mjs';

test('cached classic scripts share the article module and add the current stylesheet once', () => {
  const styles = '/_astro/code.css';
  const source = createLegacyLoader('/js/article-code-entry.mjs', styles);
  new Script(source); // Cached HTML uses classic, deferred script tags.
  const entries = new Set();
  const links: Array<{ rel: string; href: string }> = [{ rel: 'stylesheet', href: 'https://blog.test/styles/prism-theme.css' }];
  const document = {
    baseURI: 'https://blog.test/cs/post/',
    body: { dataset: {} as { pageCode?: string }, querySelector: () => ({}) },
    querySelectorAll: () => links, createElement: () => ({}),
    head: { append: (link: typeof links[number]) => links.push(link) },
  };
  const script = new Script(source.replace('void import(', 'loadModule('));
  const run = () => script.runInNewContext({ document, URL, loadModule: (url: string) => entries.add(url) });
  document.body.dataset.pageCode = 'false';
  run();
  assert.equal(entries.size, 0);
  delete document.body.dataset.pageCode; // Early layouts predate the page feature flag.
  for (let i = 0; i < 5; i++) run();
  assert.equal(document.body.dataset.pageCode, 'true');
  assert.deepEqual([...entries], ['/js/article-code-entry.mjs']);
  assert.deepEqual(links.map(link => link.href), ['https://blog.test/styles/prism-theme.css', 'https://blog.test/_astro/code.css']);
});
