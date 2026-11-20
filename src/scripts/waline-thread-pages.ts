import { createPageControls } from './waline-page-controls';

const pageSize = 5;
const rootSelector = '.wl-cards > .wl-card-item';
const quoteSelector = ':scope > .wl-card > .wl-quote';

function replyCards(quote: HTMLElement) {
  return Array.from(quote.querySelectorAll<HTMLElement>(':scope > .wl-card-item'));
}

function createThread(quote: HTMLElement, id: string) {
  const document = quote.ownerDocument;
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'comment-thread-toggle';
  const originalId = quote.id;
  if (!originalId) quote.id = id;
  toggle.setAttribute('aria-controls', quote.id);

  let open = false;
  let page = 1;
  let replies: HTMLElement[] = [];
  const controls = createPageControls(document, 'Reply pages', step => {
    page += step;
    render();
    const first = replies[(page - 1) * pageSize];
    first.tabIndex = -1;
    first.focus({ preventScroll: true });
    first.scrollIntoView({ block: 'start' });
  });
  toggle.addEventListener('click', () => {
    open = !open;
    render();
  });
  quote.before(toggle);
  quote.after(controls.nav);

  function render() {
    const pages = Math.ceil(replies.length / pageSize);
    page = Math.min(Math.max(page, 1), Math.max(1, pages));
    quote.hidden = !open;
    quote.toggleAttribute('data-thread-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    const label = open ? 'Hide replies' : `Show ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`;
    if (toggle.textContent !== label) toggle.textContent = label;
    controls.update(page, pages);
    controls.nav.hidden = !open || pages <= 1;
    const start = (page - 1) * pageSize;
    replies.forEach((reply, index) => {
      const hidden = index < start || index >= start + pageSize;
      if (reply.hidden !== hidden) reply.hidden = hidden;
    });
  }

  return {
    update(items: HTMLElement[]) {
      if (items.length === replies.length && items.every((item, index) => item === replies[index])) return;
      replies = items;
      render();
    },
    reveal(reply: HTMLElement) {
      const index = replies.indexOf(reply);
      if (index < 0) return;
      open = true;
      page = Math.floor(index / pageSize) + 1;
      render();
    },
    remove() {
      toggle.remove();
      controls.nav.remove();
      quote.hidden = false;
      quote.removeAttribute('data-thread-open');
      if (!originalId) quote.removeAttribute('id');
      for (const reply of replies) reply.hidden = false;
    },
  };
}

export function createThreadPages(container: HTMLElement, signal: AbortSignal) {
  const threads = new Map<HTMLElement, ReturnType<typeof createThread>>();
  let sequence = 0;
  let submission: { root: HTMLElement; previous: Set<HTMLElement> } | undefined;
  container.dataset.commentThreads = '';

  function sync(quote: HTMLElement) {
    const replies = replyCards(quote);
    let thread = threads.get(quote);
    if (!replies.length) {
      thread?.remove();
      threads.delete(quote);
      quote.hidden = true;
      return;
    }
    if (!thread) {
      thread = createThread(quote, `comment-thread-${++sequence}`);
      threads.set(quote, thread);
    }
    thread.update(replies);
    if (submission && submission.root === quote.closest(rootSelector)) {
      const previous = submission.previous;
      const posted = replies.find(reply => !previous.has(reply));
      if (posted) {
        thread.reveal(posted);
        submission = undefined;
      }
    }
    return thread;
  }

  // Waline appends a successful reply to the end of its root, even if the
  // author was replying to a message on an earlier page.
  function rememberSubmission(target: Element) {
    const root = target.closest('.wl-reply-wrapper')?.closest<HTMLElement>(rootSelector);
    if (!root) return;
    const quote = root.querySelector<HTMLElement>(quoteSelector);
    submission = { root, previous: new Set(quote ? replyCards(quote) : []) };
  }
  container.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('.wl-btn.primary')) rememberSubmission(event.target);
  }, { signal, capture: true });
  container.addEventListener('keydown', event => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && event.target instanceof HTMLTextAreaElement) {
      rememberSubmission(event.target);
    }
  }, { signal, capture: true });

  return {
    refresh() {
      if (submission && !container.contains(submission.root)) submission = undefined;
      for (const [quote, thread] of threads) {
        if (!container.contains(quote)) {
          thread.remove();
          threads.delete(quote);
        }
      }
      for (const root of container.querySelectorAll<HTMLElement>(rootSelector)) {
        const quote = root.querySelector<HTMLElement>(quoteSelector);
        if (quote) sync(quote);
      }
    },
    reveal(card: HTMLElement) {
      const quote = card.parentElement;
      if (quote?.classList.contains('wl-quote')) sync(quote)?.reveal(card);
    },
    dispose() {
      for (const thread of threads.values()) thread.remove();
      for (const quote of container.querySelectorAll<HTMLElement>('.wl-quote[hidden]')) quote.hidden = false;
      delete container.dataset.commentThreads;
    },
  };
}
