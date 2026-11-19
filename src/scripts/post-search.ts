import { formatDisplayDate } from '../utils/date';
import type { TransitionBeforeSwapEvent } from 'astro:transitions/client';

interface SearchPost {
  title: string;
  description?: string;
  slug: string;
  collection: 'cs' | 'poetry';
  date: string;
  tags?: string[];
}

const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, char => entities[char]);
}

function highlight(text: string, pattern: RegExp) {
  return text.split(pattern).map((part, index) =>
    index % 2 ? `<mark class="bg-primary/20 text-primary px-1 rounded">${escapeHtml(part)}</mark>` : escapeHtml(part)
  ).join('');
}

function resultCard(post: SearchPost, pattern: RegExp, visibleTags: string[]) {
  return `<a href="/${escapeHtml(post.collection)}/${escapeHtml(post.slug)}/" class="search-result-item block">
    <h3 class="search-result-title">${highlight(post.title, pattern)}</h3>
    ${post.description ? `<p class="search-result-excerpt">${highlight(post.description, pattern)}</p>` : ''}
    <div class="search-result-meta">
      <time datetime="${escapeHtml(post.date)}">${formatDisplayDate(new Date(post.date))}</time>
      ${visibleTags.length ? `<span>${visibleTags.map(tag => highlight(tag, pattern)).join(', ')}</span>` : ''}
    </div>
  </a>`;
}

function message(text: string) {
  return `<div class="text-center text-text-muted py-12">${text}</div>`;
}

function indexPost(post: SearchPost) {
  const tags = (post.tags ?? []).map(tag => tag.toLowerCase());
  const fields = [post.title.toLowerCase(), post.description?.toLowerCase() ?? '', ...tags];
  return { post, fields, tags };
}

let posts: ReturnType<typeof indexPost>[] | undefined;
let pendingIndex: Promise<void> | undefined;

function requestIndex() {
  pendingIndex ??= fetch('/posts.json').then(async response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const index = await response.json();
    if (!Array.isArray(index)) throw new Error('Invalid article index');
    posts = index.map(indexPost);
  }).finally(() => { pendingIndex = undefined; });
  return pendingIndex;
}

export function initializePostSearch(input: HTMLInputElement, results: HTMLElement, restoreY = 0) {
  const lifetime = new AbortController();
  const { signal } = lifetime;
  let failed = false;
  let composing = false;
  let frame: number | undefined;

  function render() {
    const query = input.value.trim();
    if (!query) {
      results.innerHTML = message('Type to search.');
    } else if (failed) {
      results.innerHTML = message('Couldn’t load the posts. <button type="button" class="underline">Try again</button>');
      results.querySelector('button')?.addEventListener('click', loadPosts, { once: true, signal });
    } else if (!posts) {
      results.innerHTML = message('Loading posts…');
    } else {
      const lowerQuery = query.toLowerCase().replace(/\s+/g, ' ');
      const terms = [...new Set(lowerQuery.split(' '))].sort((a, b) => b.length - a.length);
      const phrases = terms.length > 1 ? [lowerQuery, ...terms] : terms;
      const alternatives = phrases.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const pattern = new RegExp(`(${alternatives.join('|')})`, 'gi');
      const phraseMatches: string[] = [];
      const otherMatches: string[] = [];
      for (const { post, fields, tags } of posts) {
        if (!terms.every(term => fields.some(field => field.includes(term)))) continue;

        const originalTags = post.tags ?? [];
        const matchedTags = originalTags.filter((_, i) => terms.some(term => tags[i].includes(term)));
        const visibleTags = [...new Set([...matchedTags, ...originalTags])].slice(0, 3);
        const exactPhrase = terms.length === 1 || fields.some(field => field.includes(lowerQuery));
        const cards = exactPhrase ? phraseMatches : otherMatches;
        cards.push(resultCard(post, pattern, visibleTags));
      }
      results.innerHTML = phraseMatches.join('') + otherMatches.join('') || message('No matching posts.');
    }
  }

  function scheduleRender() {
    if (signal.aborted || composing || frame !== undefined) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      if (composing) return;
      render();
      // A reload or a traversal with a pending index can initially have no
      // scroll range. Restore only if the reader has not interacted meanwhile.
      if (restoreY && posts && input.ownerDocument === document && input.isConnected) {
        window.scrollTo({ top: restoreY, behavior: 'instant' });
        restoreY = 0;
      }
    });
  }

  async function loadPosts() {
    failed = false;
    scheduleRender();
    try { await requestIndex(); } catch { failed = true; }
    scheduleRender();
  }

  function updateQuery() {
    restoreY = 0;
    try {
      if (history.state?.postSearchQuery !== input.value) {
        history.replaceState({ ...history.state, postSearchQuery: input.value }, '');
      }
    } catch {
      // Browsers may rate-limit history updates while typing. Search still works.
    }
    scheduleRender();
  }

  if (restoreY && !posts) {
    const cancelRestore = () => { restoreY = 0; };
    for (const name of ['pointerdown', 'wheel', 'keydown']) {
      window.addEventListener(name, cancelRestore, { passive: true, once: true, signal });
    }
  } else {
    restoreY = 0;
  }

  input.addEventListener('compositionstart', () => { composing = true; }, { signal });
  input.addEventListener('compositionend', () => {
    composing = false;
    updateQuery();
  }, { signal });
  input.addEventListener('input', event => {
    if (!composing && !(event as InputEvent).isComposing) updateQuery();
  }, { signal });

  if (posts) render();
  else void loadPosts();

  return () => {
    lifetime.abort();
    if (frame !== undefined) cancelAnimationFrame(frame);
  };
}

export function startPostSearch() {
  let active: HTMLInputElement | null = null;
  let dispose: (() => void) | undefined;

  function mount(doc: Document, saved: { postSearchQuery?: string; scrollY?: number } | null) {
    const input = doc.querySelector<HTMLInputElement>('#search-input');
    if (input === active) return;
    dispose?.();
    dispose = undefined;
    active = input;
    const results = doc.querySelector<HTMLElement>('#search-results');
    if (!input || !results) return;

    if (posts || pendingIndex) doc.querySelector('link[rel="preload"][href="/posts.json"]')?.remove();
    input.value = typeof saved?.postSearchQuery === 'string' ? saved.postSearchQuery : '';
    dispose = initializePostSearch(input, results, input.value ? saved?.scrollY : 0);
  }

  // On a history traversal Astro restores scrolling immediately after swapping
  // bodies. Rebuild cached results in the incoming document before that happens.
  document.addEventListener('astro:before-swap', event => {
    const swap = event as TransitionBeforeSwapEvent;
    mount(swap.newDocument, swap.navigationType === 'traverse' ? history.state : null);
  });
  const mountCurrent = () => mount(document, history.state);
  mountCurrent();
  document.addEventListener('astro:page-load', mountCurrent);
}
