import walineStyles from '@waline/client/waline.css?url';
import { scheduleBackgroundTask } from '../utils/background-tasks';
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
    // Waline uses the backend's objectId as the card ID. RSS links on this
    // site use integers; Mongo/LeanCloud installations use 24 hex digits.
    if (!/^(?:\d+|[\da-f]{24})$/i.test(id) || document.getElementById(id)) return;
    start('navigation');
    if (!follow) return;

    // Native fragment scrolling runs before the comment API has inserted the card.
    const input = new AbortController();
    const findCard = () => {
      const card = document.getElementById(id);
      if (card && element.contains(card)) card.scrollIntoView({ block: 'start' });
      else if (element.querySelector('.wl-meta-foot')) element.scrollIntoView({ block: 'start' });
      else return;
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
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) start('navigation');
    }, { rootMargin: '1200px' });
    observer.observe(element);
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
