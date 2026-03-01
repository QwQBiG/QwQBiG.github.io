/**
 * 网站功能集成 - 返回顶部 + 代码块折叠
 */

// ========== 返回顶部功能 ==========
(function() {
  // 移除主题自带的返回顶部按钮
  const existingTopLinks = document.querySelectorAll('.top-link, #top-link');
  existingTopLinks.forEach(el => el.remove());

  const backToTop = document.createElement('button');
  backToTop.className = 'custom-back-to-top';
  backToTop.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>';
  backToTop.setAttribute('aria-label', '返回顶部');
  document.body.appendChild(backToTop);

  function toggleVisibility() {
    if (window.scrollY > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  backToTop.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();
})();

// ========== 代码块折叠功能 ==========
(function() {
  // 向上箭头 SVG
  const arrowUpSVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 14l5-5 5 5H7z"/></svg>`;

  // 检查代码块是否需要折叠（大于等于6行）
  const shouldEnableFold = function(block) {
    // 获取代码行数 - 通过行号元素计算
    const lineNumbers = block.querySelectorAll('.ln, .line-number');
    if (lineNumbers.length >= 6) {
      return true;
    }

    // 检查 flex span 元素（用户提供的代码块格式）
    const flexSpans = block.querySelectorAll('span[style*="display:flex"]');
    if (flexSpans.length >= 6) {
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

    // 通过 pre 元素内容估算
    const preElement = block.querySelector('pre');
    if (preElement) {
      const text = preElement.textContent || '';
      const lineCount = text.split('\n').length;
      if (lineCount >= 6) {
        return true;
      }
    }

    // 默认检查 highlight 的高度
    const height = block.scrollHeight;
    if (height > 240) {
      return true;
    }

    return false;
  };

  const addFoldButtons = function() {
    // 只选择 .highlight，不选择 .chroma，避免重复添加
    const codeBlocks = document.querySelectorAll('.post-content .highlight');

    codeBlocks.forEach(block => {
      // 确保 block 是 .highlight，不是 .chroma
      if (!block.classList.contains('highlight')) return;

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

  // 初始执行 - 等待 DOMContentLoaded（冒泡阶段，确保在简化结构之后）
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

// ========== 代码块复制功能 ==========
(function() {
  // 隐藏主题自带的复制按钮
  const hideDefaultCopyButtons = function() {
    const defaultButtons = document.querySelectorAll('.highlight .copy-code, .chroma .copy-code, .highlight button[title="Copy"], .chroma button[title="Copy"]');
    defaultButtons.forEach(btn => {
      btn.style.display = 'none !important';
      btn.style.visibility = 'hidden !important';
      btn.style.opacity = '0 !important';
      btn.style.pointerEvents = 'none !important';
    });
  };

  const addCustomCopyButtons = function() {
    // 只选择 .highlight，不选择 .chroma，避免重复添加
    const codeBlocks = document.querySelectorAll('.post-content .highlight');

    codeBlocks.forEach(block => {
      // 确保 block 是 .highlight，不是 .chroma
      if (!block.classList.contains('highlight')) return;

      // 如果已经有自定义复制按钮，跳过
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

        // 检查是否是表格结构（行号 + 代码）
        const table = block.querySelector('table');
        if (table) {
          // 表格结构 - 获取代码列
          const codeCell = table.querySelector('td:last-child pre, td:last-child code');
          if (codeCell) {
            const clone = codeCell.cloneNode(true);
            const lineNumbers = clone.querySelectorAll('.ln, .line-number');
            lineNumbers.forEach(el => el.remove());
            codeText = clone.textContent;
          }
        } else {
          // 非表格结构
          const codeElement = block.querySelector('code');
          if (codeElement) {
            const clone = codeElement.cloneNode(true);
            const lineNumbers = clone.querySelectorAll('.ln, .line-number, [style*="user-select:none"]');
            lineNumbers.forEach(el => el.remove());
            codeText = clone.textContent;
          } else {
            codeText = block.textContent;
          }
        }

        // 清理多余的空行
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
      // 添加到 highlight 上，而不是 pre 上
      block.appendChild(button);
    });
  };

  // 初始执行 - 等待 DOMContentLoaded（冒泡阶段，确保在简化结构之后）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      hideDefaultCopyButtons();
      addCustomCopyButtons();
    }, false);
  } else {
    hideDefaultCopyButtons();
    addCustomCopyButtons();
  }

  // 监听动态添加的代码块
  const copyObserver = new MutationObserver(function() {
    hideDefaultCopyButtons();
    addCustomCopyButtons();
  });

  copyObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 页面加载完成后再次执行
  window.addEventListener('load', function() {
    hideDefaultCopyButtons();
    addCustomCopyButtons();
  });
})();

// ========== 代码块语言标签（可点击切换行号） ==========
(function() {
  const addLanguageLabels = function() {
    const codeBlocks = document.querySelectorAll('.highlight');

    codeBlocks.forEach(block => {
      // 确保 block 是 .highlight，不是 .chroma
      if (!block.classList.contains('highlight')) return;

      // 如果已经有语言标签按钮，跳过
      if (block.querySelector(':scope > .code-lang-btn')) return;

      // 尝试从 code 元素的 class 中获取语言
      const codeElement = block.querySelector('code[class*="language-"], code[data-lang]');
      let lang = 'code';

      if (codeElement) {
        // 从 class 中提取语言，如 "language-cpp" -> "cpp"
        const langMatch = codeElement.className.match(/language-(\w+)/);
        if (langMatch) {
          lang = langMatch[1];
        } else if (codeElement.getAttribute('data-lang')) {
          lang = codeElement.getAttribute('data-lang');
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
        const lineNumbers = block.querySelectorAll('.ln, .line-number, .line-numbers');

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

  // 初始执行 - 等待 DOMContentLoaded（冒泡阶段，确保在简化结构之后）
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

// ========== 简化代码块结构（移除 table 包装） ==========
(function() {
  const simplifyCodeBlocks = function() {
    const highlights = document.querySelectorAll('.highlight');

    highlights.forEach(highlight => {
      // 如果已经处理过，跳过
      if (highlight.hasAttribute('data-simplified')) return;

      // 找到内部的 .chroma
      const chroma = highlight.querySelector(':scope > .chroma');
      if (!chroma) return;

      // 找到 table
      const table = chroma.querySelector('table.lntable');
      if (!table) return;

      // 提取两个 pre 元素（行号列和代码列）
      const pres = table.querySelectorAll('pre');
      if (pres.length !== 2) return;

      const lineNumbersPre = pres[0];
      const codePre = pres[1];

      // 提取 code 元素
      const codeElement = codePre.querySelector('code');
      if (!codeElement) return;

      // 保留行号
      const lineNumbersCode = lineNumbersPre.querySelector('code');
      if (lineNumbersCode) {
        // 将行号插入到 code 元素前面
        const lineNumbersDiv = document.createElement('div');
        lineNumbersDiv.className = 'line-numbers';
        lineNumbersDiv.style.cssText = 'float: left; margin-right: 10px; margin-left: -10px; text-align: right; color: rgba(0,0,0,0.25); user-select: none;';
        lineNumbersDiv.innerHTML = lineNumbersCode.innerHTML;
        codeElement.insertBefore(lineNumbersDiv, codeElement.firstChild);
      }

      // 保存按钮（如果已经添加）- 从 highlight、chroma、codePre 和 codeElement 中查找
      // 注意：按钮可能被错误地添加到了 .chroma、codePre 或 codeElement 内部，需要一并处理
      const highlightButtons = Array.from(highlight.querySelectorAll('.custom-copy-code, .code-fold-toggle, .code-fold-hint, .code-lang-btn'));
      const chromaButtons = Array.from(chroma.querySelectorAll('.custom-copy-code, .code-fold-toggle, .code-fold-hint, .code-lang-btn'));
      const codePreButtons = Array.from(codePre.querySelectorAll('.custom-copy-code, .code-fold-toggle, .code-fold-hint, .code-lang-btn'));
      const codeElementButtons = Array.from(codeElement.querySelectorAll('.custom-copy-code, .code-fold-toggle, .code-fold-hint, .code-lang-btn'));
      const savedButtons = [...new Set([...highlightButtons, ...chromaButtons, ...codePreButtons, ...codeElementButtons])];

      // 从 codePre 和 codeElement 中移除按钮，避免它们被添加到代码内容中
      codePreButtons.forEach(btn => btn.remove());
      codeElementButtons.forEach(btn => btn.remove());

      // 清空 highlight 内容，只保留 pre
      highlight.innerHTML = '';

      // 重新添加 pre，并强制设置背景为透明
      codePre.className = 'chroma';
      codePre.style.backgroundColor = 'transparent';
      codePre.style.background = 'transparent';
      highlight.appendChild(codePre);

      // 重新添加保存的按钮到 highlight（而不是 pre）
      savedButtons.forEach(btn => {
        // 如果是折叠提示，确保其显示状态与代码块折叠状态一致
        if (btn.classList.contains('code-fold-hint')) {
          if (highlight.classList.contains('code-folded')) {
            btn.style.display = 'block';
          } else {
            btn.style.display = 'none';
          }
        }
        highlight.appendChild(btn);
      });

      // 标记为已处理
      highlight.setAttribute('data-simplified', 'true');
    });
  };

  // 初始执行 - 在 DOMContentLoaded 捕获阶段执行，确保最先执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      simplifyCodeBlocks();
    }, true); // 使用捕获阶段
  } else {
    simplifyCodeBlocks();
  }

  // 监听动态添加的代码块
  const simplifyObserver = new MutationObserver(function() {
    simplifyCodeBlocks();
  });

  simplifyObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 页面加载完成后再次执行
  window.addEventListener('load', function() {
    simplifyCodeBlocks();
  });
})();

// ========== 强制移除代码块黑色背景 ==========
(function() {
  // 1. 注入 CSS 移除黑色背景，但保留主题切换
  const styleId = 'force-remove-black-bg';
  let styleEl = document.getElementById(styleId);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = `
      /* 强制内部元素透明背景，不影响主题 */
      .post-content .chroma,
      .post-content pre.chroma,
      .post-content .highlight pre,
      .post-content .highlight pre.chroma,
      .post-content .highlight code,
      .post-content .chroma code,
      .post-content .highlight span,
      .post-content .chroma span,
      .post-content .highlight div,
      .post-content .chroma div {
        background-color: transparent !important;
        background: transparent !important;
      }
    `;
    document.head.appendChild(styleEl);
  }

  // 2. 移除内联黑色背景
  const forceRemoveBlackBg = function() {
    const allElements = document.querySelectorAll('.post-content .highlight *');
    allElements.forEach(el => {
      el.style.removeProperty('background');
      el.style.removeProperty('background-color');
      el.style.backgroundColor = 'transparent';
      el.style.background = 'transparent';
    });

    const containers = document.querySelectorAll('.post-content .chroma, .post-content pre.chroma');
    containers.forEach(el => {
      el.style.removeProperty('background');
      el.style.removeProperty('background-color');
      el.style.backgroundColor = 'transparent';
      el.style.background = 'transparent';
    });
  };

  forceRemoveBlackBg();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceRemoveBlackBg);
  }

  const bgObserver = new MutationObserver(forceRemoveBlackBg);
  bgObserver.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('load', forceRemoveBlackBg);

  setInterval(forceRemoveBlackBg, 100);
})();

// ========== 表格自适应处理 ==========
(function() {
  const processTables = function() {
    const tables = document.querySelectorAll('.post-content table');

    tables.forEach(table => {
      // 如果已经处理过，跳过
      if (table.hasAttribute('data-table-processed')) return;

      // 获取表格宽度
      const tableWidth = table.scrollWidth;
      const containerWidth = table.parentElement.clientWidth;

      // 如果表格比容器宽，添加横向滚动
      if (tableWidth > containerWidth) {
        // 创建包装器
        const wrapper = document.createElement('div');
        wrapper.className = 'table-scroll-wrapper';
        wrapper.style.cssText = `
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(232, 74, 122, 0.08);
          margin: 25px 0;
        `;

        // 设置表格样式
        table.style.cssText = `
          width: auto;
          min-width: 100%;
          margin: 0;
          box-shadow: none;
          border-radius: 0;
        `;

        // 包装表格
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);

        // 根据当前主题设置阴影颜色
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
                       (document.documentElement.getAttribute('data-theme') === 'auto' &&
                        window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) {
          wrapper.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
        }
      } else {
        // 表格宽度合适，居中显示
        table.style.margin = '25px auto';
        table.style.display = 'table';
      }

      // 标记为已处理
      table.setAttribute('data-table-processed', 'true');
    });
  };

  // 初始执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processTables);
  } else {
    processTables();
  }

  // 监听动态添加的表格
  const tableObserver = new MutationObserver(function() {
    processTables();
  });

  tableObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 窗口大小改变时重新处理
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      // 移除标记，重新处理
      document.querySelectorAll('.post-content table[data-table-processed]').forEach(table => {
        table.removeAttribute('data-table-processed');
      });
      processTables();
    }, 250);
  });

  // 主题切换时更新阴影颜色
  const updateTableShadows = function() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
                   (document.documentElement.getAttribute('data-theme') === 'auto' &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.querySelectorAll('.table-scroll-wrapper').forEach(wrapper => {
      if (isDark) {
        wrapper.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
      } else {
        wrapper.style.boxShadow = '0 4px 15px rgba(232, 74, 122, 0.08)';
      }
    });
  };

  // 监听主题变化
  const themeObserver = new MutationObserver(updateTableShadows);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTableShadows);
})();
