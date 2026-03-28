/**
 * 代码块交互功能
 * 实现行高亮、当前行指示、搜索匹配等功能
 */

(function() {
  'use strict';

  // ==================== 行高亮功能 ====================

  /**
   * 为代码块添加行交互
   */
  function initLineInteractions() {
    const codeBlocks = document.querySelectorAll('pre[class*="language-"]');

    codeBlocks.forEach(pre => {
      // 检查是否已初始化
      if (pre.dataset.lineInteractions) return;
      pre.dataset.lineInteractions = 'true';

      const code = pre.querySelector('code');
      if (!code) return;

      // 获取所有行
      const lines = code.querySelectorAll('.line');
      if (lines.length === 0) return;

      lines.forEach((line) => {
        // 鼠标悬停高亮
        line.addEventListener('mouseenter', () => {
          line.classList.add('line-current');
        });

        line.addEventListener('mouseleave', () => {
          line.classList.remove('line-current');
        });

        // 点击高亮（持久）
        line.addEventListener('click', () => {
          // 移除其他行的高亮
          lines.forEach(l => l.classList.remove('line-highlight'));
          // 添加当前行高亮
          line.classList.add('line-highlight');
        });
      });
    });
  }

  // ==================== 搜索功能 ====================

  let searchOverlay = null;
  let currentMatches = [];
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
          <span class="code-search-title">🔍 Search Code</span>
          <button class="code-search-close">✕</button>
        </div>
        <div class="code-search-body">
          <div class="code-search-input-wrapper">
            <input type="text" class="code-search-input" placeholder="Type to search..." />
          </div>
          <div class="code-search-controls">
            <span class="code-search-count">0/0</span>
            <div class="code-search-buttons">
              <button class="code-search-prev">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
              <button class="code-search-next">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

    const codeBlocks = document.querySelectorAll('pre[class*="language-"] code');
    currentMatches = [];

    codeBlocks.forEach(code => {
      const textNodes = getTextNodes(code);

      textNodes.forEach(node => {
        const text = node.textContent;
        const regex = new RegExp(escapeRegex(query), 'gi');
        let match;

        while ((match = regex.exec(text)) !== null) {
          const range = document.createRange();
          range.setStart(node, match.index);
          range.setEnd(node, match.index + match[0].length);

          const highlight = document.createElement('span');
          highlight.className = 'token search-match';
          highlight.dataset.matchIndex = currentMatches.length;

          try {
            range.surroundContents(highlight);
            currentMatches.push(highlight);
          } catch (e) {
            // 跨节点匹配时跳过
          }
        }
      });
    });

    updateSearchCount();

    if (currentMatches.length > 0) {
      currentMatchIndex = 0;
      highlightCurrentMatch();
    }
  }

  /**
   * 获取所有文本节点
   */
  function getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.parentElement.classList.contains('search-match')) continue;
      textNodes.push(node);
    }

    return textNodes;
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
    const matches = document.querySelectorAll('.search-match');
    matches.forEach(match => {
      const parent = match.parentNode;
      parent.replaceChild(document.createTextNode(match.textContent), match);
      parent.normalize();
    });
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
      currentMatches[currentMatchIndex].classList.remove('current');
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

  /**
   * 高亮当前匹配
   */
  function highlightCurrentMatch() {
    if (currentMatchIndex < 0 || currentMatchIndex >= currentMatches.length) return;

    const match = currentMatches[currentMatchIndex];
    match.classList.add('current');
    match.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    }
    clearSearch();
  }

  // ==================== 文本选择高亮 ====================

  /**
   * 初始化文本选择高亮
   */
  function initSelectionHighlight() {
    document.addEventListener('mouseup', () => {
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

  function init() {
    initLineInteractions();
    initSelectionHighlight();
    initShortcuts();

    // 监听新代码块
    const observer = new MutationObserver(() => {
      initLineInteractions();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

})();
