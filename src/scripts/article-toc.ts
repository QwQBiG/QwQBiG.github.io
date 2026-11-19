let currentTOC: { element: HTMLElement; dispose: () => void } | undefined;

function initializeArticleTOC() {
  const element = document.querySelector<HTMLElement>('[data-article-toc]');
  if (element && currentTOC?.element === element) return;
  currentTOC?.dispose();
  currentTOC = undefined;
  if (!element) return;

  const mobile = document.querySelector<HTMLDetailsElement>('[data-mobile-toc]');
  const sidebar = document.querySelector<HTMLElement>('[data-toc-sidebar]');
  if (!mobile || !sidebar) return;
  const desktop = window.matchMedia('(min-width: 1024px)');
  const lifetime = new AbortController();
  const options = { signal: lifetime.signal };
  let sections: { heading: HTMLElement; link: HTMLAnchorElement }[] | undefined;
  let stopTracking: (() => void) | undefined;
  let active: HTMLAnchorElement | undefined;
  let frame: number | undefined;

  function highlight() {
    frame = undefined;
    if (!sections) return;
    // TOC order matches the article. Live viewport positions also reflect code
    // folding, images and diagrams that changed height after the first paint.
    let low = 0;
    let high = sections.length;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (Math.round(sections[middle].heading.getBoundingClientRect().top) <= 100) low = middle + 1;
      else high = middle;
    }
    const next = sections[low - 1]?.link;
    if (next === active) return;
    active?.classList.remove('active');
    active?.removeAttribute('aria-current');
    next?.classList.add('active');
    next?.setAttribute('aria-current', 'location');
    active = next;
  }

  function schedule() {
    if (stopTracking && frame === undefined) frame = requestAnimationFrame(highlight);
  }

  function cancel() {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  }

  const syncTracking = () => {
    if (!desktop.matches && !mobile.open) {
      stopTracking?.();
      return;
    }
    if (stopTracking) return;
    if (!sections) {
      sections = [];
      for (const link of element.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
        const heading = document.getElementById(link.getAttribute('href')!.slice(1));
        if (heading) sections.push({ heading, link });
      }
    }
    if (!sections.length) return;

    const visible = new AbortController();
    const events = { signal: visible.signal };
    const article = sections[0].heading.closest('article');
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : undefined;
    if (article) resize?.observe(article);
    window.addEventListener('scroll', schedule, { ...events, passive: true });
    window.addEventListener('resize', schedule, events);
    window.addEventListener('pageshow', schedule, events);
    window.addEventListener('pagehide', cancel, events);
    stopTracking = () => {
      visible.abort();
      resize?.disconnect();
      cancel();
      stopTracking = undefined;
    };
    schedule();
  };

  const placeContents = () => {
    const container = desktop.matches ? sidebar : mobile;
    if (element.parentElement !== container) container.append(element);
    sidebar.hidden = !desktop.matches;
    if (desktop.matches) mobile.open = false;
    syncTracking();
  };

  mobile.querySelector('[data-toc-fallback]')?.remove();
  mobile.addEventListener('toggle', syncTracking, options);
  desktop.addEventListener('change', placeContents, options);
  placeContents();

  currentTOC = {
    element,
    dispose() {
      lifetime.abort();
      stopTracking?.();
      active?.classList.remove('active');
      active?.removeAttribute('aria-current');
    },
  };
}

initializeArticleTOC();
document.addEventListener('astro:after-swap', initializeArticleTOC);
document.addEventListener('astro:page-load', initializeArticleTOC);
document.addEventListener('astro:before-swap', () => {
  currentTOC?.dispose();
  currentTOC = undefined;
});
