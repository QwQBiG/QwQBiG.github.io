import { prefetch } from 'astro:prefetch';

export type NavigationIntent = { link: HTMLAnchorElement; href: string; startedAt: number };

let handleIntent: ((intent: NavigationIntent) => void) | undefined;
let pendingIntent: NavigationIntent | undefined;
let enhancement: Promise<void> | undefined;

function enableEnhancement() {
  enhancement ??= import('./navigation-warmup-runtime').then(({ initializeNavigationWarmup }) => {
    handleIntent = initializeNavigationWarmup((href) => prefetch(href, { ignoreSlowConnection: true }));
    if (pendingIntent?.link.isConnected && !document.hidden) handleIntent(pendingIntent);
    pendingIntent = undefined;
  }).catch(() => {
    enhancement = undefined;
    // HTML prefetch and normal navigation work even if this optional module fails.
  });
  return enhancement;
}

// Keep the initial module as small as the original HTML-only prefetch path.
// Parse the asset manifest and load its scheduler only after the page has loaded.
function prepareEnhancement() {
  if (document.hidden) return;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (connection?.saveData || navigator.onLine === false) return;
  void enableEnhancement();
}

// Explicit intent still works before the idle module is ready, including touch
// and keyboard clicks. Replay its original timestamp so late hints cannot race navigation.
function prefetchNavigation(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (document.getElementById('navCard')?.getAttribute('aria-busy') === 'true') return;
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
  if (!link || link.hasAttribute('download') || link.dataset.astroPrefetch === 'false' || (link.target && link.target !== '_self')) return;
  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin || destination.username || destination.password ||
    (destination.pathname === window.location.pathname && destination.search === window.location.search)) return;
  destination.hash = '';
  prefetch(destination.href, { ignoreSlowConnection: true });
  window.dispatchEvent(new Event('site:navigation-intent'));
  const intent = { link, href: destination.href, startedAt: Date.now() };
  if (handleIntent) handleIntent(intent);
  else {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (connection?.saveData || navigator.onLine === false) return;
    if (pendingIntent?.href !== intent.href) pendingIntent = intent;
    void enableEnhancement();
  }
}

document.addEventListener('pointerdown', prefetchNavigation, { capture: true, passive: true });
document.addEventListener('click', prefetchNavigation, { capture: true, passive: true });
window.addEventListener('pagehide', () => { pendingIntent = undefined; });
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && document.readyState === 'complete') prepareEnhancement();
});
if (document.readyState === 'complete') prepareEnhancement();
else window.addEventListener('load', prepareEnhancement, { once: true });
