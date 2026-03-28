/**
 * XML 高亮修复脚本
 * 修复 Prism 嵌套 tag 问题和白色背景问题
 */

(function() {
  'use strict';

  function fixXMLHighlighting() {
    // 查找所有 XML 代码块
    const xmlBlocks = document.querySelectorAll('code.language-xml, code.language-markup');
    
    xmlBlocks.forEach(codeBlock => {
      // 获取所有标签元素
      const tags = codeBlock.querySelectorAll('.token.tag');
      
      tags.forEach(tag => {
        // 检查是否已经处理过
        if (tag.dataset.xmlFixed) return;
        
        // 获取直接文本内容（去除 HTML 标签）
        const textContent = tag.textContent.trim();
        
        // 解析标签结构：<tag> 或 </tag> 或 <tag/>
        // 例如：<MappedFolder>、</MappedFolder>、<br/>
        const match = textContent.match(/^(<\/?)([\w-]+)(\/?>)$/);
        
        if (match) {
          const [, openBracket, tagName, closeBracket] = match;
          
          // 重新构建 HTML，正确分离各个部分
          tag.innerHTML = `<span class="token punctuation">${escapeHtml(openBracket)}</span><span class="token tag-name">${escapeHtml(tagName)}</span><span class="token punctuation">${escapeHtml(closeBracket)}</span>`;
          tag.dataset.xmlFixed = 'true';
        }
      });
    });
  }

  // HTML 转义函数
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 监听 Prism 高亮完成事件
  if (window.Prism) {
    Prism.hooks.add('complete', fixXMLHighlighting);
  }

  // DOM 加载完成后也执行一次
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(fixXMLHighlighting, 50);
    });
  } else {
    setTimeout(fixXMLHighlighting, 100);
  }

  // 也监听 after-highlight 事件
  if (window.Prism) {
    Prism.hooks.add('after-highlight', fixXMLHighlighting);
  }
})();
