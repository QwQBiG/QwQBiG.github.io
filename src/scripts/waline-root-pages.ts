import { observeCommentPages, rootPageSize } from './waline-api';
import { createPageControls } from './waline-page-controls';

/** Waline appends fetched root comments. Keep its native cards, editors and retry handling. */
export function createRootPages(container: HTMLElement, signal: AbortSignal) {
  const document = container.ownerDocument;
  const path = container.dataset.path || document.location.pathname;
  const controls = createPageControls(document, 'Comment pages', turn);
  let page = 1;
  let fetched = 0;
  let remotePages = 0;
  let failed = false;
  let requested = 0;
  let loadingForAnchor = false;
  let focusFirst = false;
  let first: Element | undefined;
  let cards: HTMLElement[] = [];

  observeCommentPages(path, signal, {
    rootIds: () => new Set(Array.from(container.querySelectorAll(':scope > [data-waline] > .wl-cards > .wl-card-item'), card => card.id)),
    receive(read) {
      failed = read.totalPages === null;
      if (read.totalPages !== null) {
        fetched = read.page;
        remotePages = read.totalPages;
        if (read.page === 1) page = 1;
        else if (requested) {
          page = requested;
          focusFirst = true;
        }
      }
      requested = 0;
      loadingForAnchor = false;
      // Vue updates the cards after this response. The shared DOM observer
      // runs refresh once the new page or retry control is in place.
    },
  });

  function turn(step: number) {
    if (requested || loadingForAnchor) return;
    const target = page + step;
    if (target < 1) return;
    if (step > 0 && cards.length < target * rootPageSize && fetched < remotePages && !failed) {
      const more = container.querySelector<HTMLButtonElement>(':scope > [data-waline] > .wl-operation button');
      if (!more) return;
      requested = target;
      for (const button of controls.nav.querySelectorAll('button')) button.disabled = true;
      more.click();
      return;
    }
    if ((target - 1) * rootPageSize >= cards.length) return;
    page = target;
    focusFirst = true;
    refresh();
  }

  function refresh() {
    const list = container.querySelector<HTMLElement>(':scope > [data-waline] > .wl-cards');
    if (!list || (!fetched && !failed)) return;
    const previousCount = cards.length;
    cards = Array.from(list.children).filter((item): item is HTMLElement => item.classList.contains('wl-card-item'));
    // Waline prepends a newly posted top-level comment.
    if (page !== 1 && first && cards[1] === first) {
      page = 1;
      focusFirst = true;
    }
    first = cards[0];
    const loaded = Math.ceil(cards.length / rootPageSize);
    const total = loaded && fetched < remotePages ? Math.max(loaded, remotePages) : loaded;
    page = Math.max(1, Math.min(page, loaded));
    const start = (page - 1) * rootPageSize;
    for (const [index, card] of cards.entries()) card.hidden = index < start || index >= start + rootPageSize;

    const operation = container.querySelector<HTMLElement>(':scope > [data-waline] > .wl-operation');
    if (operation) operation.hidden = loaded > 0 && !failed;
    if (total > 1 && !controls.nav.isConnected) list.after(controls.nav);
    controls.update(page, total);
    if (requested || loadingForAnchor) {
      for (const button of controls.nav.querySelectorAll('button')) button.disabled = true;
    } else if (failed && page >= loaded) {
      const next = controls.nav.querySelector<HTMLButtonElement>('button:last-of-type');
      if (next) next.disabled = true;
    }
    // With no remaining cards Waline renders its empty state in place of Load
    // More. Fill the gap after moderation while the last loaded root is present.
    if (cards.length === 1 && previousCount > 1) loadMoreForAnchor();
    if (focusFirst && cards[start]) {
      focusFirst = false;
      cards[start].tabIndex = -1;
      cards[start].focus({ preventScroll: true });
      cards[start].scrollIntoView({ block: 'start' });
    }
  }

  // A linked reply may belong to a later server page. Append that page without
  // changing the reader's current view; the fragment handler reveals the match.
  function loadMoreForAnchor() {
    if (failed) return false;
    if (requested || loadingForAnchor || container.querySelector(':scope > [data-waline] > .wl-loading')) return true;
    if (fetched >= remotePages) return false;
    const more = container.querySelector<HTMLButtonElement>(':scope > [data-waline] > .wl-operation button');
    if (!more) return false;
    loadingForAnchor = true;
    more.click();
    return true;
  }

  function reveal(card: HTMLElement) {
    const root = card.closest<HTMLElement>('.wl-cards > .wl-card-item');
    if (!root) return;
    const index = Array.prototype.indexOf.call(root.parentElement!.children, root);
    const target = Math.floor(index / rootPageSize) + 1;
    if (target !== page) {
      requested = 0;
      page = target;
      refresh();
    }
  }

  function dispose() {
    controls.nav.remove();
    for (const card of cards) card.hidden = false;
    const operation = container.querySelector<HTMLElement>(':scope > [data-waline] > .wl-operation');
    if (operation) operation.hidden = false;
  }

  return { refresh, reveal, loadMoreForAnchor, dispose };
}
