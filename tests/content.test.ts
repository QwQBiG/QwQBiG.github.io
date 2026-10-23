import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createContentIndex,
  getPostTags,
  getPostUrl,
  getTagKey,
  getTagUrl,
  isSeriesEntry,
} from '../src/utils/content.ts';
import type { CSPost, PoetryPost } from '../src/utils/content.ts';

function csPost(id: string, data: Partial<CSPost['data']> = {}, slug = id.replace(/\.(?:md|mdx)$/, '')): CSPost {
  return {
    id,
    slug,
    collection: 'cs',
    body: '',
    data: {
      title: id,
      date: new Date('2026-01-01T12:00:00+08:00'),
      tags: [],
      categories: [],
      weight: 0,
      draft: false,
      hidden: false,
      pin: false,
      ...data,
    },
  } as CSPost;
}

function poetryPost(id: string, data: Partial<PoetryPost['data']> = {}): PoetryPost {
  return {
    id,
    slug: id.replace(/\.md$/, ''),
    collection: 'poetry',
    body: '',
    data: {
      title: id,
      date: new Date('2026-01-01T12:00:00+08:00'),
      tags: [],
      genre: '其他',
      mood: [],
      draft: false,
      hidden: false,
      pin: false,
      ...data,
    },
  } as PoetryPost;
}

test('latest articles include standalone files, nested files, and poetry without counting series indexes', () => {
  const standalone = csPost('posts/project.md', { date: new Date('2026-08-01T12:00:00+08:00') });
  const poem = poetryPost('posts/folder/poem.md', { date: new Date('2026-07-17T12:00:00+08:00') });
  const nested = csPost('posts/folder/article.md', { date: new Date('2026-07-13T12:00:00+08:00') });
  const index = csPost('posts/folder/index.md', { date: new Date('2026-09-01T12:00:00+08:00') }, 'posts/folder');
  const inputCS = [nested, index, standalone];
  const content = createContentIndex({ cs: inputCS, poetry: [poem] });

  assert.deepEqual(content.latestPosts, [standalone, poem, nested]);
  assert.equal(content.posts.length, 3);
  assert.equal(content.csPosts.length, 2);
  assert.equal(content.poetryPosts.length, 1);
  assert.equal(content.series.length, 1);
  assert.deepEqual(inputCS, [nested, index, standalone], 'sorting must not mutate caller arrays');
  assert.equal(getPostUrl(poem), '/poetry/posts/folder/poem/');
});

test('series detection follows metadata or exact index filenames regardless of directory depth', () => {
  assert.equal(isSeriesEntry(csPost('posts/deep/nested/index.md')), true);
  assert.equal(isSeriesEntry(csPost('posts/legacy/_index.md')), true);
  assert.equal(isSeriesEntry(csPost('posts/overview.md', { categories: ['合集'] })), true);
  assert.equal(isSeriesEntry(csPost('posts/search-index.md')), false);
  assert.equal(isSeriesEntry(csPost('posts/indexed-notes.md')), false);
});

test('drafts have no routes and hidden entries retain routes without affecting listings or counts', () => {
  const visible = csPost('posts/visible.md', { tags: ['visible'] });
  const hidden = csPost('posts/hidden.md', { hidden: true, tags: ['hidden'], date: new Date('2000-01-01') });
  const draft = csPost('posts/draft.md', { draft: true, tags: ['draft'] });
  const hiddenPoem = poetryPost('posts/hidden-poem.md', { hidden: true });
  const draftPoem = poetryPost('posts/draft-poem.md', { draft: true });
  const hiddenSeries = csPost('posts/hidden/index.md', { hidden: true });
  const content = createContentIndex({ cs: [visible, hidden, draft, hiddenSeries], poetry: [hiddenPoem, draftPoem] });

  assert.deepEqual(content.posts, [visible]);
  assert.deepEqual(content.tags, [['visible', 1]]);
  assert.equal(content.series.length, 0);
  assert.equal(content.firstPublishedYear, 2026);
  assert.ok(content.publishedCS.includes(hidden));
  assert.ok(content.publishedCS.includes(hiddenSeries));
  assert.ok(!content.publishedCS.includes(draft));
  assert.deepEqual(content.publishedPoetry, [hiddenPoem]);
});

