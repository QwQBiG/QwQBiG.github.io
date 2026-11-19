import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

test('the deferred comment client formats the first render and cleans up a failed or completed mount', async () => {
  const source = stripTypeScriptTypes(await readFile(new URL('../src/scripts/waline-client.ts', import.meta.url), 'utf8'))
    .replace(/^import .*;$/gm, '').replace('export function', 'function');
  const events: string[] = [];
  let fail = true;
  const mount = runInNewContext(source + '\nmountWaline', {
    keepCommentDisplayEmojiFree() {
      events.push('format');
      return () => events.push('stop formatting');
    },
    init() {
      events.push('render');
      return { destroy: () => events.push('destroy') };
    },
    enhanceCommentInteractions() {
      if (fail) throw new Error('interrupted');
      events.push('interactions');
      return () => events.push('stop interactions');
    },
  });
  const container = { dataset: { path: '/test-post/' } };
  assert.throws(() => mount(container, 'https://comments.example'), /interrupted/);
  assert.deepEqual(events, ['format', 'render', 'stop formatting', 'destroy']);

  fail = false;
  events.length = 0;
  const unmount = mount(container, 'https://comments.example');
  assert.deepEqual(events, ['format', 'render', 'interactions']);
  unmount();
  assert.deepEqual(events.slice(3), ['stop interactions', 'stop formatting', 'destroy']);
});
