const openerFor = { ')': '(', ']': '[', '}': '{' };
const decorated = new WeakSet();

export function decorateBrackets(code) {
  if (decorated.has(code)) return;
  decorated.add(code);

  const doc = code.ownerDocument;
  const pending = { '(': [], '[': [], '{': [] };
  const partners = new WeakMap();
  let depth = 0;

  function makeBracket(char, token) {
    const span = token ?? doc.createElement('span');
    if (token) {
      span.classList.add('rainbow-bracket');
    } else {
      span.className = 'rainbow-bracket';
      span.textContent = char;
    }
    span.dataset.bracket = char;

    if (pending[char]) {
      const level = depth % 6 + 1;
      span.classList.add('rainbow-bracket-level-' + level);
      pending[char].push({ span, level });
      depth++;
    } else {
      // Match within each bracket type, even for incomplete or mixed snippets.
      const opening = pending[openerFor[char]].pop();
      if (opening) {
        span.classList.add('rainbow-bracket-level-' + opening.level);
        partners.set(opening.span, span);
        partners.set(span, opening.span);
        depth--;
      } else {
        span.classList.add('rainbow-bracket-unmatched');
      }
    }
    return span;
  }

  const walker = doc.createTreeWalker(code, NodeFilter.SHOW_TEXT);
  const brackets = /[()[\]{}]/g;
  let node = walker.nextNode();
  while (node) {
    const original = node;
    // Advance before replacing a node; the walker must stay in the original tree.
    node = walker.nextNode();
    const text = original.data;
    brackets.lastIndex = 0;
    let match = brackets.exec(text);
    if (!match || original.parentElement.closest('.line-number, .rainbow-bracket')) continue;
    if (text.length === 1) {
      const token = original.parentElement;
      // A standalone Prism punctuation span can hold the interaction itself.
      // Keep a separate bracket inside nested syntax, links and custom markup.
      if (token.localName === 'span' && token.className === 'token punctuation' &&
          token.attributes.length === 1 && token.childNodes.length === 1 &&
          token.parentElement?.className === 'line-content') {
        makeBracket(text, token);
      } else {
        original.replaceWith(makeBracket(text));
      }
      continue;
    }
    const fragment = doc.createDocumentFragment();
    let start = 0;
    do {
      if (match.index > start) fragment.append(text.slice(start, match.index));
      fragment.append(makeBracket(match[0]));
      start = match.index + 1;
    } while ((match = brackets.exec(text)));
    if (start < text.length) fragment.append(text.slice(start));
    original.replaceWith(fragment);
  }

  for (const openings of Object.values(pending)) {
    for (const { span } of openings) span.classList.add('rainbow-bracket-unmatched');
  }

  let selected;
  code.addEventListener('click', event => {
    const bracket = event.target.closest?.('.rainbow-bracket');
    if (!bracket) return;
    event.stopPropagation();
    if (selected) {
      selected.classList.remove('bracket-match-highlight', 'bracket-unmatched');
      partners.get(selected)?.classList.remove('bracket-match-highlight');
    }
    selected = bracket;
    selected.classList.add('bracket-match-highlight');
    const partner = partners.get(selected);
    if (partner) partner.classList.add('bracket-match-highlight');
    else selected.classList.add('bracket-unmatched');
  });
}
