let currentTOC: { element: HTMLElement; dispose: () => void } | undefined;

function initializeArticleTOC() {
  const element = document.querySelector<HTMLElement>('[data-article-toc]');
  if (element && currentTOC?.element === element) return;
  currentTOC?.dispose();
  currentTOC = undefined;
  if (!element) return;

  const sections: { heading: HTMLElement; link: HTMLAnchorElement }[] = [];
  for (const link of element.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
    const heading = document.getElementById(link.getAttribute('href')!.slice(1));
    if (heading) sections.push({ heading, link });
  }
  if (!sections.length) return;

  const lifetime = new AbortController();
  const options = { signal: lifetime.signal };
  const mobile = document.querySelector<HTMLDetailsElement>('[data-mobile-toc]');
  let active: HTMLAnchorElement | undefined;
  let frame: number | undefined;

  function isCollapsed() {
    return mobile && element?.parentElement === mobile && !mobile.open;
  }

  function highlight() {
    frame = undefined;
    if (isCollapsed()) return;
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
    if (frame === undefined && !isCollapsed()) frame = requestAnimationFrame(highlight);
  }

  function cancel() {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  }

  const article = sections[0].heading.closest('article');
  const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : undefined;
  if (article) resize?.observe(article);
  mobile?.addEventListener('toggle', schedule, options);
  window.addEventListener('scroll', schedule, { ...options, passive: true });
  window.addEventListener('resize', schedule, options);
  window.addEventListener('pageshow', schedule, options);
  window.addEventListener('pagehide', cancel, options);
  highlight();

  currentTOC = {
    element,
    dispose() {
      lifetime.abort();
      resize?.disconnect();
      cancel();
      active?.classList.remove('active');
      active?.removeAttribute('aria-current');
    },
  };
}

initializeArticleTOC();
document.addEventListener('astro:page-load', initializeArticleTOC);
document.addEventListener('astro:before-swap', () => {
  currentTOC?.dispose();
  currentTOC = undefined;
});
