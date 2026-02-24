/**
 * 禁用主题自带的滚动事件处理
 */
(function() {
  function disableThemeScroll() {
    // 如果主题代码设置了 onscroll，覆盖它
    if (window.onscroll) {
      window.onscroll = function() {
        // 空函数，禁用主题自带的滚动处理
      };
    }
  }
  
  // 立即执行一次
  disableThemeScroll();
  
  // 在页面加载完成后再次执行
  window.addEventListener('load', function() {
    setTimeout(disableThemeScroll, 0);
    setTimeout(disableThemeScroll, 100);
    setTimeout(disableThemeScroll, 500);
  });
  
  // 使用 MutationObserver 监视 DOM 变化
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function() {
      disableThemeScroll();
    });
    observer.observe(document, { childList: true, subtree: true });
    
    // 5秒后停止观察
    setTimeout(function() {
      observer.disconnect();
    }, 5000);
  }
})();
