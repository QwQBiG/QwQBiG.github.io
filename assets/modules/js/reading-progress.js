/**
 * 阅读进度条功能
 */
(function() {
  'use strict';

  function initProgressBar() {
    // 检查是否已存在
    if (document.querySelector('.reading-progress-container')) {
      return;
    }

    // 创建进度条容器
    var progressContainer = document.createElement('div');
    progressContainer.className = 'reading-progress-container';
    progressContainer.innerHTML = '<div class="reading-progress-bar"></div>';

    // 插入到 body 开头
    if (document.body && document.body.firstChild) {
      document.body.insertBefore(progressContainer, document.body.firstChild);
    } else if (document.body) {
      document.body.appendChild(progressContainer);
    } else {
      return;
    }

    var progressBar = progressContainer.querySelector('.reading-progress-bar');

    // 创建百分比显示
    var percentDisplay = document.createElement('div');
    percentDisplay.className = 'reading-progress-percent';
    percentDisplay.textContent = '0%';
    document.body.appendChild(percentDisplay);

    // 计算进度
    function getProgress() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

      if (docHeight <= 0) {
        return 0;
      }

      var progress = (scrollTop / docHeight) * 100;
      return Math.min(100, Math.max(0, progress));
    }

    // 更新进度条 - 使用 !important 确保覆盖
    function updateProgress() {
      var progress = getProgress();

      if (progressBar) {
        progressBar.style.setProperty('width', progress + '%', 'important');
      }

      if (percentDisplay) {
        percentDisplay.textContent = Math.round(progress) + '%';
      }
    }

    // 绑定滚动事件
    window.addEventListener('scroll', updateProgress, false);
    window.addEventListener('resize', updateProgress, false);

    // 初始化
    updateProgress();

    // 延迟更新（等待页面完全加载）
    setTimeout(updateProgress, 100);
    setTimeout(updateProgress, 500);
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProgressBar);
  } else {
    initProgressBar();
  }
})();
