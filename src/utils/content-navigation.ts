/** Content pages share a lightweight navigation lifecycle. */
export function isContentNavigationPath(pathname: string): boolean {
  return /^\/(?:cs|poetry|series|tags)(?:\/|$)/.test(pathname)
    || /^\/archives\/?$/.test(pathname);
}
