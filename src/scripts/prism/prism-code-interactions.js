import { prepareCodeSearch, whenCodeReady } from './article-code.js';
import searchModuleURL from './code-search-matches.js?url&no-inline';

/**
 * 代码块交互功能
 * 实现代码搜索、选区高亮与快捷键
 */

(function() {
  'use strict';

  // ==================== 搜索功能 ====================

  let searchOverlay = null;
  let results;
  let loading = false;
  let attempts = 0;
  let pendingSteps = 0;
  let returnFocus = null;

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
            <span class="code-search-label">Find in code</span>
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
      pendingSteps = 0;
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

  function updateCount(text) {
    const counter = searchOverlay?.querySelector('.code-search-count');
    if (counter) counter.textContent = text;
  }

  function loadResults() {
    if (results || loading) return;
    loading = true;
    // A failed module fetch can be cached for the lifetime of a document.
    const url = new URL(searchModuleURL, document.baseURI);
    if (attempts++) url.searchParams.set('retry', String(attempts));
    void import(/* @vite-ignore */ url.href).then(({ createSearchResults }) => {
      results = createSearchResults(prepareCodeSearch, whenCodeReady, updateCount);
      if (searchOverlay?.style.display !== 'flex') return;
      performSearch(searchOverlay.querySelector('.code-search-input').value);
      while (pendingSteps !== 0) {
        const step = Math.sign(pendingSteps);
        results.move(step);
        pendingSteps -= step;
      }
    }, () => {
      if (searchOverlay?.style.display === 'flex') updateCount('Search unavailable');
    }).finally(() => { loading = false; });
  }

  function performSearch(query) {
    if (results) results.search(query, window.currentSearchCodeBlock);
    else loadResults();
  }

  function navigateSearch(step) {
    if (results) results.move(step);
    else {
      pendingSteps += step;
      loadResults();
    }
  }

  /**
   * 打开搜索
   */
  function openSearch(pre = null, opener = null) {
    createSearchUI();
    if (searchOverlay.style.display !== 'flex') returnFocus = opener ?? document.activeElement;
    window.currentSearchCodeBlock = pre;
    const label = pre ? 'Find in this block' : 'Find in code';
    searchOverlay.querySelector('.code-search-label').textContent = label;
    const input = searchOverlay.querySelector('.code-search-input');
    input.setAttribute('aria-label', label);
    searchOverlay.style.display = 'flex';
    // Keep focus synchronous so the first tap opens the mobile keyboard.
    input.focus();
    pendingSteps = 0;
    performSearch(input.value);
  }

  /**
   * 全局搜索函数（供代码块头部按钮调用）
   */
  window.openCodeSearch = openSearch;

  /**
   * 关闭搜索
   */
  function closeSearch(restoreFocus = true) {
    if (!searchOverlay || searchOverlay.style.display !== 'flex') return;
    searchOverlay.style.display = 'none';
    searchOverlay.querySelector('.code-search-input').value = '';
    pendingSteps = 0;
    results?.clear();
    updateCount('0/0');
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
    window.currentSearchCodeBlock = null;
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
    closeSearch(false);
    searchOverlay?.remove();
    searchOverlay = null;
  });

})();
