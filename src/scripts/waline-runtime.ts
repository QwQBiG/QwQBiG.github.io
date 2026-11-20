import walineStyles from '@waline/client/waline.css?url';
import { scheduleBackgroundTask } from '../utils/background-tasks';
import type { TransitionBeforePreparationEvent } from 'astro:transitions/client';
import type { mountWaline } from './waline-client';

const serverURL = 'https://waline.iqwqi.win/';
type MountWaline = typeof mountWaline;
let clientPromise: Promise<MountWaline> | undefined;
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

async function loadResources(): Promise<MountWaline> {
  clientPromise ??= import('./waline-client').then(module => module.mountWaline).catch(error => {
    clientPromise = undefined;
    throw error;
  });
  const [mount] = await Promise.all([clientPromise, loadStyles()]);
  return mount;
}

function mountComments() {
  const found = document.getElementById('waline');
  if (current?.element === found) return;
  current?.dispose();
  current = undefined;
  if (!found) return;
  const element = found;

  const lifetime = new AbortController();
  let unmount: (() => void) | undefined;
  let task: ReturnType<typeof scheduleBackgroundTask<MountWaline>> | undefined;
  let observer: IntersectionObserver | undefined;
  let disposed = false;
  let cancelAnchor: (() => void) | undefined;
  const status = element.parentElement?.querySelector<HTMLElement>('[data-comment-load-state]');

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
    if (disposed || unmount || !element.isConnected) return;
    prepareConnection();
    element.setAttribute('aria-busy', 'true');
    const pending = scheduleBackgroundTask({
      key: 'waline-client-resources',
      priority,
      signal: lifetime.signal,
      run: loadResources,
    });
    if (task === pending) return;
    task = pending;
    void pending.done.then(mount => {
      if (disposed || unmount || !element.isConnected) return;
      if (task === pending) task = undefined;
      if (!mount) { showFailure(); return; }
      try {
        unmount = mount(element, serverURL);
        if (!unmount) { showFailure(); return; }
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

  function loadCommentFragment(hash: string, follow: boolean) {
    cancelAnchor?.();
    const id = hash.slice(1);
    if (id === element.id) {
      start('navigation');
      return;
    }
    const existing = document.getElementById(id);
    if (existing) {
      if (follow && element.contains(existing) && existing.classList.contains('wl-card-item')) {
        existing.dispatchEvent(new Event('waline:reveal-comment', { bubbles: true }));
      }
      return;
    }
    // RSS links use integer or Mongo-style comment IDs. Other fragments
    // belong to the article and should not trigger a search through comments.
    if (!/^(?:\d+|[\da-f]{24})$/i.test(id)) return;
    start('navigation');
    if (!follow) return;

    // Native fragment scrolling runs before the comment API has inserted the card.
    const input = new AbortController();
    const findCard = () => {
      const card = document.getElementById(id);
      if (card && element.contains(card)) {
        card.dispatchEvent(new Event('waline:reveal-comment', { bubbles: true }));
        card.scrollIntoView({ block: 'start' });
      } else if (element.querySelector('.wl-meta-foot')) {
        // A shared link can refer to a thread outside the first server page.
        // Continue only while the visitor is still waiting for this fragment.
        if (!element.dispatchEvent(new Event('waline:find-comment', { cancelable: true }))) return;
        element.scrollIntoView({ block: 'start' });
      } else return;
      cancelAnchor?.();
    };
    const changes = new MutationObserver(findCard);
    cancelAnchor = () => {
      changes.disconnect();
      input.abort();
      cancelAnchor = undefined;
    };
    for (const event of ['pointerdown', 'touchstart', 'wheel', 'keydown']) {
      window.addEventListener(event, cancelAnchor, { signal: input.signal, passive: true, capture: true });
    }
    changes.observe(element, { childList: true, subtree: true });
    findCard();
  }

  const fromLocation = () => {
    // Native heading links have no Astro history state. Let the browser restore
    // that entry's reading position when Back leaves a delayed comment target.
    if (window.location.hash && history.state === null) history.scrollRestoration = 'auto';
    loadCommentFragment(window.location.hash, !history.state?.scrollY);
  };
  // Astro may push a same-page URL without emitting a native hashchange.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element && event.target.closest<HTMLAnchorElement>('a[href*="#"]');
    if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
    const here = window.location;
    if (link.origin === here.origin && link.pathname === here.pathname && link.search === here.search) {
      loadCommentFragment(link.hash, true);
    }
  }, { signal: lifetime.signal, capture: true });
  window.addEventListener('hashchange', fromLocation, { signal: lifetime.signal });
  if (window.location.search && new URLSearchParams(window.location.search).has('token')) start('navigation');
  fromLocation();
  element.addEventListener('pointerenter', () => start('navigation'), { signal: lifetime.signal, passive: true });
  element.addEventListener('focusin', () => start('navigation'), { signal: lifetime.signal });
  if ('IntersectionObserver' in window) {
    const postLinks = document.querySelector('article nav[data-post-navigation]');
    const marker = status ?? element;
    let nearby = false;
    let timer: number | undefined;
    let departing: AbortSignal | undefined;

    function cancelProximity() {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = undefined;
    }

    function onProximity() {
      cancelProximity();
      if (!nearby || departing || unmount || task || disposed) return;
      // A series reader can pass the entire footer in one swipe. Comments
      // already near the top of a short page still start immediately.
      if (postLinks && window.scrollY > 0) timer = window.setTimeout(() => start('navigation'), 180);
      else start('navigation');
    }

    // Establish the backend connection as the reader approaches the footer.
    // Only a sustained approach warms the local assets. Mounting (and the
    // first API request) still uses the closer boundary below.
    let warmTimer: number | undefined;
    let warming: typeof task;
    const cancelWarmup = () => {
      if (warmTimer !== undefined) window.clearTimeout(warmTimer);
      warmTimer = undefined;
    };
    const approach = new IntersectionObserver(entries => {
      cancelWarmup();
      if (!entries[entries.length - 1]?.isIntersecting || departing || disposed || unmount) return;
      prepareConnection();
      warmTimer = window.setTimeout(() => {
        if (!task && !unmount && !departing && !disposed) {
          warming = scheduleBackgroundTask({
            key: 'waline-client-resources',
            priority: 'prefetch',
            signal: lifetime.signal,
            run: loadResources,
          });
        }
        approach.disconnect();
      }, 600);
    }, { rootMargin: '3000px 0px' });
    approach.observe(marker);
    lifetime.signal.addEventListener('abort', () => { cancelWarmup(); approach.disconnect(); }, { once: true });

    if (postLinks) document.addEventListener('astro:before-preparation', event => {
      const navigation = event as TransitionBeforePreparationEvent;
      if (!navigation.sourceElement || !postLinks.contains(navigation.sourceElement)) return;
      const signal = departing = navigation.signal;
      cancelProximity();
      cancelWarmup();
      if (!task) warming?.cancel();
      const resume = () => {
        if (departing === signal && !disposed) {
          departing = undefined;
          onProximity();
        }
      };
      signal.addEventListener('abort', resume, { once: true, signal: lifetime.signal });
      queueMicrotask(() => { if (navigation.defaultPrevented || signal.aborted) resume(); });
    }, { signal: lifetime.signal });
    lifetime.signal.addEventListener('abort', cancelProximity, { once: true });
    observer = new IntersectionObserver(entries => {
      nearby = entries[entries.length - 1]?.isIntersecting ?? false;
      onProximity();
    }, { rootMargin: '1200px' });
    observer.observe(marker);
  } else {
    start();
  }
  current = {
    element,
    dispose() {
      if (disposed) return;
      disposed = true;
      task?.cancel();
      lifetime.abort();
      cancelAnchor?.();
      observer?.disconnect();
      unmount?.();
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
