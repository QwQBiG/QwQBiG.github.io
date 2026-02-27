/**
 * 代码块折叠/展开功能
 */
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
    // 选择所有可能包含代码的元素
    const codeBlocks = document.querySelectorAll('.highlight, .chroma');
    
    codeBlocks.forEach(block => {
      // 跳过已经添加过折叠按钮的代码块
      if (block.querySelector('.code-fold-toggle')) return;
      
      // 跳过已经有其他折叠功能的代码块
      if (block.querySelector('.fold, .unfold, .toggle-fold')) return;
      
      // 检查是否需要折叠功能
      if (!shouldEnableFold(block)) return;
      
      // 确保代码块有相对定位
      block.style.position = 'relative';
      
      // 创建折叠按钮
      const foldButton = document.createElement('button');
      foldButton.className = 'code-fold-toggle';
      foldButton.innerHTML = arrowUpSVG;
      foldButton.setAttribute('aria-label', 'fold code');
      foldButton.title = '折叠/展开代码';
      
      // 插入到代码块中
      block.appendChild(foldButton);
      
      // 创建折叠提示（初始隐藏）
      const hint = document.createElement('div');
      hint.className = 'code-fold-hint';
      hint.textContent = '当前内容已折叠呐~';
      hint.style.display = 'none';
      block.insertBefore(hint, block.firstChild);
      
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
