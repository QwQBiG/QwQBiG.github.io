import { navigate } from 'astro:transitions/client';
import { isTransitionBeforeSwapEvent } from 'astro:transitions/client';
import { isContentNavigationPath } from '../utils/content-navigation';

let gradientStart: number | undefined;
let incomingStart: number | undefined;

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
  const incoming = event.newDocument.body;
  if (!incoming.classList.contains('gradient-bg') || !document.body.classList.contains('gradient-bg')) {
    gradientStart = incomingStart = undefined;
    return;
  }
  const now = document.timeline.currentTime;
  if (typeof now !== 'number') return;
  if (gradientStart === undefined) {
    const gradient = document.body.getAnimations?.().find(animation => (
      'animationName' in animation && animation.animationName === 'gradientShift'
    ));
    if (typeof gradient?.startTime !== 'number') return;
    gradientStart = gradient.startTime;
  }
  // Seed the existing CSS animation on the detached body. Looking it up after
  // insertion would synchronously style the new article just to read its clock.
  incomingStart = now;
  incoming.style.animationDelay = `${gradientStart - now}ms`;
});

// A long swap can take more than one frame. Align the new animation with the
// same timeline tick used for its negative delay when the browser starts it.
document.addEventListener('animationstart', event => {
  if (incomingStart === undefined || event.target !== document.body || event.animationName !== 'gradientShift') return;
  const animation = (event as AnimationEvent & { animation?: Animation }).animation
    ?? document.body.getAnimations?.().find(animation => 'animationName' in animation && animation.animationName === event.animationName);
  if (animation) animation.startTime = incomingStart;
  incomingStart = undefined;
});
