import { navigate } from 'astro:transitions/client';
import { isTransitionBeforeSwapEvent } from 'astro:transitions/client';
import { isContentNavigationPath } from '../utils/content-navigation';

let gradientTime: number | undefined;
let capturedAt = 0;

// The floating glass card stops bubbling clicks for its tilt effect. Capture
// supported links before that handler, preserving modifiers and native anchors.
document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = event.composedPath()[0];
  const link = target instanceof Element ? target.closest<HTMLAnchorElement | HTMLAreaElement | SVGAElement>('a[href], area[href]') : null;
  if (!link || link.hasAttribute('download') || link.hasAttribute('data-astro-reload')) return;
  const linkTarget = link.getAttribute('target');
  if (linkTarget && linkTarget !== '_self') return;

  let destination: URL;
  try {
    destination = new URL(link.getAttribute('href')!, link.baseURI);
  } catch {
    return;
  }
  if (destination.origin !== window.location.origin) return;
  if (!isContentNavigationPath(destination.pathname)) {
    // Astro's bubbling click handler reads this flag. Let the browser follow
    // the link normally, even for links inserted after a client-side swap.
    link.dataset.astroReload = '';
    setTimeout(() => { delete link.dataset.astroReload; }, 0);
    return;
  }
  if (!link.closest('#floatingNavCard') ||
      (destination.pathname === window.location.pathname && destination.search === window.location.search)) return;
  event.preventDefault();
  void navigate(destination.href);
}, { capture: true });

document.addEventListener('astro:before-swap', (event) => {
  if (!isTransitionBeforeSwapEvent(event)) return;
  const gradient = document.body.getAnimations?.().find(animation => (
    'animationName' in animation && animation.animationName === 'gradientShift'
  ));
  gradientTime = typeof gradient?.currentTime === 'number' ? gradient.currentTime : undefined;
  capturedAt = performance.now();
});

document.addEventListener('astro:after-swap', () => {
  if (gradientTime === undefined) return;
  const gradient = document.body.getAnimations?.().find(animation => (
    'animationName' in animation && animation.animationName === 'gradientShift'
  ));
  if (gradient) gradient.currentTime = gradientTime + performance.now() - capturedAt;
  gradientTime = undefined;
});
