// Waline flattens replies into one thread. Its own mention link still points
// to the actual parent, including when several comments have the same author.
function parentComment(container: HTMLElement, hash: string | null) {
  if (!hash?.startsWith('#')) return null;
  const item = container.ownerDocument.getElementById(hash.slice(1));
  return item?.classList.contains('wl-card-item') && container.contains(item) ? item : null;
}

function excerpt(body: HTMLElement): string {
  const parts = Array.from(body.children, element => element.textContent);
  let text = (parts.length ? parts.join(' ') : body.textContent || '').replace(/\s+/gu, ' ').trim();
  if (!text) {
    const image = body.querySelector('img');
    if (!image) return 'Original comment';
    const alt = image.alt.trim();
    text = alt && alt.toLowerCase() !== 'image' ? `Image: ${alt}` : 'Image';
  }
  const chars = Array.from(text);
  return chars.length > 96 ? chars.slice(0, 95).join('') + '…' : text;
}

export function updateReplyContext(container: HTMLElement, item: HTMLElement) {
  const body = item.querySelector<HTMLElement>(':scope > .wl-card > .wl-content');
  let reference = item.querySelector<HTMLElement>(':scope > .wl-card > .comment-reply-reference');
  const mention = body?.querySelector<HTMLAnchorElement>(':scope > .wl-reply-to > a');
  if (!body || (!mention && !item.parentElement?.classList.contains('wl-quote'))) {
    reference?.remove();
    return;
  }

  const hash = mention?.getAttribute('href') ?? null;
  const parent = parentComment(container, hash);
  const source = parent?.querySelector<HTMLElement>(':scope > .wl-card > .wl-content > div');
  const author = parent?.querySelector(':scope > .wl-card > .wl-head .wl-nick')?.textContent
    || mention?.textContent?.replace(/^@/u, '');
  const label = author ? `Replying to ${author}` : 'Reply';
  const preview = source ? excerpt(source) : 'Original comment unavailable';
  const tag = parent ? 'a' : 'span';

  if (reference?.localName !== tag) {
    reference?.remove();
    reference = item.ownerDocument.createElement(tag);
    reference.className = 'comment-reply-reference';
    reference.append(item.ownerDocument.createElement('strong'), item.ownerDocument.createElement('span'));
    body.before(reference);
  }
  if (parent && reference.getAttribute('href') !== hash) reference.setAttribute('href', hash!);
  if (reference.firstElementChild!.textContent !== label) reference.firstElementChild!.textContent = label;
  if (reference.lastElementChild!.textContent !== preview) reference.lastElementChild!.textContent = preview;
}

export function focusReplyParent(container: HTMLElement, link: HTMLAnchorElement) {
  const parent = parentComment(container, link.getAttribute('href'));
  if (parent) {
    parent.tabIndex = -1;
    parent.focus({ preventScroll: true });
  }
}
