import { prioritizeNavigation, scheduleBackgroundTask } from '../utils/background-tasks';
import {
  allowNavigationAssets,
  fetchNavigationAsset,
  navigationDestination,
  readNavigationManifest,
  selectNavigationAssets,
} from '../utils/navigation-warmup';
import type { NavigationConnection, NavigationManifest } from '../utils/navigation-warmup';
import type { NavigationIntent } from './navigation-prefetch';
import type { TransitionBeforeSwapEvent } from 'astro:transitions/client';

type WarmupPriority = 'navigation' | 'prefetch';

export function initializeNavigationWarmup(prefetchHTML: typeof import('astro:prefetch').prefetch) {
  const connection = () => (navigator as Navigator & { connection?: NavigationConnection }).connection;
  const canWarm = () => allowNavigationAssets(connection(), navigator.onLine);
  const knownAssets = new Set<string>();
  let neighborManifest: NavigationManifest | null = null;
  function rememberPageAssets() {
    const hint = document.querySelector<HTMLLinkElement>('link[rel="navigation-assets"][data-article-neighbors]');
    try {
      neighborManifest = hint?.dataset.articleNeighbors ? readNavigationManifest(JSON.parse(hint.dataset.articleNeighbors)) : null;
    } catch {
      neighborManifest = null;
    }
    for (const element of document.querySelectorAll<HTMLLinkElement | HTMLScriptElement>('link[rel="stylesheet"][href], link[rel="preload"][href], link[rel="modulepreload"][href], script[src]')) {
      knownAssets.add(element instanceof HTMLLinkElement ? element.href : element.src);
    }
  }
  rememberPageAssets();

  let postObserver: IntersectionObserver | undefined;
  let observedNav: HTMLElement | undefined;
  let previousTimer: number | undefined;
  let manifest: NavigationManifest | null = null;
  let lifetime = new AbortController();
  let currentIntent: { href: string; link: HTMLAnchorElement; committed: boolean } | undefined;
  let hoverLink: HTMLAnchorElement | undefined;

  function resetIntent() {
    hoverLink = undefined;
    currentIntent = undefined;
  }

  function destinationLink(event: Event): HTMLAnchorElement | null {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!link || link.hasAttribute('download') || link.dataset.astroPrefetch === 'false' ||
      (link.target && link.target !== '_self')) return null;
    return link;
  }

  async function loadManifest(priority: WarmupPriority, signal: AbortSignal) {
    if (manifest) return manifest;
    const hint = document.querySelector<HTMLLinkElement>('link[rel="navigation-assets"][href]');
    if (!hint || new URL(hint.href).origin !== window.location.origin) return null;
    const job = scheduleBackgroundTask({
      key: `navigation-manifest:${hint.href}`,
      priority,
      signal,
      run: async (attemptSignal, context) => {
        const response = await fetch(hint.href, {
          signal: attemptSignal,
          cache: 'force-cache',
          priority: context.priority === 'navigation' ? 'high' : 'low',
          credentials: 'same-origin',
        });
        if (response.status !== 200 || !response.headers.get('content-type')?.includes('application/json')) return null;
        return readNavigationManifest(await response.json());
      },
    });
    const loaded = await job.done;
    if (signal.aborted || !loaded) return null;
    manifest = loaded;
    return loaded;
  }

  async function warmDestination(destination: URL, priority: WarmupPriority, signal: AbortSignal) {
    try {
      if (!canWarm() || signal.aborted) return;
      const loaded = neighborManifest && Object.hasOwn(neighborManifest.routes, destination.pathname)
        ? neighborManifest : await loadManifest(priority, signal);
      if (!loaded || signal.aborted || !canWarm()) return;
      const assets = selectNavigationAssets(loaded, destination, window.location.href, knownAssets, connection());
      await Promise.all(assets.map(async (asset) => {
        const job = scheduleBackgroundTask({
          key: `navigation-asset:${asset.url}`,
          priority,
          signal,
          run: async (attemptSignal, context) => canWarm() &&
            fetchNavigationAsset(asset, attemptSignal, fetch, context.priority === 'navigation' ? 'high' : 'low'),
        });
        if (await job.done) knownAssets.add(asset.url);
      }));
    } catch {
      // Hints never hold up the existing navigation or execute destination code.
    }
  }

  function beginIntent(link: HTMLAnchorElement, committed = false) {
    const destination = navigationDestination(link.href, window.location.href);
    if (!destination) return;
    if (committed) {
      window.clearTimeout(previousTimer);
      prioritizeNavigation();
    }
    if (currentIntent?.href === destination.href) {
      currentIntent.committed ||= committed;
      return;
    }
    currentIntent = { href: destination.href, link, committed };
    void warmDestination(destination, 'navigation', lifetime.signal);
  }

  function prepareHover(event: Event) {
    if (document.readyState !== 'complete' || !canWarm() || (event instanceof PointerEvent && event.pointerType === 'touch')) return;
    const link = destinationLink(event);
    if (!link || hoverLink === link ||
      (currentIntent?.committed && document.getElementById('navCard')?.getAttribute('aria-busy') === 'true')) return;
    hoverLink = link;
    prefetchHTML(link.href, { ignoreSlowConnection: true });
    beginIntent(link);
  }

  function leaveHover(event: FocusEvent | PointerEvent) {
    const link = destinationLink(event);
    if (!link || (event.relatedTarget instanceof Node && link.contains(event.relatedTarget))) return;
    if (hoverLink === link) hoverLink = undefined;
    if (currentIntent?.link === link && !currentIntent.committed) currentIntent = undefined;
    // Keep a started download: returning to this link can reuse the same request/cache.
  }

  function watchPostNavigation() {
    const nav = document.querySelector<HTMLElement>('article nav[data-post-navigation]');
    if (!nav || typeof IntersectionObserver !== 'function') return;
    if (nav === observedNav && !postObserver) return;
    postObserver?.disconnect();
    observedNav = nav;
    const signal = lifetime.signal;
    postObserver = new IntersectionObserver((entries, observer) => {
      if (observer !== postObserver || signal.aborted || !nav.isConnected || document.hidden || !canWarm()) return;
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      postObserver = undefined;
      function warmPost(link: HTMLAnchorElement) {
        const destination = navigationDestination(link.href, window.location.href);
        if (!destination) return;
        prefetchHTML(destination.href, { with: 'fetch', ignoreSlowConnection: true });
        void warmDestination(destination, 'prefetch', signal);
      }
      const next = nav.querySelector<HTMLAnchorElement>('a[rel~="next"][href]');
      const prev = nav.querySelector<HTMLAnchorElement>('a[rel~="prev"][href]');
      if (next) warmPost(next);
      if (!prev) return;
      if (!next) {
        warmPost(prev);
        return;
      }
      // A quick tap on Next should get the connection to itself. Readers who
      // pause at the footer still have both directions ready before choosing.
      previousTimer = window.setTimeout(() => {
        if (!signal.aborted && !document.hidden && canWarm() && !currentIntent?.committed) warmPost(prev);
      }, 180);
    }, { rootMargin: `0px 0px ${window.innerHeight}px 0px` });
    postObserver.observe(nav);
  }

  function preparePrimaryNavigation() {
    if (document.readyState !== 'complete' || document.hidden || !canWarm() || lifetime.signal.aborted) return;
    // Reading an article needs no site-wide index. Other destinations can
    // still request it on intent; list pages retain their existing warmup.
    if (!document.querySelector('main article .prose, main article.poetry-article')) {
      void loadManifest('prefetch', lifetime.signal).catch(() => {});
    }
    if (window.location.pathname !== '/') {
      watchPostNavigation();
      return;
    }
    const links = [...document.querySelectorAll<HTMLAnchorElement>('#navCard a[href], a[href="/gallery/"]')];
    const destinations = new Map<string, URL>();
    for (const link of links) {
      if (link.dataset.astroPrefetch === 'false' || link.hasAttribute('download') || (link.target && link.target !== '_self')) continue;
      const destination = navigationDestination(link.href, window.location.href);
      if (destination) destinations.set(destination.href, destination);
    }
    const rank = (url: URL) => url.pathname === '/cs/' ? 0 : url.pathname === '/gallery/' ? 1 : 2;
    for (const destination of [...destinations.values()].sort((a, b) => rank(a) - rank(b))) {
      prefetchHTML(destination.href, { ignoreSlowConnection: true });
      void warmDestination(destination, 'prefetch', lifetime.signal);
    }
  }

  function stop() {
    window.clearTimeout(previousTimer);
    postObserver?.disconnect();
    postObserver = undefined;
    observedNav = undefined;
    lifetime.abort();
    resetIntent();
  }

  document.addEventListener('pointerover', prepareHover, { passive: true });
  document.addEventListener('pointerout', leaveHover, { passive: true });
  document.addEventListener('focusin', prepareHover, { passive: true });
  document.addEventListener('focusout', leaveHover, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) resetIntent();
    else preparePrimaryNavigation();
  });
  window.addEventListener('pagehide', stop);
  window.addEventListener('load', preparePrimaryNavigation, { once: true });
  window.addEventListener('pageshow', () => {
    if (lifetime.signal.aborted) lifetime = new AbortController();
    preparePrimaryNavigation();
  });
  document.addEventListener('astro:before-swap', event => {
    stop();
    const swap = event as TransitionBeforeSwapEvent;
    const direction = swap.sourceElement?.closest('nav[data-post-navigation] a[rel]')?.getAttribute('rel');
    if ((direction !== 'next' && direction !== 'prev') || swap.navigationType === 'traverse' ||
      swap.signal.aborted || document.hidden || !canWarm()) return;

    // The chosen article and its styles are ready. Give the next tap in the
    // same direction a head start, using Astro's existing HTML prefetch cache.
    const link = swap.newDocument.querySelector(`nav[data-post-navigation] a[rel~="${direction}"][href]`);
    const href = link?.getAttribute('href');
    const destination = href && navigationDestination(href, swap.to.href);
    if (destination && destination.href !== swap.from.href) {
      prefetchHTML(destination.href, { with: 'fetch', ignoreSlowConnection: true });
    }
  });
  document.addEventListener('astro:page-load', () => {
    if (lifetime.signal.aborted) {
      lifetime = new AbortController();
      rememberPageAssets();
    }
    resetIntent();
    preparePrimaryNavigation();
  });
  preparePrimaryNavigation();

  return (intent: NavigationIntent) => beginIntent(intent.link, true);
}
