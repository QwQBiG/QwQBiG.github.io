/**
 * 代码复制按钮功能
 */
(function() {
  // 隐藏主题自带的复制按钮
  const hideDefaultCopyButtons = function() {
    const defaultButtons = document.querySelectorAll('.copy-code, button.copy-code');
    defaultButtons.forEach(btn => {
      btn.style.display = 'none';
    });
  };
  
  // 添加自定义复制按钮 - 只给 highlight 和 chroma 类添加
  const addCustomCopyButtons = function() {
    const codeBlocks = document.querySelectorAll('.highlight, .chroma');
    
    codeBlocks.forEach(block => {
      // 跳过已经添加过按钮的代码块
      if (block.querySelector('.custom-copy-code')) return;
      
      const button = document.createElement('button');
      button.className = 'custom-copy-code';
      button.textContent = 'copy';
      button.setAttribute('aria-label', 'copy code');
      
      button.addEventListener('click', function() {
        const code = block.querySelector('code')?.textContent || block.textContent;
        navigator.clipboard.writeText(code).then(function() {
          button.textContent = 'copied';
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
      
      block.style.position = 'relative';
      block.appendChild(button);
    });
  };
  
  // 初始执行
  hideDefaultCopyButtons();
  addCustomCopyButtons();
  
  // 监听动态添加的代码块
  const observer = new MutationObserver(function() {
    hideDefaultCopyButtons();
    addCustomCopyButtons();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // 页面加载完成后再次执行
  window.addEventListener('load', function() {
    hideDefaultCopyButtons();
    addCustomCopyButtons();
  });
})();
