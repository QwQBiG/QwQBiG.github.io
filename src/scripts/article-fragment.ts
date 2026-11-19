type Participant = { busy: () => boolean; resume: () => void };
const articles = new WeakMap<HTMLElement, ReturnType<typeof trackHeadings>>();

// Diagrams and code share the same native jump, including its final alignment.
export function watchArticleFragment(article: HTMLElement | null, signal: AbortSignal, busy: () => boolean, resume: () => void) {
  if (!article) return;
  const page = articles.get(article) ?? trackHeadings(article);
  articles.set(article, page);
  const participant = { busy, resume };
  page.participants.add(participant);
  signal.addEventListener('abort', () => {
    page.participants.delete(participant);
    if (!page.participants.size) {
      page.dispose();
      articles.delete(article);
    }
  }, { once: true });
  return page;
}

function trackHeadings(article: HTMLElement) {
  const participants = new Set<Participant>();
  let jump: AbortController | undefined;
  let travelling = false;
  let timer: number | undefined;

  function clear(stopMotion = false) {
    if (travelling && stopMotion) {
      // Some browsers continue their native smooth scroll after a new gesture or link.
      window.scrollTo({ left: window.scrollX, top: window.scrollY, behavior: 'instant' });
    }
    window.clearTimeout(timer);
    jump?.abort();
    jump = undefined;
    travelling = false;
  }
  function resume() {
    for (const participant of participants) participant.resume();
  }
  function cancel() {
    const interrupted = travelling;
    clear(true);
    if (interrupted) resume();
  }
  function follow(hash: string) {
    let id: string;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target || !article.contains(target) || !target.matches('h1, h2, h3, h4, h5, h6')) return;
    clear(true);
    const heading = target;
    jump = new AbortController();
    const { signal } = jump;
    const options = { signal, passive: true };
    travelling = true;

    function align() {
      if (travelling || signal.aborted) return;
      const margin = parseFloat(getComputedStyle(heading).scrollMarginTop) || 0;
      if (Math.abs(heading.getBoundingClientRect().top - margin) > 2) {
        heading.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }
    function releaseWhenIdle() {
      for (const participant of participants) {
        if (participant.busy()) {
          timer = window.setTimeout(releaseWhenIdle, 250);
          return;
        }
      }
      clear();
    }
    function finish() {
      travelling = false;
      align();
      resume();
      // A nearby diagram can still change height after decoration resumes.
      timer = window.setTimeout(releaseWhenIdle, 250);
    }
    function waitForScroll() {
      if (!travelling) return;
      window.clearTimeout(timer);
      // Also covers engines without scrollend and links to the current position.
      timer = window.setTimeout(finish, 'onscrollend' in document ? 350 : 160);
    }
    document.addEventListener('scrollend', event => {
      if (event.target !== document || !travelling) return;
      // An earlier jump may have just been interrupted by a second link.
      // Give its replacement a frame to restart before making a correction.
      window.clearTimeout(timer);
      timer = window.setTimeout(finish, 32);
    }, options);
    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(align);
      observer.observe(article);
      signal.addEventListener('abort', () => observer.disconnect(), { once: true });
    }
    window.addEventListener('scroll', waitForScroll, options);
    for (const name of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.addEventListener(name, cancel, options);
    waitForScroll();
  }
  function onClick(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (link?.hash && !link.target && !link.hasAttribute('download')) follow(link.hash);
  }
  document.addEventListener('click', onClick);
  if (location.hash && !history.state?.scrollY) follow(location.hash);
  return {
    participants,
    travelling: () => travelling,
    dispose() {
      document.removeEventListener('click', onClick);
      clear();
    },
  };
}
