import { prepareCodeSearch, whenCodeReady } from './article-code.js';
import { markCodeMatches } from './code-search-matches.js';

/**
 * 代码块交互功能
 * 实现代码搜索、选区高亮与快捷键
 */

(function() {
  'use strict';

  // ==================== 搜索功能 ====================

  let searchOverlay = null;
  let currentMatches = [];
  let searchLifetime;
  let currentMatchIndex = -1;

  /**
   * 创建搜索界面
   */
  function createSearchUI() {
    if (searchOverlay) return;

    searchOverlay = document.createElement('div');
    searchOverlay.className = 'code-search-overlay';
    searchOverlay.innerHTML = `
      <div class="code-search-card">
        <div class="code-search-header">
          <span class="code-search-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5"></circle>
              <path d="m16 16 4.5 4.5"></path>
            </svg>
            Find in code
          </span>
          <button class="code-search-close" type="button" aria-label="Close code search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
              <path d="m6 6 12 12M6 18 18 6"></path>
            </svg>
          </button>
        </div>
        <div class="code-search-body">
          <div class="code-search-input-wrapper">
            <input type="text" class="code-search-input" aria-label="Find in code" placeholder="Enter at least 2 characters" />
          </div>
          <div class="code-search-controls">
            <span class="code-search-count">0/0</span>
            <div class="code-search-buttons">
              <button class="code-search-prev" type="button" aria-label="Previous match">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
              <button class="code-search-next" type="button" aria-label="Next match">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(searchOverlay);

    // 绑定事件
    const input = searchOverlay.querySelector('.code-search-input');
    const prevBtn = searchOverlay.querySelector('.code-search-prev');
    const nextBtn = searchOverlay.querySelector('.code-search-next');
    const closeBtn = searchOverlay.querySelector('.code-search-close');

    input.addEventListener('input', (e) => {
      performSearch(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        navigateSearch(1);
      } else if (e.key === 'Escape') {
        closeSearch();
      }
    });

    prevBtn.addEventListener('click', () => navigateSearch(-1));
    nextBtn.addEventListener('click', () => navigateSearch(1));
    closeBtn.addEventListener('click', closeSearch);

    // 点击遮罩关闭
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) {
        closeSearch();
      }
    });
  }

  /**
   * 执行搜索
   */
  function performSearch(query) {
    // 清除之前的搜索结果
    clearSearch();

    if (!query || query.length < 2) {
      updateSearchCount();
      return;
    }

    const pattern = new RegExp(escapeRegex(query), 'gi');
    searchLifetime = new AbortController();
    for (const code of document.querySelectorAll('pre[class*="language-"] code')) {
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
    const countEl = searchOverlay.querySelector('.code-search-count');
    if (currentMatches.length === 0) {
      countEl.textContent = '0/0';
    } else {
      countEl.textContent = `${currentMatchIndex + 1}/${currentMatches.length}`;
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

  /**
   * 打开搜索
   */
  function openSearch() {
    createSearchUI();
    searchOverlay.style.display = 'flex';
    searchOverlay.querySelector('.code-search-input').focus();
  }

  /**
   * 全局搜索函数（供代码块头部按钮调用）
   */
  window.openCodeSearch = function(pre) {
    openSearch();
    // 存储当前代码块引用
    window.currentSearchCodeBlock = pre;
  };

  /**
   * 关闭搜索
   */
  function closeSearch() {
    if (searchOverlay) {
      searchOverlay.style.display = 'none';
      searchOverlay.querySelector('.code-search-input').value = '';
      clearSearch();
      updateSearchCount();
    }
  }

  // ==================== 文本选择高亮 ====================

  /**
   * 初始化文本选择高亮
   */
  function initSelectionHighlight() {
    document.addEventListener('mouseup', () => {
      if (document.body.dataset.pageCode !== 'true') return;
      const selection = window.getSelection();
      if (selection.toString().length > 0) {
        // 选中文本时添加自定义样式
        document.body.classList.add('has-selection');
      } else {
        document.body.classList.remove('has-selection');
      }
    });
  }

  // ==================== 快捷键 ====================

  /**
   * 初始化快捷键
   */
  function initShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (document.body.dataset.pageCode !== 'true') return;
      // Ctrl/Cmd + Shift + F 打开搜索（避免与浏览器默认搜索冲突）
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        openSearch();
      }

      // Esc 关闭搜索
      if (e.key === 'Escape') {
        closeSearch();
      }
    });
  }

  // ==================== 初始化 ====================

  initSelectionHighlight();
  initShortcuts();
  document.addEventListener('astro:before-swap', () => {
    closeSearch();
    searchOverlay?.remove();
    searchOverlay = null;
    window.currentSearchCodeBlock = null;
  });

})();
