/**
 * 代码块功能集成 - 移植自 MyBlog 项目
 * 适配 Astro 框架的 pre.astro-code 结构
 */

// ========== 代码块复制功能 ==========
(function() {
  const addCopyButtons = function() {
    const codeBlocks = document.querySelectorAll('.prose pre.astro-code');

    codeBlocks.forEach(block => {
      // 如果已经有复制按钮，跳过
      if (block.querySelector(':scope > .custom-copy-code')) return;

      // 创建复制按钮
      const button = document.createElement('button');
      button.className = 'custom-copy-code';
      button.textContent = 'copy';
      button.setAttribute('aria-label', '复制代码');
      button.title = '复制代码';

      // 点击事件
      button.addEventListener('click', function(e) {
        e.stopPropagation();

        let codeText = '';

        // 获取代码内容
        const codeElement = block.querySelector('code');
        if (codeElement) {
          // 克隆并移除行号元素
          const clone = codeElement.cloneNode(true);
          const lineNumbers = clone.querySelectorAll('.line-number, [class*="line-number"]');
          lineNumbers.forEach(el => el.remove());
          codeText = clone.textContent;
        } else {
          codeText = block.textContent;
        }

        // 清理多余的空行和首尾空白
        codeText = codeText.replace(/\n\s*\n/g, '\n').trim();

        navigator.clipboard.writeText(codeText).then(function() {
          button.textContent = 'okkk';
          button.classList.add('copied');
          setTimeout(function() {
            button.textContent = 'copy';
            button.classList.remove('copied');
          }, 2000);
        }).catch(function() {
          button.textContent = 'failed';
          setTimeout(function() {
            button.textContent = 'copy';
          }, 2000);
        });
      });

      // 确保 block 有相对定位
      if (getComputedStyle(block).position === 'static') {
        block.style.position = 'relative';
      }
      
      block.appendChild(button);
    });
  };

  // 初始执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCopyButtons, false);
  } else {
    addCopyButtons();
  }

  // 监听动态添加的代码块
  const copyObserver = new MutationObserver(function() {
    addCopyButtons();
  });

  copyObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 页面加载完成后再次执行
  window.addEventListener('load', function() {
    addCopyButtons();
  });
})();

// ========== 代码块折叠功能 ==========
(function() {
  // 向上箭头 SVG
  const arrowUpSVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 14l5-5 5 5H7z"/></svg>`;

  // 检查代码块是否需要折叠（大于等于6行）
  const shouldEnableFold = function(block) {
    // 通过行元素计算行数
    const lines = block.querySelectorAll('.line');
    if (lines.length >= 6) {
      return true;
    }

    // 通过换行符估算行数
    const codeElement = block.querySelector('code');
    if (codeElement) {
      const text = codeElement.textContent || '';
      const lineCount = text.split('\n').length;
      if (lineCount >= 6) {
        return true;
      }
    }

    // 默认检查代码块的高度
    const height = block.scrollHeight;
    if (height > 240) {
      return true;
    }

    return false;
  };

  const addFoldButtons = function() {
    const codeBlocks = document.querySelectorAll('.prose pre.astro-code');

    codeBlocks.forEach(block => {
      // 如果已经有折叠按钮，跳过
      if (block.querySelector(':scope > .code-fold-toggle')) return;

      // 检查是否需要折叠
      if (!shouldEnableFold(block)) return;

      // 创建折叠按钮
      const foldButton = document.createElement('button');
      foldButton.className = 'code-fold-toggle';
      foldButton.innerHTML = arrowUpSVG;
      foldButton.setAttribute('aria-label', 'fold code');
      foldButton.title = '点击折叠/展开代码';

      // 创建折叠提示文字
      const hint = document.createElement('div');
      hint.className = 'code-fold-hint';
      hint.textContent = '当前内容已折叠呐~';
      hint.style.display = 'none';

      // 折叠状态
      let isFolded = false;

      // 点击事件
      foldButton.addEventListener('click', function(e) {
        e.stopPropagation();
        isFolded = !isFolded;

        if (isFolded) {
          block.classList.add('code-folded');
          foldButton.classList.add('folded');
          hint.style.display = 'block';
          foldButton.setAttribute('aria-label', 'unfold code');
        } else {
          block.classList.remove('code-folded');
          foldButton.classList.remove('folded');
          hint.style.display = 'none';
          foldButton.setAttribute('aria-label', 'fold code');
        }
      });

      // 确保 block 有相对定位
      if (getComputedStyle(block).position === 'static') {
        block.style.position = 'relative';
      }

      block.appendChild(foldButton);
      block.appendChild(hint);
    });
  };

  // 初始执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addFoldButtons, false);
  } else {
    addFoldButtons();
  }

  // 监听动态添加的代码块
  const foldObserver = new MutationObserver(function() {
    addFoldButtons();
  });

  foldObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 页面加载完成后再次执行
  window.addEventListener('load', function() {
    addFoldButtons();
  });
})();

// ========== 代码块语言标签（可点击切换行号） ==========
(function() {
  const addLanguageLabels = function() {
    const codeBlocks = document.querySelectorAll('.prose pre.astro-code');

    codeBlocks.forEach(block => {
      // 如果已经有语言标签按钮，跳过
      if (block.querySelector(':scope > .code-lang-btn')) return;

      // 尝试从 pre 元素的 data-language 属性获取语言
      let lang = block.getAttribute('data-language') || 'code';
      
      // 如果没有，尝试从 code 元素获取
      if (lang === 'code') {
        const codeElement = block.querySelector('code');
        if (codeElement) {
          const langAttr = codeElement.getAttribute('data-language') || 
                          codeElement.className.match(/language-(\w+)/)?.[1];
          if (langAttr) {
            lang = langAttr;
          }
        }
      }

      // 创建语言标签按钮
      const langBtn = document.createElement('button');
      langBtn.className = 'code-lang-btn';
      langBtn.textContent = lang.toUpperCase();
      langBtn.setAttribute('aria-label', 'Toggle line numbers');
      langBtn.title = '点击切换行号显示/隐藏';

      // 行号显示状态
      let showLineNumbers = true;

      // 点击事件 - 切换行号显示
      langBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showLineNumbers = !showLineNumbers;

        // 查找行号元素
        const lineNumbers = block.querySelectorAll('.line-number, [class*="line-number"]');

        lineNumbers.forEach(ln => {
          if (showLineNumbers) {
            ln.style.display = '';
          } else {
            ln.style.display = 'none';
          }
        });

        // 更新按钮样式
        if (!showLineNumbers) {
          langBtn.classList.add('line-numbers-hidden');
        } else {
          langBtn.classList.remove('line-numbers-hidden');
        }
      });

      // 确保 block 有相对定位
      if (getComputedStyle(block).position === 'static') {
        block.style.position = 'relative';
      }

      block.appendChild(langBtn);
    });
  };

  // 初始执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addLanguageLabels, false);
  } else {
    addLanguageLabels();
  }

  // 监听动态添加的代码块
  const labelObserver = new MutationObserver(function() {
    addLanguageLabels();
  });

  labelObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 页面加载完成后再次执行
  window.addEventListener('load', function() {
    addLanguageLabels();
  });
})();
