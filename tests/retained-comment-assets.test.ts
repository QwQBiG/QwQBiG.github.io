import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { retainCommentAssets } from '../scripts/retain-comment-assets.mjs';

async function generation(root: string, label: string, version = label) {
  const dest = path.join(root, label);
  const dir = path.join(dest, '_astro');
  const articles = path.join(dest, 'cs/posts/example');
  await mkdir(dir, { recursive: true });
  await mkdir(articles, { recursive: true });
  const entry = `WalineComments.astro.${version}.js`;
  await writeFile(path.join(articles, 'index.html'), `<div id="waline"></div><script type="module" src="/_astro/${entry}"></script>`);
  await writeFile(path.join(dir, entry), `import './shared.X.js'; import('./waline-client.${version}.js'); const css = '/_astro/waline.${version}.css';`);
  await writeFile(path.join(dir, `waline-client.${version}.js`), `import './shared.X.js';`);
  await writeFile(path.join(dir, `waline.${version}.css`), `/* stylesheet ${version} */`);
  await writeFile(path.join(dir, 'shared.X.js'), `/* current shared module: ${label} */`);
  await writeFile(path.join(dir, `unrelated.${version}.js`), '');
  return dest;
}

test('cached article entries and late client/style imports survive a rollout without publishing unrelated files', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'waline-assets-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const old = await generation(root, 'old');
  const recent = await generation(root, 'recent');
  const current = await generation(root, 'current');
  const copied = await retainCommentAssets(current, [recent, old]);
  assert.equal(copied.length, 6);
  const target = path.join(current, '_astro');
  for (const folder of [recent, old]) {
    const version = path.basename(folder);
    for (const name of [`WalineComments.astro.${version}.js`, `waline-client.${version}.js`, `waline.${version}.css`]) {
      assert.deepEqual(await readFile(path.join(target, name)), await readFile(path.join(folder, '_astro', name)));
    }
  }
  assert.equal(await readFile(path.join(target, 'shared.X.js'), 'utf8'), '/* current shared module: current */');
  assert.ok(!(await readdir(target)).includes('unrelated.old.js'));

  const identical = await generation(root, 'repeat', 'current');
  await retainCommentAssets(identical, [current]);
  assert.equal(JSON.parse(await readFile(path.join(identical, 'comment-assets.json'), 'utf8')).length, 3);
  assert.ok((await readdir(path.join(identical, '_astro'))).includes('waline.old.css'));

  const next = await generation(root, 'next');
  await retainCommentAssets(next, [], file => readFile(path.join(identical, file)));
  const names = await readdir(path.join(next, '_astro'));
  assert.ok(names.includes('waline.recent.css'));
  assert.ok(!names.includes('waline.old.css'));
});

test('a published manifest may only request hashed JS and CSS within _astro', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'waline-manifest-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const current = await generation(root, 'current');
  const requested: string[] = [];
  await assert.rejects(retainCommentAssets(current, [], async file => {
    requested.push(file);
    return Buffer.from(JSON.stringify([['_astro/WalineComments.astro.x.js', '_astro/../outside.js']]));
  }), /Invalid previous comment asset manifest/);
  assert.deepEqual(requested, ['comment-assets.json']);
});
