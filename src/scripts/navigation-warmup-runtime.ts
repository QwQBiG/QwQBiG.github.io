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

type WarmupPriority = 'navigation' | 'prefetch';

export function initializeNavigationWarmup(prefetchHTML: typeof import('astro:prefetch').prefetch) {
  const connection = () => (navigator as Navigator & { connection?: NavigationConnection }).connection;
  const canWarm = () => allowNavigationAssets(connection(), navigator.onLine);
  const knownAssets = new Set<string>();
  function rememberPageAssets() {
    for (const element of document.querySelectorAll<HTMLLinkElement | HTMLScriptElement>('link[rel="stylesheet"][href], link[rel="preload"][href], link[rel="modulepreload"][href], script[src]')) {
      knownAssets.add(element instanceof HTMLLinkElement ? element.href : element.src);
    }
  }
  rememberPageAssets();

  let postObserver: IntersectionObserver | undefined;
  let observedNav: HTMLElement | undefined;
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
      const loaded = await loadManifest(priority, signal);
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
    if (committed) prioritizeNavigation();
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
      // Both links share one footer. Start the forward route first when both exist.
      for (const relation of ['next', 'prev']) {
        const link = nav.querySelector<HTMLAnchorElement>(`a[rel~="${relation}"][href]`);
        const destination = link && navigationDestination(link.href, window.location.href);
        if (!destination) continue;
        prefetchHTML(destination.href, { with: 'fetch', ignoreSlowConnection: true });
        void warmDestination(destination, 'prefetch', signal);
      }
    }, { rootMargin: `0px 0px ${window.innerHeight}px 0px` });
    postObserver.observe(nav);
  }

  function preparePrimaryNavigation() {
    if (document.readyState !== 'complete' || document.hidden || !canWarm() || lifetime.signal.aborted) return;
    // Read the small shared manifest immediately after load, before the first hover.
    void loadManifest('prefetch', lifetime.signal).catch(() => {});
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
  document.addEventListener('astro:before-swap', stop);
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
