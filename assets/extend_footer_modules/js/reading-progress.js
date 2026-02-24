/**
 * 阅读进度条功能
 */
(function() {
  // 确保在 DOM 加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProgressBar);
  } else {
    initProgressBar();
  }
  
  function initProgressBar() {
    // 检查是否已存在
    if (document.querySelector('.reading-progress-container')) {
      console.log('Progress bar already exists');
      return;
    }
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'reading-progress-container';
    progressContainer.innerHTML = '<div class="reading-progress-bar"></div>';
    
    // 确保 body 元素存在
    if (!document.body) {
      console.error('Body element not found');
      return;
    }
    
    // 插入到 body 元素的最前面，确保它在所有内容之上
    if (document.body) {
      if (document.body.firstChild) {
        document.body.insertBefore(progressContainer, document.body.firstChild);
      } else {
        document.body.appendChild(progressContainer);
      }
    } else {
      // 如果 body 不存在，插入到 html 元素
      if (document.documentElement.firstChild) {
        document.documentElement.insertBefore(progressContainer, document.documentElement.firstChild);
      } else {
        document.documentElement.appendChild(progressContainer);
      }
    }
    
    console.log('Progress bar inserted');

    const progressBar = progressContainer.querySelector('.reading-progress-bar');
    
    // 创建百分比显示元素
    const percentDisplay = document.createElement('div');
    percentDisplay.className = 'reading-progress-percent';
    percentDisplay.textContent = '0%';
    document.body.appendChild(percentDisplay);

    function updateProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
      percentDisplay.textContent = Math.round(progress) + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();
    
    console.log('Reading progress bar initialized with percent display');
  }
})();
