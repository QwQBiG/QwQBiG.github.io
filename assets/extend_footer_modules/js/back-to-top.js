/**
 * 返回顶部按钮功能
 */
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
