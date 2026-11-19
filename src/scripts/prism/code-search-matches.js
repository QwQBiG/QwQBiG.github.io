// Map each source match to its existing syntax tokens without moving those tokens.
// Both the matches and the text walker advance in document order.
export function markCodeMatches(code, matches, firstIndex) {
  const doc = code.ownerDocument;
  const walker = doc.createTreeWalker(code, NodeFilter.SHOW_TEXT);
  const groups = matches.map(() => []);
  let index = 0;
  let offset = 0;
  let node = walker.nextNode();

  while (node && index < matches.length) {
    const original = node;
    node = walker.nextNode();
    const text = original.data;
    if (!text.length) continue;
    const end = offset + text.length;
    let fragment;
    let consumed = 0;

    while (index < matches.length && matches[index].index < end) {
      const match = matches[index];
      const matchEnd = match.index + match[0].length;
      const start = Math.max(0, match.index - offset);
      const stop = Math.min(text.length, matchEnd - offset);
      fragment ??= doc.createDocumentFragment();
      if (start > consumed) fragment.append(text.slice(consumed, start));
      const mark = doc.createElement('span');
      mark.className = 'token search-match';
      mark.dataset.matchIndex = String(firstIndex + index);
      mark.textContent = text.slice(start, stop);
      fragment.append(mark);
      groups[index].push(mark);
      consumed = stop;
      if (matchEnd > end) break;
      index++;
    }

    if (fragment) {
      if (consumed < text.length) fragment.append(text.slice(consumed));
      original.replaceWith(fragment);
    }
    offset = end;
  }
  return groups;
}
