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

export function createSearchResults(prepareCodeSearch, whenCodeReady, updateCount) {
  let currentMatches = [];
  let searchLifetime;
  let currentMatchIndex = -1;

  /**
   * 执行搜索
   */
  function search(query, scope) {
    // 清除之前的搜索结果
    clearSearch();

    if (!query || query.length < 2) {
      updateSearchCount();
      return;
    }

    const pattern = new RegExp(escapeRegex(query), 'gi');
    searchLifetime = new AbortController();
    const codes = scope
      ? scope.querySelectorAll('code')
      : document.querySelectorAll('pre[class*="language-"] code');
    for (const code of codes) {
      const matches = Array.from(code.textContent.matchAll(pattern));
      if (!matches.length) continue;

      // Count all occurrences now. Their spans are only needed when the reader
      // sees this block or uses the controls to jump directly to one of its hits.
      const block = { pre: code.closest('pre'), first: currentMatches.length, marks: [] };
      for (let i = 0; i < matches.length; i++) currentMatches.push(block);
      whenCodeReady(block.pre, () => {
        block.marks = markCodeMatches(code, matches, block.first);
      }, searchLifetime.signal);
    }

    if (currentMatches.length) {
      currentMatchIndex = 0;
      highlightCurrentMatch();
    } else {
      updateSearchCount();
    }
  }

  /**
   * 转义正则特殊字符
   */
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 清除搜索结果
   */
  function clearSearch() {
    searchLifetime?.abort();
    searchLifetime = undefined;
    const parents = new Set();
    for (let i = 0; i < currentMatches.length; i++) {
      const pieces = matchPieces(i);
      for (const mark of pieces) {
        if (mark.parentNode) parents.add(mark.parentNode);
        mark.replaceWith(mark.textContent);
      }
    }
    for (const parent of parents) parent.normalize();
    currentMatches = [];
    currentMatchIndex = -1;
  }

  /**
   * 更新搜索计数
   */
  function updateSearchCount() {
    if (currentMatches.length === 0) {
      updateCount('0/0');
    } else {
      updateCount(`${currentMatchIndex + 1}/${currentMatches.length}`);
    }
  }

  /**
   * 导航到指定匹配
   */
  function navigateSearch(direction) {
    if (currentMatches.length === 0) return;

    // 移除当前高亮
    if (currentMatchIndex >= 0) {
      for (const mark of matchPieces(currentMatchIndex)) mark.classList.remove('current');
    }

    // 计算新索引
    currentMatchIndex += direction;
    if (currentMatchIndex < 0) {
      currentMatchIndex = currentMatches.length - 1;
    } else if (currentMatchIndex >= currentMatches.length) {
      currentMatchIndex = 0;
    }

    highlightCurrentMatch();
  }

  function matchPieces(index) {
    const block = currentMatches[index];
    return block.marks[index - block.first] ?? [];
  }

  /**
   * 高亮当前匹配
   */
  function highlightCurrentMatch() {
    if (currentMatchIndex < 0 || currentMatchIndex >= currentMatches.length) return;

    const block = currentMatches[currentMatchIndex];
    if (!block.marks.length) prepareCodeSearch([block.pre]);
    const pieces = matchPieces(currentMatchIndex);
    for (const mark of pieces) mark.classList.add('current');
    pieces[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateSearchCount();
  }

  return { search, move: navigateSearch, clear: clearSearch };
}
