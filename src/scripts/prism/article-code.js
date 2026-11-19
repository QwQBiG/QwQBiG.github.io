import { prepareCodeBlock, prepareCodeLines } from './prism-code-blocks.js';
import { decorateBrackets } from './prism-rainbow-brackets.js';
import { enhanceSyntaxHighlighting } from './prism-enhance.js';
import { fixXMLHighlighting } from './prism-xml-fix.js';

let page;

function initialize() {
  if (page?.body === document.body) return;
  page?.dispose();
  if (document.body.dataset.pageCode !== 'true') return;

  const body = document.body;
  const pending = new Map();
  const registered = new WeakMap();
  const lifetime = new AbortController();
  const listeners = { capture: true, signal: lifetime.signal };
  const viewport = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(entries => {
        const nearby = entries.filter(entry => entry.isIntersecting).map(entry => entry.target);
        if (nearby.length) decorateAll(nearby);
      }, { rootMargin: '600px 0px' })
    : null;

  function decorate(pre) {
    const code = pending.get(pre);
    if (!code) return;
    pending.delete(pre);
    viewport?.unobserve(pre);
    if (!body.contains(pre)) {
      registered.delete(pre);
      return;
    }
    if (pre.dataset.processed === 'true') prepareCodeLines(code);
    fixXMLHighlighting(code);
    enhanceSyntaxHighlighting(code);
    if (pre.dataset.processed === 'true') {
      decorateBrackets(code);
      pre.dataset.rainbowProcessed = 'true';
    }
    pre.dispatchEvent(new Event('article-code-ready'));
  }

  function register(pre) {
    if (pre.className.includes('mermaid')) return;
    const code = pre.querySelector('code');
    if (!code || registered.get(pre) === code) return;
    registered.set(pre, code);
    // The unwrapped source uses the same line height and gutter as decorated rows.
    if (pre.matches('[class*="language-"]')) prepareCodeBlock(pre);
    pending.set(pre, code);
    if (viewport) viewport.observe(pre);
    else decorate(pre);
  }

  function decorateTarget(event) {
    const pre = event.target instanceof Element && event.target.closest('pre');
    if (pending.has(pre)) decorateAll([pre]);
  }

  function finishDecorating() {
    if (pending.size) decorateAll(pending.keys());
  }

  body.addEventListener('pointerdown', decorateTarget, listeners);
  body.addEventListener('focusin', decorateTarget, listeners);
  window.addEventListener('beforeprint', finishDecorating, { signal: lifetime.signal });

  function discover(records) {
    let removed = false;
    for (const record of records) {
      const owner = record.target.closest?.('pre');
      if (owner) {
        if (!registered.get(owner)?.isConnected) register(owner);
        continue;
      }
      if (record.removedNodes.length) removed = true;
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches('pre')) register(node);
        else if (node.childElementCount) node.querySelectorAll('pre').forEach(register);
      }
    }
    // Dropped widgets and replaced article fragments must not stay in the queue.
    if (!removed) return;
    for (const pre of pending.keys()) {
      if (!pre.isConnected) {
        viewport?.unobserve(pre);
        pending.delete(pre);
        registered.delete(pre);
      }
    }
  }

  // Ignore the thousands of node insertions we perform ourselves. Drain
  // external mutations first so dynamically inserted examples still work.
  const additions = new MutationObserver(records => {
    additions.disconnect();
    try { discover(records); } finally { watch(); }
  });
  function watch() {
    if (!lifetime.signal.aborted) additions.observe(body, { childList: true, subtree: true });
  }
  function decorateAll(blocks) {
    if (lifetime.signal.aborted) return;
    const queued = additions.takeRecords();
    additions.disconnect();
    try {
      discover(queued);
      for (const pre of blocks) decorate(pre);
    } finally { watch(); }
  }
  for (const pre of body.querySelectorAll('pre')) register(pre);
  watch();

  page = {
    body, decorateAll, pending, register,
    dispose() {
      additions.disconnect();
      viewport?.disconnect();
      pending.clear();
      lifetime.abort();
      page = undefined;
    },
  };
}

// Mark search results after the normal viewport/print decoration has finished
// replacing syntax nodes. A new query cancels listeners for the previous one.
export function whenCodeReady(pre, render, signal) {
  page?.register(pre);
  if (page?.pending.has(pre)) pre.addEventListener('article-code-ready', render, { once: true, signal });
  else render();
}

export function prepareCodeSearch(blocks) {
  page?.decorateAll(blocks);
}

initialize();
document.addEventListener('astro:page-load', initialize);
document.addEventListener('astro:before-swap', () => page?.dispose());

// If embedded content highlights XML again, restore the colors of the new tokens.
window.Prism?.hooks?.add('complete', ({ element }) => {
  if (!page || !page.body.contains(element)) return;
  fixXMLHighlighting(element);
  enhanceSyntaxHighlighting(element);
});
