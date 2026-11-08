import { navigate } from 'astro:transitions/client';
import { isTransitionBeforeSwapEvent } from 'astro:transitions/client';
import { isContentNavigationPath } from '../utils/content-navigation';

let gradientTime: number | undefined;
let capturedAt = 0;

function prepareContentLinks() {
  if (!isContentNavigationPath(window.location.pathname)) return;
  for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    const destination = new URL(link.href, window.location.href);
    if (destination.origin === window.location.origin && !isContentNavigationPath(destination.pathname)) {
      link.dataset.astroReload = '';
    }
  }
}

// The floating glass card stops bubbling clicks for its tilt effect. Capture
// supported links before that handler, preserving modifiers and native anchors.
document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
  if (!link?.closest('#floatingNavCard') || link.hasAttribute('download') || link.hasAttribute('data-astro-reload') ||
    (link.target && link.target !== '_self')) return;
  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin || !isContentNavigationPath(destination.pathname) ||
    (destination.pathname === window.location.pathname && destination.search === window.location.search)) return;
  event.preventDefault();
  void navigate(destination.href);
}, { capture: true });

document.addEventListener('astro:before-swap', (event) => {
  if (!isTransitionBeforeSwapEvent(event)) return;
  // Content previously changed without a crossfade; keep that same visual behavior.
  event.viewTransition.skipTransition();
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

prepareContentLinks();
document.addEventListener('astro:page-load', prepareContentLinks);
