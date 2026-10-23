import { prefetch } from 'astro:prefetch';

// Start warming the destination before a click animation delays navigation.
function prefetchNavigation(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (document.getElementById('navCard')?.getAttribute('aria-busy') === 'true') return;
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin ||
      (destination.pathname === window.location.pathname && destination.search === window.location.search)) return;

  // An explicit navigation intent also applies on data-saving connections.
  prefetch(destination.href, { ignoreSlowConnection: true });
}

document.addEventListener('pointerdown', prefetchNavigation, { capture: true, passive: true });
document.addEventListener('click', prefetchNavigation, { capture: true, passive: true });
