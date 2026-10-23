import type { CollectionEntry } from 'astro:content';

export type CSPost = CollectionEntry<'cs'>;
export type PoetryPost = CollectionEntry<'poetry'>;
export type Post = CSPost | PoetryPost;

export interface Series {
  entry: CSPost;
  title: string;
  description?: string;
  slug: string;
  pin: boolean;
  postCount: number;
  posts: CSPost[];
}

export interface ContentCollections {
  cs?: readonly CSPost[];
  poetry?: readonly PoetryPost[];
}

/** Drafts have no public route. Hidden entries keep their route but leave all listings. */
export function isPublished(post: Post): boolean {
  return !post.data.draft;
}

export function isVisible(post: Post): boolean {
  return isPublished(post) && !post.data.hidden;
}

/** Use content metadata and the source filename, never the depth of a generated URL. */
export function isSeriesEntry(post: CSPost): boolean {
  return post.data.categories.includes('合集') || /(?:^|\/)_?index\.(?:md|mdx)$/i.test(post.id);
}

function compareKey(a: Post, b: Post): number {
  const aKey = `${a.collection}/${a.slug}`;
  const bKey = `${b.collection}/${b.slug}`;
  return aKey < bKey ? -1 : aKey > bKey ? 1 : 0;
}

/** Ties use the URL so filesystem traversal order cannot change the latest cards. */
export function compareByDate(a: Post, b: Post): number {
  return b.data.date.getTime() - a.data.date.getTime() || compareKey(a, b);
}

export function getPostUrl(post: Post): string {
  return `/${post.collection}/${post.slug}/`;
}

function normalizeTagLabel(tag: string): string {
  return tag.trim().normalize('NFC');
}

/** Case variants share a route on both case-sensitive and case-insensitive hosts. */
export function getTagKey(tag: string): string {
  return normalizeTagLabel(tag).toLocaleLowerCase('en-US');
}

export function getTagUrl(tag: string): string {
  return `/tags/${encodeURIComponent(getTagKey(tag))}/`;
}

/** Keep the author's first label, counting each logical tag once per article. */
export function getPostTags(post: Post): string[] {
  const labels = new Map<string, string>();
  for (const rawTag of post.data.tags) {
    const label = normalizeTagLabel(rawTag);
    const key = getTagKey(label);
    if (key && !labels.has(key)) labels.set(key, label);
  }
  return [...labels.values()];
}

function compareCodePoints(a: string, b: string): number {
  const left = [...a];
  const right = [...b];
  for (let index = 0; index < Math.min(left.length, right.length); index += 1) {
    const difference = left[index].codePointAt(0)! - right[index].codePointAt(0)!;
    if (difference) return difference;
  }
  return left.length - right.length;
}

function getTagCounts(posts: readonly Post[]): [string, number][] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const post of posts) {
    const seen = new Set<string>();
    for (const rawTag of post.data.tags) {
      const label = normalizeTagLabel(rawTag);
      const key = getTagKey(label);
      if (!key) continue;
      const current = counts.get(key) ?? { label, count: 0 };
      if (compareCodePoints(label, current.label) < 0) current.label = label;
      if (!seen.has(key)) current.count += 1;
      counts.set(key, current);
      seen.add(key);
    }
  }
  const tags: [string, number][] = [...counts.values()].map(({ label, count }) => [label, count]);
  return tags.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'));
}

function compareSeriesPosts(a: CSPost, b: CSPost): number {
  return a.data.weight - b.data.weight
    || a.data.date.getTime() - b.data.date.getTime()
    || compareKey(a, b);
}

function getPublicationYear(date: Date): number {
  return Number(new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'Asia/Shanghai' }).format(date));
}

/** One shared view for the homepage, archives, tags, feeds, search, and series pages. */
export function createContentIndex({ cs = [], poetry = [] }: ContentCollections) {
  const publishedCS = cs.filter(isPublished).sort(compareByDate);
  const publishedPoetry = poetry.filter(isPublished).sort(compareByDate);
  const visibleCS = publishedCS.filter(isVisible);
  const seriesEntries = visibleCS.filter(isSeriesEntry);
  const csPosts = visibleCS.filter(post => !isSeriesEntry(post));
  const poetryPosts = publishedPoetry.filter(isVisible);
  const posts: Post[] = [...csPosts, ...poetryPosts].sort(compareByDate);

  const series: Series[] = seriesEntries.map(entry => {
    const members = csPosts.filter(post => post.data.series?.includes(entry.data.title)).sort(compareSeriesPosts);
    return {
      entry,
      title: entry.data.title,
      description: entry.data.description,
      slug: entry.slug,
      pin: entry.data.pin,
      postCount: members.length,
      posts: members,
    };
  }).sort((a, b) => Number(b.pin) - Number(a.pin) || compareByDate(a.entry, b.entry));

  return {
    publishedCS,
    publishedPoetry,
    posts,
    csPosts,
    poetryPosts,
    seriesEntries,
    series,
    pinnedSeries: series.filter(entry => entry.pin),
    tags: getTagCounts(posts),
    latestPosts: posts.slice(0, 3),
    // This is the oldest dated content, not a claim about when the website launched.
    firstPublishedYear: posts.length ? getPublicationYear(posts[posts.length - 1].data.date) : null,
  };
}
