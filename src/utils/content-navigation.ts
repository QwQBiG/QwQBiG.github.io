/** Content pages share a lightweight navigation lifecycle. */
export function isContentNavigationPath(pathname: string): boolean {
  return /^\/(?:cs|poetry|series|tags)(?:\/|$)/.test(pathname)
    || /^\/archives\/?$/.test(pathname);
}

// A wide grid can expose an entire catalogue at once. Only the first two
// reading suggestions opt in to Astro's viewport dwell timer.
export function readingListPrefetch(index: number): 'viewport' | undefined {
  return index < 2 ? 'viewport' : undefined;
}
