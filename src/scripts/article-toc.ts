let cleanupTOC: (() => void) | undefined;

function initializeArticleTOC() {
  cleanupTOC?.();
  const tocLinks = document.querySelectorAll<HTMLAnchorElement>('.toc a[href^="#"]');
  if (!tocLinks.length) { cleanupTOC = undefined; return; }
  const headings = document.querySelectorAll<HTMLElement>('h2[id], h3[id]');
  const linksById = new Map(Array.from(tocLinks, link => [link.getAttribute('href')!.slice(1), link] as const));
  const lifetime = new AbortController();
  let activeLink: HTMLAnchorElement | undefined;
  let tocFrame = 0;

  function highlightTOC() {
    tocFrame = 0;
    const scrollPos = window.scrollY + 100;
    let nextLink: HTMLAnchorElement | undefined;
    let matchedHeading = false;

    headings.forEach(heading => {
      const top = heading.offsetTop;
      const bottom = top + heading.offsetHeight;
      if (scrollPos >= top && scrollPos < bottom) {
        matchedHeading = true;
        nextLink = linksById.get(heading.id);
      }
    });
    if (matchedHeading && nextLink !== activeLink) {
      activeLink?.classList.remove('active');
      nextLink?.classList.add('active');
      activeLink = nextLink;
    }
  }

  window.addEventListener('scroll', () => {
    if (!tocFrame) tocFrame = requestAnimationFrame(highlightTOC);
  }, { passive: true, signal: lifetime.signal });
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(tocFrame);
    tocFrame = 0;
  }, { signal: lifetime.signal });
  tocLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const target = document.getElementById(link.getAttribute('href')!.slice(1));
      target?.scrollIntoView({ behavior: 'smooth' });
    }, { signal: lifetime.signal });
  });
  highlightTOC();
  cleanupTOC = () => {
    lifetime.abort();
    cancelAnimationFrame(tocFrame);
  };
}

initializeArticleTOC();
document.addEventListener('astro:page-load', initializeArticleTOC);
document.addEventListener('astro:before-swap', () => {
  cleanupTOC?.();
  cleanupTOC = undefined;
});
