import walineStyles from '@waline/client/waline.css?url';
import type { init, WalineInstance } from '@waline/client';
import { scheduleBackgroundTask } from '../utils/background-tasks';
import { keepCommentDisplayEmojiFree } from './waline-display';
import { enhanceCommentInteractions } from './waline-interactions';

const serverURL = 'https://waline.iqwqi.win/';
type InitComments = typeof init;
let clientPromise: Promise<InitComments> | undefined;
let stylesPromise: Promise<void> | undefined;
let cancelPendingStyles: (() => void) | undefined;
let current: { element: HTMLElement; dispose: () => void } | undefined;

function prepareConnection() {
  if (document.querySelector('link[data-comment-connection]')) return;
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = new URL(serverURL).origin;
  link.crossOrigin = 'anonymous';
  link.dataset.commentConnection = '';
  link.dataset.astroTransitionPersist = 'comment-connection';
  document.head.append(link);
}

function loadStyles(): Promise<void> {
  const existing = document.getElementById('waline-client-styles') as HTMLLinkElement | null;
  if (existing?.dataset.loaded === 'true') return Promise.resolve();
  if (existing && stylesPromise) return stylesPromise;
  stylesPromise = new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.id = 'waline-client-styles';
    link.rel = 'stylesheet';
    link.href = walineStyles;
    link.dataset.astroTransitionPersist = 'waline-client-styles';
    const failed = () => {
      link.onload = null;
      link.onerror = null;
      link.remove();
      stylesPromise = undefined;
      cancelPendingStyles = undefined;
      reject(new Error('Comment stylesheet unavailable'));
    };
    cancelPendingStyles = failed;
    link.onload = () => {
      link.dataset.loaded = 'true';
      link.onload = null;
      link.onerror = null;
      cancelPendingStyles = undefined;
      resolve();
    };
    link.onerror = failed;
    document.head.append(link);
  });
  return stylesPromise;
}

async function loadResources(): Promise<InitComments> {
  clientPromise ??= import('@waline/client').then(({ init }) => init).catch(error => {
    clientPromise = undefined;
    throw error;
  });
  const [initComments] = await Promise.all([clientPromise, loadStyles()]);
  return initComments;
}

function mountComments() {
  const found = document.getElementById('waline');
  if (current?.element === found) return;
  current?.dispose();
  current = undefined;
  if (!found) return;
  const element = found;

  const lifetime = new AbortController();
  let instance: WalineInstance | null = null;
  let task: ReturnType<typeof scheduleBackgroundTask<InitComments>> | undefined;
  let stopInteractions: (() => void) | undefined;
  let observer: IntersectionObserver | undefined;
  let disposed = false;
  const status = element.parentElement?.querySelector<HTMLElement>('[data-comment-load-state]');
  const stopFormatting = keepCommentDisplayEmojiFree(element);
  prepareConnection();

  const showFailure = () => {
    element.setAttribute('aria-busy', 'false');
    if (!status) return;
    status.hidden = false;
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'comment-retry-button';
    retry.textContent = 'Try again';
    retry.addEventListener('click', () => start('navigation'), { once: true });
    status.replaceChildren(document.createTextNode('Couldn’t load comments. '), retry);
  };

  function start(priority: 'navigation' | 'prefetch' = 'prefetch') {
    if (disposed || instance || !element.isConnected) return;
    element.setAttribute('aria-busy', 'true');
    task = scheduleBackgroundTask({
      key: 'waline-client-resources',
      priority,
      signal: lifetime.signal,
      run: loadResources,
    });
    const pending = task;
    void pending.done.then(initComments => {
      if (disposed || instance || !element.isConnected) return;
      if (task === pending) task = undefined;
      if (!initComments) { showFailure(); return; }
      try {
        instance = initComments({
          el: element,
          serverURL,
          login: 'force',
          path: element.dataset.path || window.location.pathname,
          dark: false,
          lang: 'en-US',
          emoji: false,
          search: false,
          reaction: false,
          locale: {
            nick: 'Nickname',
            nickError: 'Enter a nickname of at least 3 bytes.',
            mail: 'Email',
            placeholder: 'Write a comment…',
            sofa: 'No comments yet.',
            submit: 'Post comment',
            login: 'Sign in',
            logout: 'Sign out',
            more: 'Load more comments',
            uploadImage: 'Upload an image',
            cancelLike: 'Unlike',
            word: 'words',
            sticky: 'Pinned',
            unsticky: 'Unpin',
            waiting: 'Pending review',
            latest: 'Newest',
            hottest: 'Most popular',
            level0: 'Lurker',
            level1: 'New voice',
            level2: 'Commentator',
            level3: 'Regular',
            level4: 'Chatterbox',
            level5: 'Legend',
            subPostComment: 'Subscribe to comments on this post',
            subSiteComment: 'Subscribe to all comments',
            subscribeToReplies: 'Subscribe to replies to your comments',
          },
        });
        if (!instance) { showFailure(); return; }
        stopInteractions = enhanceCommentInteractions(element);
        element.dataset.commentReady = 'true';
        element.setAttribute('aria-busy', 'false');
        if (status) status.hidden = true;
        observer?.disconnect();
      } catch (error) {
        console.error('Could not load comments', error);
        showFailure();
      }
    });
  }

  element.addEventListener('pointerenter', () => start('navigation'), { signal: lifetime.signal, passive: true });
  element.addEventListener('focusin', () => start('navigation'), { signal: lifetime.signal });
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) start('navigation');
    }, { rootMargin: '1200px' });
    observer.observe(element);
  }
  // The queue starts after page load. The API request then overlaps reading the article.
  start();
  current = {
    element,
    dispose() {
      if (disposed) return;
      disposed = true;
      task?.cancel();
      lifetime.abort();
      observer?.disconnect();
      stopInteractions?.();
      stopFormatting();
      instance?.destroy();
      delete element.dataset.commentReady;
    },
  };
}

mountComments();
document.addEventListener('astro:page-load', mountComments);
document.addEventListener('astro:before-swap', event => {
  const next = (event as Event & { newDocument?: Document }).newDocument;
  if (next?.getElementById('waline')) {
    // Astro keeps persisted head nodes only when the incoming head has a match.
    for (const selector of ['#waline-client-styles', 'link[data-comment-connection]']) {
      const link = document.head.querySelector(selector);
      if (link && !next.head.querySelector(selector)) next.head.append(link.cloneNode(true));
    }
  } else {
    // A removed stylesheet may never emit load/error. Settle it before discarding its node.
    cancelPendingStyles?.();
  }
  current?.dispose();
  current = undefined;
});
window.addEventListener('pagehide', () => {
  current?.dispose();
  current = undefined;
  cancelPendingStyles?.();
});
window.addEventListener('pageshow', event => { if (event.persisted) mountComments(); });
