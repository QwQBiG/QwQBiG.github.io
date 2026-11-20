export function createPageControls(document: Document, label: string, turn: (step: number) => void) {
  const nav = document.createElement('nav');
  nav.className = 'comment-page-controls';
  nav.setAttribute('aria-label', label);

  function button(text: string, step: number) {
    const control = document.createElement('button');
    control.type = 'button';
    control.textContent = text;
    control.addEventListener('click', () => turn(step));
    return control;
  }

  const previous = button('Previous', -1);
  const next = button('Next', 1);
  const status = document.createElement('span');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  nav.append(previous, status, next);

  function update(page: number, total: number) {
    nav.hidden = total <= 1;
    previous.disabled = page <= 1;
    next.disabled = page >= total;
    const text = `Page ${page} of ${total}`;
    if (status.textContent !== text) status.textContent = text;
  }

  return { nav, update };
}
