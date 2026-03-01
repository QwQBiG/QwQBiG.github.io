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

    // 备用方案：通过代码内容计算
    const codeElement = block.querySelector('code');
    if (codeElement) {
      // 尝试通过子元素数量计算行数
      const codeLines = codeElement.children;
      if (codeLines.length >= 6) {
        return true;
      }

      // 通过文本内容计算
      const lines = codeElement.textContent.split('\n');
      // 过滤掉空行后计算
      const nonEmptyLines = lines.filter(line => line.trim() !== '');
      if (nonEmptyLines.length >= 6 || lines.length >= 6) {
        return true;
      }
    }

    // 检查 table 行数（带行号的代码块）
    const tableElement = block.querySelector('table');
    if (tableElement) {
      const rows = tableElement.querySelectorAll('tr');
      if (rows.length >= 6) {
        return true;
      }
    }

    return false;
  };

  // 添加折叠功能到代码块
  const addFoldFunctionality = function() {
    // 只选择 .highlight 元素
    const codeBlocks = document.querySelectorAll('.highlight');

    codeBlocks.forEach(block => {
      // 跳过已经添加过折叠按钮的代码块（直接子元素）
      if (block.querySelector(':scope > .code-fold-toggle')) return;

      // 跳过已经有其他折叠功能的代码块
      if (block.querySelector('.fold, .unfold, .toggle-fold')) return;

      // 检查是否需要折叠功能
      if (!shouldEnableFold(block)) return;

      // 确保代码块有相对定位
      if (getComputedStyle(block).position === 'static') {
        block.style.position = 'relative';
      }

      // 创建折叠按钮
      const foldButton = document.createElement('button');
      foldButton.className = 'code-fold-toggle';
      foldButton.innerHTML = arrowUpSVG;
      foldButton.setAttribute('aria-label', 'fold code');
      foldButton.title = '折叠/展开代码';

      // 插入到代码块中（添加到 highlight 上）
      block.appendChild(foldButton);

      // 创建折叠提示（初始隐藏）- 添加到 highlight 上
      const hint = document.createElement('div');
      hint.className = 'code-fold-hint';
      hint.textContent = '当前内容已折叠呐~';
      hint.style.display = 'none';
      block.appendChild(hint);

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
    });
  };

  // 初始执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addFoldFunctionality);
  } else {
    addFoldFunctionality();
  }

  // 监听动态添加的代码块
  const observer = new MutationObserver(function() {
    addFoldFunctionality();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 页面加载完成后再次执行
  window.addEventListener('load', function() {
    addFoldFunctionality();
  });
})();

// ========== 代码复制功能 ==========
(function() {
  // 隐藏主题自带的复制按钮
  const hideDefaultCopyButtons = function() {
    const defaultButtons = document.querySelectorAll('.copy-code, button.copy-code');
    defaultButtons.forEach(btn => {
      btn.style.display = 'none';
    });
  };

  // 添加自定义复制按钮 - 只给 highlight 添加
  const addCustomCopyButtons = function() {
    const codeBlocks = document.querySelectorAll('.highlight');

    codeBlocks.forEach(block => {
      // 跳过已经添加过按钮的代码块（直接子元素）
      if (block.querySelector(':scope > .custom-copy-code')) return;

      const button = document.createElement('button');
      button.className = 'custom-copy-code';
      button.textContent = 'copy';
      button.setAttribute('aria-label', 'copy code');

      button.addEventListener('click', function() {
        // 获取代码内容，排除行号
        let codeText = '';
        
        // 尝试找到包含实际代码的 td（通常是第二个 td）
        const table = block.querySelector('table');
        if (table) {
          // 表格结构：找到第二个 td 中的 code
          const codeCell = table.querySelector('td:nth-child(2) code, td:last-child code');
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

  // 初始执行
  hideDefaultCopyButtons();
  addCustomCopyButtons();

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
      langBtn.addEventListener('click', function() {
        showLineNumbers = !showLineNumbers;
        
        const lineNumbersDiv = block.querySelector('.line-numbers');
        if (lineNumbersDiv) {
          lineNumbersDiv.style.display = showLineNumbers ? 'block' : 'none';
        }
        
        // 更新按钮样式表示状态
        if (showLineNumbers) {
          langBtn.classList.remove('line-numbers-hidden');
        } else {
          langBtn.classList.add('line-numbers-hidden');
        }
      });
      
      // 添加到 highlight 上
      block.appendChild(langBtn);
    });
  };
  
  // 初始执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addLanguageLabels);
  } else {
    addLanguageLabels();
  }
  
  // 监听动态添加的代码块
  const langObserver = new MutationObserver(function() {
    addLanguageLabels();
  });
  
  langObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // 页面加载完成后再次执行
  window.addEventListener('load', function() {
    addLanguageLabels();
  });
})();

// ========== 简化代码块结构 ==========
(function() {
  const simplifyCodeBlocks = function() {
    // 找到所有 .highlight 元素
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
      
      // 保存按钮（如果已经添加）
      const existingButtons = highlight.querySelectorAll('.custom-copy-code, .code-fold-toggle, .code-fold-hint');
      const savedButtons = Array.from(existingButtons);
      
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
  
  // 初始执行 - 在 DOMContentLoaded 时执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // 先简化结构
      simplifyCodeBlocks();
      // 然后触发重新添加按钮（通过触发 MutationObserver）
    });
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