test('series counts and ordering use only visible member articles', () => {
  const index = csPost('posts/course/index.md', { title: 'Course', pin: true });
  const second = csPost('posts/course/two.md', { series: ['Course'], weight: 2 });
  const first = csPost('posts/course/one.md', { series: ['Course'], weight: 1 });
  const hidden = csPost('posts/course/hidden.md', { series: ['Course'], hidden: true });
  const draft = csPost('posts/course/draft.md', { series: ['Course'], draft: true });
  const other = csPost('posts/unrelated.md');
  const content = createContentIndex({ cs: [second, hidden, index, other, draft, first] });

  assert.equal(content.series[0].postCount, 2);
  assert.deepEqual(content.series[0].posts, [first, second]);
  assert.deepEqual(content.pinnedSeries, content.series);
  assert.equal(content.series[0].slug, index.slug);
});

test('tags count distinct articles across both collections and exclude metadata-only tags', () => {
  const one = csPost('posts/one.md', { tags: ['shared', ' shared ', 'shared', 'e\u0301', 'é', '', ' '] });
  const two = poetryPost('posts/two.md', { tags: ['shared', 'poetry'] });
  const index = csPost('posts/course/index.md', { tags: ['series-only'] });
  const content = createContentIndex({ cs: [one, index], poetry: [two] });

  assert.deepEqual(getPostTags(one), ['shared', 'é']);
  assert.deepEqual(new Map(content.tags), new Map([['shared', 2], ['é', 1], ['poetry', 1]]));
  assert.deepEqual(content.tags[0], ['shared', 2]);
});

test('case variants in one article share a tag while keeping its first written label', () => {
  const post = csPost('posts/one.md', { tags: [' java ', 'Java', 'JAVA', ' Rust ', 'rust', 'e\u0301', 'É', ''] });
  assert.deepEqual(getPostTags(post), ['java', 'Rust', 'é']);
  assert.equal(getTagKey(' É '), getTagKey('e\u0301'));
  assert.equal(getTagKey(' Java '), 'java');
});

test('tag counts merge case variants across articles with stable display names from all labels', () => {
  const one = csPost('posts/one.md', { tags: ['rust', 'Rust', 'java', 'Java', 'Hugo'] });
  const two = poetryPost('posts/two.md', { tags: ['RUST', 'JAVA', 'hugo'] });
  const first = createContentIndex({ cs: [one], poetry: [two] });

  assert.deepEqual(new Map(first.tags), new Map([['RUST', 2], ['JAVA', 2], ['Hugo', 2]]));
  assert.equal(first.tags.length, 3);
  assert.deepEqual(createContentIndex({ cs: [one] }).tags.find(([tag]) => getTagKey(tag) === 'rust'), ['Rust', 1]);
});

test('all labels of a logical tag generate the same safe URL', () => {
  for (const variant of ['Rust', 'rust', ' RUST ']) {
    assert.equal(getTagUrl(variant), '/tags/rust/');
  }
  assert.equal(getTagUrl('C++'), '/tags/c%2B%2B/');
  assert.equal(getTagUrl(' É '), getTagUrl('e\u0301'));
  const variants = [csPost('posts/one.md', { tags: ['java'] }), csPost('posts/two.md', { tags: ['Java'] })];
  assert.deepEqual(createContentIndex({ cs: variants }).tags, [['Java', 2]]);
  assert.deepEqual(createContentIndex({ cs: [...variants].reverse() }).tags, [['Java', 2]]);
});

test('equal dates sort consistently across collection input order', () => {
  const a = csPost('posts/a.md');
  const b = csPost('posts/b.md');
  const poem = poetryPost('posts/a.md');
  assert.deepEqual(
    createContentIndex({ cs: [b, a], poetry: [poem] }).posts,
    createContentIndex({ cs: [a, b], poetry: [poem] }).posts,
  );
});

test('the first content year uses Shanghai dates and supports an empty blog', () => {
  const oldPoem = poetryPost('posts/preface.md', { date: new Date('2020-01-01T00:00:00+08:00') });
  const index = csPost('posts/course/index.md', { date: new Date('1990-01-01T00:00:00+08:00') });
  assert.equal(createContentIndex({ cs: [index], poetry: [oldPoem] }).firstPublishedYear, 2020);
  assert.equal(createContentIndex({}).firstPublishedYear, null);
});
