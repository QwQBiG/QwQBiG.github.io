/**
 * 自定义分页组件 - 粉红
 * 替换 Hugo 默认的分页样式
 */

(function() {
  'use strict';
  
  // 初始化分页
  function initCustomPagination() {
    // 查找所有分页容器
    const paginationContainers = document.querySelectorAll('.pagination, .pagination-default, nav[aria-label="pagination"]');
    
    paginationContainers.forEach((container, index) => {
      // 如果已经处理过，跳过
      if (container.dataset.customPagination === 'true') {
        return;
      }
      
      // 获取分页信息
      const pageLinks = container.querySelectorAll('.page-link');
      const currentPageEl = container.querySelector('.page-item.active .page-link');
      const currentPageNum = currentPageEl ? parseInt(currentPageEl.textContent) || 1 : 1;
      
      // 从链接中提取基础 URL
      let baseUrl = '';
      let totalPages = currentPageNum; // 默认总页数为当前页
      
      // 遍历所有链接，寻找最大页码
      pageLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          // 从链接中提取页码，比如 /page/7/ 中的 7
          const match = href.match(/\/page\/(\d+)\/$/);
          if (match && match[1]) {
            const pageNum = parseInt(match[1]);
            if (pageNum > totalPages) {
              totalPages = pageNum;
            }
            // 提取基础 URL
            if (!baseUrl) {
              baseUrl = href.replace(/\/page\/\d+\/$/, '/');
            }
          }
        }
      });
      
      // 方法2: 从当前页面 URL 推断
      if (!baseUrl) {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/page/')) {
          baseUrl = currentPath.replace(/\/page\/\d+\/$/, '/');
        } else {
          baseUrl = currentPath.endsWith('/') ? currentPath : currentPath + '/';
        }
      }
      
      // 确保 baseUrl 以 / 结尾
      if (!baseUrl.endsWith('/')) {
        baseUrl += '/';
      }
      
      // 创建自定义分页
      const customPagination = createPaginationHTML(currentPageNum, totalPages, baseUrl);
      
      // 替换原分页
      container.innerHTML = customPagination;
      container.className = 'custom-pagination';
      container.dataset.customPagination = 'true';
    });
  }
  
  // 创建分页 HTML
  function createPaginationHTML(currentPage, totalPages, baseUrl) {
    let html = '';
    
    // 确保 baseUrl 以 / 结尾
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    
    // 首页按钮
    if (currentPage > 1) {
      html += `<li class="page-item first"><a href="${baseUrl}" class="page-link" aria-label="First">««</a></li>`;
    } else {
      html += `<li class="page-item first disabled"><span class="page-link" aria-label="First">««</span></li>`;
    }
    
    // 上一页按钮
    if (currentPage > 1) {
      const prevUrl = currentPage === 2 ? baseUrl : `${baseUrl}page/${currentPage - 1}/`;
      html += `<li class="page-item prev"><a href="${prevUrl}" class="page-link" aria-label="Previous">«</a></li>`;
    } else {
      html += `<li class="page-item prev disabled"><span class="page-link" aria-label="Previous">«</span></li>`;
    }
    
    // 页码 - 只显示以当前页为中心的5页
    const pageRange = getCenteredPageRange(currentPage, totalPages);
    
    pageRange.forEach(page => {
      if (page === currentPage) {
        html += `<li class="page-item active"><span class="page-link" aria-current="page">${page}</span></li>`;
      } else {
        const pageUrl = page === 1 ? baseUrl : `${baseUrl}page/${page}/`;
        html += `<li class="page-item"><a href="${pageUrl}" class="page-link" aria-label="Page ${page}">${page}</a></li>`;
      }
    });
    
    // 下一页按钮
    if (currentPage < totalPages) {
      html += `<li class="page-item next"><a href="${baseUrl}page/${currentPage + 1}/" class="page-link" aria-label="Next">»</a></li>`;
    } else {
      html += `<li class="page-item next disabled"><span class="page-link" aria-label="Next">»</span></li>`;
    }
    
    // 末页按钮
    if (currentPage < totalPages) {
      html += `<li class="page-item last"><a href="${baseUrl}page/${totalPages}/" class="page-link" aria-label="Last">»»</a></li>`;
    } else {
      html += `<li class="page-item last disabled"><span class="page-link" aria-label="Last">»»</span></li>`;
    }
    
    return html;
  }
  
  // 获取以当前页为中心的5页范围
  function getCenteredPageRange(currentPage, totalPages) {
    const range = [];
    const pageCount = 5; // 显示5页
    
    // 计算起始页码
    let startPage = currentPage - Math.floor(pageCount / 2);
    let endPage = currentPage + Math.floor(pageCount / 2);
    
    // 调整起始和结束页码，确保在有效范围内
    if (startPage < 1) {
      startPage = 1;
      endPage = Math.min(pageCount, totalPages);
    }
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, totalPages - pageCount + 1);
    }
    
    // 生成页码范围
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    
    return range;
  }
  
  // 页面加载时初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomPagination);
  } else {
    initCustomPagination();
  }
  
  // 页面过渡完成后重新初始化
  window.addEventListener('pageTransitionComplete', initCustomPagination);
  
  // 暴露到全局
  window.initCustomPagination = initCustomPagination;
})();
