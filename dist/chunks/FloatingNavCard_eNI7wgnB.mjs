import { b as createAstro, c as createComponent, a as renderTemplate, f as renderSlot, d as addAttribute, g as renderHead, m as maybeRenderHead, e as renderScript } from './astro/server_BR9bRUNn.mjs';
import 'piccolore';
import 'clsx';
/* empty css                         */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro$1 = createAstro("https://iqwqi.win");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Layout;
  const {
    title,
    description = "QwQBiG's World - \u8BA1\u7B97\u673A\u79D1\u5B66\u5B66\u4E60\u7B14\u8BB0",
    image = "/ZhenXun.png",
    type = "website",
    noIndex = false,
    canonicalURL = Astro2.url.pathname,
    gradientBg = true
  } = Astro2.props;
  const siteURL = new URL(canonicalURL, Astro2.site || "https://iqwqi.win");
  const ogImage = new URL(image, Astro2.site || "https://iqwqi.win");
  return renderTemplate(_a || (_a = __template(['<html lang="zh-cn" data-theme="light" class="scroll-smooth"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><!-- \u5408\u7406\u7684\u7F13\u5B58\u7B56\u7565\uFF1AHTML\u4E0D\u7F13\u5B58\uFF0C\u9759\u6001\u8D44\u6E90\u957F\u671F\u7F13\u5B58\u7531\u670D\u52A1\u5668/CDN\u5904\u7406 --><meta http-equiv="Cache-Control" content="no-cache"><title>', '</title><meta name="description"', '><link rel="canonical"', '><!-- Open Graph --><meta property="og:title"', '><meta property="og:description"', '><meta property="og:type"', '><meta property="og:url"', '><meta property="og:image"', '><!-- Twitter --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"', '><meta name="twitter:description"', '><meta name="twitter:image"', "><!-- No index for drafts -->", '<!-- Favicon --><link rel="icon" type="image/png" href="/ZhenXun.png"><!-- Google Fonts - \u6DFB\u52A0 display=swap \u907F\u514D\u963B\u585E\u6E32\u67D3 --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet"><!-- Styles --><link rel="stylesheet" href="/styles/global.css"><!-- \u5C11\u5973\u5FC3\u4EE3\u7801\u9AD8\u4EAE\u4E3B\u9898 (Catppuccin Latte) --><link rel="stylesheet" href="/styles/prism-catppuccin.css"><!-- \u81EA\u5B9A\u4E49\u4EE3\u7801\u5757\u6837\u5F0F (\u4E0D\u5305\u542B\u8BED\u6CD5\u9AD8\u4EAE\u989C\u8272) --><link rel="stylesheet" href="/styles/prism-theme.css"><!-- \u5F69\u8679\u62EC\u53F7\u6837\u5F0F --><link rel="stylesheet" href="/styles/prism-rainbow-brackets.css"><!-- \u4EE3\u7801\u4EA4\u4E92\u6837\u5F0F --><link rel="stylesheet" href="/styles/prism-code-interactions.css"><!-- KaTeX \u6570\u5B66\u516C\u5F0F\u6837\u5F0F --><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous">', "</head> <body", "> ", ` <!-- Theme Script - \u5F3A\u5236\u4F7F\u7528\u6D45\u8272\u6A21\u5F0F --> <script>
      (function() {
        // \u5F3A\u5236\u4F7F\u7528\u6D45\u8272\u6A21\u5F0F\uFF0C\u7981\u7528\u6DF1\u8272\u6A21\u5F0F
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      })();
    <\/script> <!-- Prism.js Code Blocks Functionality --> <script src="/js/prism-code-blocks.js" defer><\/script> <!-- \u5F69\u8679\u62EC\u53F7\u529F\u80FD --> <script src="/js/prism-rainbow-brackets.js" defer><\/script> <!-- \u8BED\u6CD5\u9AD8\u4EAE\u589E\u5F3A --> <script src="/js/prism-enhance.js" defer><\/script> <!-- \u4EE3\u7801\u4EA4\u4E92\u529F\u80FD --> <script src="/js/prism-code-interactions.js" defer><\/script> <!-- XML \u9AD8\u4EAE\u4FEE\u590D --> <script src="/js/prism-xml-fix.js" defer><\/script> <!-- Mermaid \u56FE\u8868\u652F\u6301 --> <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
      
      // \u521D\u59CB\u5316 Mermaid - \u7981\u7528\u81EA\u52A8\u5BBD\u5EA6\u9650\u5236\uFF0C\u786E\u4FDD\u5B8C\u6574\u663E\u793A
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        themeVariables: {
          background: 'transparent',
          primaryColor: '#fce4ec',
          primaryTextColor: '#333',
          primaryBorderColor: '#ec4899',
          lineColor: '#9c27b0',
          secondaryColor: '#f8bbd9',
          tertiaryColor: '#f3e5f5'
        },
        flowchart: {
          useMaxWidth: false,
          htmlLabels: true,
          curve: 'basis',
          padding: 20
        },
        sequence: {
          useMaxWidth: false,
          diagramMarginX: 50,
          diagramMarginY: 20
        }
      });
      
      // \u624B\u52A8\u6E32\u67D3\u6240\u6709 Mermaid \u4EE3\u7801\u5757
      function renderMermaidDiagrams() {
        const mermaidBlocks = document.querySelectorAll('pre.language-mermaid, pre[class*="mermaid"]');
        
        mermaidBlocks.forEach((block, index) => {
          const code = block.querySelector('code');
          if (!code) return;
          
          const graphDefinition = code.textContent;
          const id = 'mermaid-' + index;
          
          // \u521B\u5EFA\u5916\u5C42\u5BB9\u5668 - \u6A21\u4EFF\u4EE3\u7801\u5757\u6837\u5F0F
          const wrapper = document.createElement('div');
          wrapper.className = 'mermaid-wrapper';
          wrapper.style.cssText = 'position: relative; margin: 1.5em 0; border-radius: 16px; background: linear-gradient(135deg, #fff0f5 0%, #ffeef8 100%); box-shadow: 0 4px 20px rgba(232, 74, 122, 0.08), 0 8px 32px rgba(232, 74, 122, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6); overflow: hidden; border: 1px solid rgba(232, 74, 122, 0.1);';
          
          // \u521B\u5EFA\u5934\u90E8 - \u6A21\u4EFF\u4EE3\u7801\u5757\u5934\u90E8\u6837\u5F0F
          const header = document.createElement('div');
          header.className = 'code-header';
          header.style.cssText = 'position: relative; height: 40px; background: linear-gradient(135deg, #ffe0ed 0%, #ffd6e8 100%); border-bottom: 1px solid rgba(232, 74, 122, 0.15); z-index: 10; display: flex; align-items: center; justify-content: space-between; padding: 0 12px;';
          
          // \u5DE6\u4FA7\uFF1AMermaid \u6807\u7B7E
          const langContainer = document.createElement('div');
          langContainer.style.cssText = 'display: flex; align-items: center;';
          const langLabel = document.createElement('span');
          langLabel.textContent = 'Mermaid';
          langLabel.style.cssText = 'height: 40px; padding: 0 16px; font-family: "JetBrains Mono", "Fira Code", monospace; font-size: 13px; font-weight: 600; color: #e84a7a; display: flex; align-items: center;';
          langContainer.appendChild(langLabel);
          
          // \u53F3\u4FA7\uFF1A\u6309\u94AE\u7EC4 - \u6A21\u4EFF\u4EE3\u7801\u5757\u6309\u94AE\u6837\u5F0F
          const buttonsContainer = document.createElement('div');
          buttonsContainer.style.cssText = 'display: flex; align-items: center; gap: 8px;';
          
          // \u521B\u5EFA\u6309\u94AE - \u4F7F\u7528\u4E0E\u4EE3\u7801\u5757\u76F8\u540C\u7684\u6837\u5F0F
          const createBtn = (className, title) => {
            const btn = document.createElement('button');
            btn.className = className;
            btn.title = title;
            btn.style.cssText = 'height: 24px; padding: 0 10px; font-family: "Noto Sans SC", sans-serif; font-size: 12px; font-weight: 600; color: #e84a7a; background: rgba(232, 74, 122, 0.1); border: 1px solid rgba(232, 74, 122, 0.3); border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;';
            return btn;
          };
          
          const zoomOutBtn = createBtn('mermaid-zoom-out', '\u7F29\u5C0F');
          zoomOutBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M19 13H5v-2h14v2z"/></svg>';
          
          const resetBtn = createBtn('mermaid-reset', '\u91CD\u7F6E');
          resetBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>';
          
          const zoomInBtn = createBtn('mermaid-zoom-in', '\u653E\u5927');
          zoomInBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
          
          const fullscreenBtn = createBtn('mermaid-fullscreen', '\u5168\u5C4F');
          fullscreenBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
          
          buttonsContainer.appendChild(zoomOutBtn);
          buttonsContainer.appendChild(resetBtn);
          buttonsContainer.appendChild(zoomInBtn);
          buttonsContainer.appendChild(fullscreenBtn);
          
          header.appendChild(langContainer);
          header.appendChild(buttonsContainer);
          
          // \u521B\u5EFA\u56FE\u8868\u5185\u5BB9\u533A\u57DF - \u4F7F\u7528 auto height \u786E\u4FDD\u5B8C\u6574\u663E\u793A
          const contentWrapper = document.createElement('div');
          contentWrapper.className = 'mermaid-content-wrapper';
          contentWrapper.style.cssText = 'padding: 16px 20px; overflow-x: auto; overflow-y: visible;';
          
          // \u521B\u5EFA\u56FE\u8868\u5BB9\u5668\uFF08\u652F\u6301\u62D6\u52A8\u548C\u7F29\u653E\uFF09
          const container = document.createElement('div');
          container.className = 'mermaid-container';
          container.style.cssText = 'position: relative; width: 100%; overflow: visible; cursor: grab; background: transparent; min-height: 100px;';
          
          // \u521B\u5EFA\u5185\u5BB9\u5C42
          const content = document.createElement('div');
          content.className = 'mermaid-content';
          content.style.cssText = 'position: relative; transform: scale(1); transform-origin: top left; transition: transform 0.2s ease; display: inline-block; min-width: 100%;';
          
          contentWrapper.appendChild(container);
          container.appendChild(content);
          
          wrapper.appendChild(header);
          wrapper.appendChild(contentWrapper);
          
          // \u66FF\u6362\u4EE3\u7801\u5757
          block.parentNode.insertBefore(wrapper, block);
          block.style.display = 'none';
          
          // \u6E32\u67D3\u56FE\u8868
          mermaid.render(id, graphDefinition).then(({ svg }) => {
            content.innerHTML = svg;
            
            // \u786E\u4FDDSVG\u5B8C\u6574\u663E\u793A
            const svgElement = content.querySelector('svg');
            if (svgElement) {
              // \u79FB\u9664\u56FA\u5B9A\u5BBD\u9AD8\uFF0C\u8BA9SVG\u81EA\u9002\u5E94\u5185\u5BB9
              svgElement.style.maxWidth = 'none';
              svgElement.style.width = 'auto';
              svgElement.style.height = 'auto';
              svgElement.style.display = 'block';
              svgElement.style.overflow = 'visible';
              
              // \u4FDD\u5B58\u539F\u59CBviewBox\u4FE1\u606F\u7528\u4E8E\u540E\u7EED\u8BA1\u7B97
              const originalViewBox = svgElement.getAttribute('viewBox');
              
              // \u4FEE\u590DforeignObject\u95EE\u9898\uFF0C\u786E\u4FDD\u591A\u884C\u6587\u672C\u663E\u793A\u5B8C\u6574
              const foreignObjects = svgElement.querySelectorAll('foreignObject');
              foreignObjects.forEach(fo => {
                fo.style.overflow = 'visible';
                const div = fo.querySelector('div');
                if (div) {
                  div.style.whiteSpace = 'pre-wrap';
                  div.style.wordBreak = 'break-word';
                }
              });
              
              // \u786E\u4FDDSVG\u7684g\u5143\u7D20\u4E5F\u4E0D\u4F1A\u622A\u65AD\u5185\u5BB9
              const gElements = svgElement.querySelectorAll('g');
              gElements.forEach(g => {
                g.style.overflow = 'visible';
              });
              
              // \u8BA1\u7B97\u5B9E\u9645\u5185\u5BB9\u5C3A\u5BF8\u5E76\u8BBE\u7F6E\u5BB9\u5668
              requestAnimationFrame(() => {
                const bbox = svgElement.getBBox();
                const clientRect = svgElement.getBoundingClientRect();
                
                if (bbox && bbox.width > 0 && bbox.height > 0) {
                  // \u8BBE\u7F6E\u5BB9\u5668\u6700\u5C0F\u5C3A\u5BF8\u4E3A\u5B9E\u9645\u5185\u5BB9\u5C3A\u5BF8
                  container.style.minWidth = Math.ceil(bbox.width + bbox.x + 40) + 'px';
                  container.style.minHeight = Math.ceil(bbox.height + bbox.y + 40) + 'px';
                  
                  // \u8BA1\u7B97\u521D\u59CB\u7F29\u653E\u6BD4\u4F8B\uFF0C\u8BA9\u5185\u5BB9\u9002\u5E94\u5BB9\u5668
                  const containerWidth = container.clientWidth || clientRect.width;
                  const containerHeight = container.clientHeight || clientRect.height;
                  
                  if (containerWidth > 0 && containerHeight > 0) {
                    const scaleX = containerWidth / (bbox.width + bbox.x);
                    const scaleY = containerHeight / (bbox.height + bbox.y);
                    const fitScale = Math.min(scaleX, scaleY, 1); // \u4E0D\u653E\u5927\uFF0C\u53EA\u7F29\u5C0F
                    
                    if (fitScale < 1) {
                      scale = fitScale;
                      updateTransform();
                    }
                  }
                }
              });
            }
            
            // \u521D\u59CB\u5316\u4EA4\u4E92\u529F\u80FD
            initMermaidInteraction(wrapper, container, content, zoomOutBtn, zoomInBtn, resetBtn, fullscreenBtn);
          }).catch(err => {
            console.error('Mermaid \u6E32\u67D3\u5931\u8D25:', err);
            content.innerHTML = '<div style="color: red; padding: 20px;">\u56FE\u8868\u6E32\u67D3\u5931\u8D25</div>';
          });
        });
      }
      
      // \u521D\u59CB\u5316\u56FE\u8868\u4EA4\u4E92\u529F\u80FD
      function initMermaidInteraction(wrapper, container, content, zoomOutBtn, zoomInBtn, resetBtn, fullscreenBtn) {
        let scale = 1;
        let isDragging = false;
        let startX, startY, offsetX = 0, offsetY = 0;
        let isFullscreen = false;
        
        // \u66F4\u65B0\u53D8\u6362
        function updateTransform() {
          content.style.transform = \`scale(\${scale}) translate(\${offsetX}px, \${offsetY}px)\`;
        }
        
        // \u6309\u94AE hover \u6548\u679C
        const buttons = [zoomOutBtn, zoomInBtn, resetBtn, fullscreenBtn];
        buttons.forEach(btn => {
          btn.addEventListener('mouseenter', () => {
            btn.style.background = 'rgba(232, 74, 122, 0.2)';
            btn.style.borderColor = 'rgba(232, 74, 122, 0.5)';
          });
          btn.addEventListener('mouseleave', () => {
            btn.style.background = 'rgba(232, 74, 122, 0.1)';
            btn.style.borderColor = 'rgba(232, 74, 122, 0.3)';
          });
        });
        
        // \u653E\u5927
        zoomInBtn.addEventListener('click', () => {
          scale = Math.min(scale * 1.2, 5);
          updateTransform();
        });
        
        // \u7F29\u5C0F
        zoomOutBtn.addEventListener('click', () => {
          scale = Math.max(scale / 1.2, 0.3);
          updateTransform();
        });
        
        // \u91CD\u7F6E
        resetBtn.addEventListener('click', () => {
          scale = 1;
          offsetX = 0;
          offsetY = 0;
          updateTransform();
        });
        
        // \u5168\u5C4F
        fullscreenBtn.addEventListener('click', () => {
          if (!isFullscreen) {
            if (wrapper.requestFullscreen) {
              wrapper.requestFullscreen();
            } else if (wrapper.webkitRequestFullscreen) {
              wrapper.webkitRequestFullscreen();
            }
            isFullscreen = true;
            wrapper.classList.add('mermaid-fullscreen');
            fullscreenBtn.title = '\u9000\u51FA\u5168\u5C4F';
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            }
            isFullscreen = false;
            wrapper.classList.remove('mermaid-fullscreen');
            fullscreenBtn.title = '\u5168\u5C4F';
          }
        });
        
        // \u76D1\u542C\u5168\u5C4F\u53D8\u5316
        document.addEventListener('fullscreenchange', () => {
          if (!document.fullscreenElement) {
            isFullscreen = false;
            wrapper.classList.remove('mermaid-fullscreen');
            fullscreenBtn.title = '\u5168\u5C4F';
          }
        });
        
        // \u9F20\u6807\u62D6\u52A8
        container.addEventListener('mousedown', (e) => {
          if (e.target.tagName === 'BUTTON') return;
          isDragging = true;
          startX = e.clientX - offsetX;
          startY = e.clientY - offsetY;
          container.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          e.preventDefault();
          offsetX = e.clientX - startX;
          offsetY = e.clientY - startY;
          updateTransform();
        });
        
        document.addEventListener('mouseup', () => {
          isDragging = false;
          container.style.cursor = 'grab';
        });
        
        // \u9F20\u6807\u6EDA\u8F6E\u7F29\u653E
        container.addEventListener('wheel', (e) => {
          e.preventDefault();
          const delta = e.deltaY > 0 ? 0.9 : 1.1;
          scale = Math.max(0.3, Math.min(5, scale * delta));
          updateTransform();
        });
      }
      
      // \u9875\u9762\u52A0\u8F7D\u5B8C\u6210\u540E\u6E32\u67D3
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderMermaidDiagrams);
      } else {
        renderMermaidDiagrams();
      }
    <\/script>  </body> </html>`], ['<html lang="zh-cn" data-theme="light" class="scroll-smooth"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><!-- \u5408\u7406\u7684\u7F13\u5B58\u7B56\u7565\uFF1AHTML\u4E0D\u7F13\u5B58\uFF0C\u9759\u6001\u8D44\u6E90\u957F\u671F\u7F13\u5B58\u7531\u670D\u52A1\u5668/CDN\u5904\u7406 --><meta http-equiv="Cache-Control" content="no-cache"><title>', '</title><meta name="description"', '><link rel="canonical"', '><!-- Open Graph --><meta property="og:title"', '><meta property="og:description"', '><meta property="og:type"', '><meta property="og:url"', '><meta property="og:image"', '><!-- Twitter --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"', '><meta name="twitter:description"', '><meta name="twitter:image"', "><!-- No index for drafts -->", '<!-- Favicon --><link rel="icon" type="image/png" href="/ZhenXun.png"><!-- Google Fonts - \u6DFB\u52A0 display=swap \u907F\u514D\u963B\u585E\u6E32\u67D3 --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet"><!-- Styles --><link rel="stylesheet" href="/styles/global.css"><!-- \u5C11\u5973\u5FC3\u4EE3\u7801\u9AD8\u4EAE\u4E3B\u9898 (Catppuccin Latte) --><link rel="stylesheet" href="/styles/prism-catppuccin.css"><!-- \u81EA\u5B9A\u4E49\u4EE3\u7801\u5757\u6837\u5F0F (\u4E0D\u5305\u542B\u8BED\u6CD5\u9AD8\u4EAE\u989C\u8272) --><link rel="stylesheet" href="/styles/prism-theme.css"><!-- \u5F69\u8679\u62EC\u53F7\u6837\u5F0F --><link rel="stylesheet" href="/styles/prism-rainbow-brackets.css"><!-- \u4EE3\u7801\u4EA4\u4E92\u6837\u5F0F --><link rel="stylesheet" href="/styles/prism-code-interactions.css"><!-- KaTeX \u6570\u5B66\u516C\u5F0F\u6837\u5F0F --><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous">', "</head> <body", "> ", ` <!-- Theme Script - \u5F3A\u5236\u4F7F\u7528\u6D45\u8272\u6A21\u5F0F --> <script>
      (function() {
        // \u5F3A\u5236\u4F7F\u7528\u6D45\u8272\u6A21\u5F0F\uFF0C\u7981\u7528\u6DF1\u8272\u6A21\u5F0F
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      })();
    <\/script> <!-- Prism.js Code Blocks Functionality --> <script src="/js/prism-code-blocks.js" defer><\/script> <!-- \u5F69\u8679\u62EC\u53F7\u529F\u80FD --> <script src="/js/prism-rainbow-brackets.js" defer><\/script> <!-- \u8BED\u6CD5\u9AD8\u4EAE\u589E\u5F3A --> <script src="/js/prism-enhance.js" defer><\/script> <!-- \u4EE3\u7801\u4EA4\u4E92\u529F\u80FD --> <script src="/js/prism-code-interactions.js" defer><\/script> <!-- XML \u9AD8\u4EAE\u4FEE\u590D --> <script src="/js/prism-xml-fix.js" defer><\/script> <!-- Mermaid \u56FE\u8868\u652F\u6301 --> <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
      
      // \u521D\u59CB\u5316 Mermaid - \u7981\u7528\u81EA\u52A8\u5BBD\u5EA6\u9650\u5236\uFF0C\u786E\u4FDD\u5B8C\u6574\u663E\u793A
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        themeVariables: {
          background: 'transparent',
          primaryColor: '#fce4ec',
          primaryTextColor: '#333',
          primaryBorderColor: '#ec4899',
          lineColor: '#9c27b0',
          secondaryColor: '#f8bbd9',
          tertiaryColor: '#f3e5f5'
        },
        flowchart: {
          useMaxWidth: false,
          htmlLabels: true,
          curve: 'basis',
          padding: 20
        },
        sequence: {
          useMaxWidth: false,
          diagramMarginX: 50,
          diagramMarginY: 20
        }
      });
      
      // \u624B\u52A8\u6E32\u67D3\u6240\u6709 Mermaid \u4EE3\u7801\u5757
      function renderMermaidDiagrams() {
        const mermaidBlocks = document.querySelectorAll('pre.language-mermaid, pre[class*="mermaid"]');
        
        mermaidBlocks.forEach((block, index) => {
          const code = block.querySelector('code');
          if (!code) return;
          
          const graphDefinition = code.textContent;
          const id = 'mermaid-' + index;
          
          // \u521B\u5EFA\u5916\u5C42\u5BB9\u5668 - \u6A21\u4EFF\u4EE3\u7801\u5757\u6837\u5F0F
          const wrapper = document.createElement('div');
          wrapper.className = 'mermaid-wrapper';
          wrapper.style.cssText = 'position: relative; margin: 1.5em 0; border-radius: 16px; background: linear-gradient(135deg, #fff0f5 0%, #ffeef8 100%); box-shadow: 0 4px 20px rgba(232, 74, 122, 0.08), 0 8px 32px rgba(232, 74, 122, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6); overflow: hidden; border: 1px solid rgba(232, 74, 122, 0.1);';
          
          // \u521B\u5EFA\u5934\u90E8 - \u6A21\u4EFF\u4EE3\u7801\u5757\u5934\u90E8\u6837\u5F0F
          const header = document.createElement('div');
          header.className = 'code-header';
          header.style.cssText = 'position: relative; height: 40px; background: linear-gradient(135deg, #ffe0ed 0%, #ffd6e8 100%); border-bottom: 1px solid rgba(232, 74, 122, 0.15); z-index: 10; display: flex; align-items: center; justify-content: space-between; padding: 0 12px;';
          
          // \u5DE6\u4FA7\uFF1AMermaid \u6807\u7B7E
          const langContainer = document.createElement('div');
          langContainer.style.cssText = 'display: flex; align-items: center;';
          const langLabel = document.createElement('span');
          langLabel.textContent = 'Mermaid';
          langLabel.style.cssText = 'height: 40px; padding: 0 16px; font-family: "JetBrains Mono", "Fira Code", monospace; font-size: 13px; font-weight: 600; color: #e84a7a; display: flex; align-items: center;';
          langContainer.appendChild(langLabel);
          
          // \u53F3\u4FA7\uFF1A\u6309\u94AE\u7EC4 - \u6A21\u4EFF\u4EE3\u7801\u5757\u6309\u94AE\u6837\u5F0F
          const buttonsContainer = document.createElement('div');
          buttonsContainer.style.cssText = 'display: flex; align-items: center; gap: 8px;';
          
          // \u521B\u5EFA\u6309\u94AE - \u4F7F\u7528\u4E0E\u4EE3\u7801\u5757\u76F8\u540C\u7684\u6837\u5F0F
          const createBtn = (className, title) => {
            const btn = document.createElement('button');
            btn.className = className;
            btn.title = title;
            btn.style.cssText = 'height: 24px; padding: 0 10px; font-family: "Noto Sans SC", sans-serif; font-size: 12px; font-weight: 600; color: #e84a7a; background: rgba(232, 74, 122, 0.1); border: 1px solid rgba(232, 74, 122, 0.3); border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;';
            return btn;
          };
          
          const zoomOutBtn = createBtn('mermaid-zoom-out', '\u7F29\u5C0F');
          zoomOutBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M19 13H5v-2h14v2z"/></svg>';
          
          const resetBtn = createBtn('mermaid-reset', '\u91CD\u7F6E');
          resetBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>';
          
          const zoomInBtn = createBtn('mermaid-zoom-in', '\u653E\u5927');
          zoomInBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
          
          const fullscreenBtn = createBtn('mermaid-fullscreen', '\u5168\u5C4F');
          fullscreenBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
          
          buttonsContainer.appendChild(zoomOutBtn);
          buttonsContainer.appendChild(resetBtn);
          buttonsContainer.appendChild(zoomInBtn);
          buttonsContainer.appendChild(fullscreenBtn);
          
          header.appendChild(langContainer);
          header.appendChild(buttonsContainer);
          
          // \u521B\u5EFA\u56FE\u8868\u5185\u5BB9\u533A\u57DF - \u4F7F\u7528 auto height \u786E\u4FDD\u5B8C\u6574\u663E\u793A
          const contentWrapper = document.createElement('div');
          contentWrapper.className = 'mermaid-content-wrapper';
          contentWrapper.style.cssText = 'padding: 16px 20px; overflow-x: auto; overflow-y: visible;';
          
          // \u521B\u5EFA\u56FE\u8868\u5BB9\u5668\uFF08\u652F\u6301\u62D6\u52A8\u548C\u7F29\u653E\uFF09
          const container = document.createElement('div');
          container.className = 'mermaid-container';
          container.style.cssText = 'position: relative; width: 100%; overflow: visible; cursor: grab; background: transparent; min-height: 100px;';
          
          // \u521B\u5EFA\u5185\u5BB9\u5C42
          const content = document.createElement('div');
          content.className = 'mermaid-content';
          content.style.cssText = 'position: relative; transform: scale(1); transform-origin: top left; transition: transform 0.2s ease; display: inline-block; min-width: 100%;';
          
          contentWrapper.appendChild(container);
          container.appendChild(content);
          
          wrapper.appendChild(header);
          wrapper.appendChild(contentWrapper);
          
          // \u66FF\u6362\u4EE3\u7801\u5757
          block.parentNode.insertBefore(wrapper, block);
          block.style.display = 'none';
          
          // \u6E32\u67D3\u56FE\u8868
          mermaid.render(id, graphDefinition).then(({ svg }) => {
            content.innerHTML = svg;
            
            // \u786E\u4FDDSVG\u5B8C\u6574\u663E\u793A
            const svgElement = content.querySelector('svg');
            if (svgElement) {
              // \u79FB\u9664\u56FA\u5B9A\u5BBD\u9AD8\uFF0C\u8BA9SVG\u81EA\u9002\u5E94\u5185\u5BB9
              svgElement.style.maxWidth = 'none';
              svgElement.style.width = 'auto';
              svgElement.style.height = 'auto';
              svgElement.style.display = 'block';
              svgElement.style.overflow = 'visible';
              
              // \u4FDD\u5B58\u539F\u59CBviewBox\u4FE1\u606F\u7528\u4E8E\u540E\u7EED\u8BA1\u7B97
              const originalViewBox = svgElement.getAttribute('viewBox');
              
              // \u4FEE\u590DforeignObject\u95EE\u9898\uFF0C\u786E\u4FDD\u591A\u884C\u6587\u672C\u663E\u793A\u5B8C\u6574
              const foreignObjects = svgElement.querySelectorAll('foreignObject');
              foreignObjects.forEach(fo => {
                fo.style.overflow = 'visible';
                const div = fo.querySelector('div');
                if (div) {
                  div.style.whiteSpace = 'pre-wrap';
                  div.style.wordBreak = 'break-word';
                }
              });
              
              // \u786E\u4FDDSVG\u7684g\u5143\u7D20\u4E5F\u4E0D\u4F1A\u622A\u65AD\u5185\u5BB9
              const gElements = svgElement.querySelectorAll('g');
              gElements.forEach(g => {
                g.style.overflow = 'visible';
              });
              
              // \u8BA1\u7B97\u5B9E\u9645\u5185\u5BB9\u5C3A\u5BF8\u5E76\u8BBE\u7F6E\u5BB9\u5668
              requestAnimationFrame(() => {
                const bbox = svgElement.getBBox();
                const clientRect = svgElement.getBoundingClientRect();
                
                if (bbox && bbox.width > 0 && bbox.height > 0) {
                  // \u8BBE\u7F6E\u5BB9\u5668\u6700\u5C0F\u5C3A\u5BF8\u4E3A\u5B9E\u9645\u5185\u5BB9\u5C3A\u5BF8
                  container.style.minWidth = Math.ceil(bbox.width + bbox.x + 40) + 'px';
                  container.style.minHeight = Math.ceil(bbox.height + bbox.y + 40) + 'px';
                  
                  // \u8BA1\u7B97\u521D\u59CB\u7F29\u653E\u6BD4\u4F8B\uFF0C\u8BA9\u5185\u5BB9\u9002\u5E94\u5BB9\u5668
                  const containerWidth = container.clientWidth || clientRect.width;
                  const containerHeight = container.clientHeight || clientRect.height;
                  
                  if (containerWidth > 0 && containerHeight > 0) {
                    const scaleX = containerWidth / (bbox.width + bbox.x);
                    const scaleY = containerHeight / (bbox.height + bbox.y);
                    const fitScale = Math.min(scaleX, scaleY, 1); // \u4E0D\u653E\u5927\uFF0C\u53EA\u7F29\u5C0F
                    
                    if (fitScale < 1) {
                      scale = fitScale;
                      updateTransform();
                    }
                  }
                }
              });
            }
            
            // \u521D\u59CB\u5316\u4EA4\u4E92\u529F\u80FD
            initMermaidInteraction(wrapper, container, content, zoomOutBtn, zoomInBtn, resetBtn, fullscreenBtn);
          }).catch(err => {
            console.error('Mermaid \u6E32\u67D3\u5931\u8D25:', err);
            content.innerHTML = '<div style="color: red; padding: 20px;">\u56FE\u8868\u6E32\u67D3\u5931\u8D25</div>';
          });
        });
      }
      
      // \u521D\u59CB\u5316\u56FE\u8868\u4EA4\u4E92\u529F\u80FD
      function initMermaidInteraction(wrapper, container, content, zoomOutBtn, zoomInBtn, resetBtn, fullscreenBtn) {
        let scale = 1;
        let isDragging = false;
        let startX, startY, offsetX = 0, offsetY = 0;
        let isFullscreen = false;
        
        // \u66F4\u65B0\u53D8\u6362
        function updateTransform() {
          content.style.transform = \\\`scale(\\\${scale}) translate(\\\${offsetX}px, \\\${offsetY}px)\\\`;
        }
        
        // \u6309\u94AE hover \u6548\u679C
        const buttons = [zoomOutBtn, zoomInBtn, resetBtn, fullscreenBtn];
        buttons.forEach(btn => {
          btn.addEventListener('mouseenter', () => {
            btn.style.background = 'rgba(232, 74, 122, 0.2)';
            btn.style.borderColor = 'rgba(232, 74, 122, 0.5)';
          });
          btn.addEventListener('mouseleave', () => {
            btn.style.background = 'rgba(232, 74, 122, 0.1)';
            btn.style.borderColor = 'rgba(232, 74, 122, 0.3)';
          });
        });
        
        // \u653E\u5927
        zoomInBtn.addEventListener('click', () => {
          scale = Math.min(scale * 1.2, 5);
          updateTransform();
        });
        
        // \u7F29\u5C0F
        zoomOutBtn.addEventListener('click', () => {
          scale = Math.max(scale / 1.2, 0.3);
          updateTransform();
        });
        
        // \u91CD\u7F6E
        resetBtn.addEventListener('click', () => {
          scale = 1;
          offsetX = 0;
          offsetY = 0;
          updateTransform();
        });
        
        // \u5168\u5C4F
        fullscreenBtn.addEventListener('click', () => {
          if (!isFullscreen) {
            if (wrapper.requestFullscreen) {
              wrapper.requestFullscreen();
            } else if (wrapper.webkitRequestFullscreen) {
              wrapper.webkitRequestFullscreen();
            }
            isFullscreen = true;
            wrapper.classList.add('mermaid-fullscreen');
            fullscreenBtn.title = '\u9000\u51FA\u5168\u5C4F';
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            }
            isFullscreen = false;
            wrapper.classList.remove('mermaid-fullscreen');
            fullscreenBtn.title = '\u5168\u5C4F';
          }
        });
        
        // \u76D1\u542C\u5168\u5C4F\u53D8\u5316
        document.addEventListener('fullscreenchange', () => {
          if (!document.fullscreenElement) {
            isFullscreen = false;
            wrapper.classList.remove('mermaid-fullscreen');
            fullscreenBtn.title = '\u5168\u5C4F';
          }
        });
        
        // \u9F20\u6807\u62D6\u52A8
        container.addEventListener('mousedown', (e) => {
          if (e.target.tagName === 'BUTTON') return;
          isDragging = true;
          startX = e.clientX - offsetX;
          startY = e.clientY - offsetY;
          container.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          e.preventDefault();
          offsetX = e.clientX - startX;
          offsetY = e.clientY - startY;
          updateTransform();
        });
        
        document.addEventListener('mouseup', () => {
          isDragging = false;
          container.style.cursor = 'grab';
        });
        
        // \u9F20\u6807\u6EDA\u8F6E\u7F29\u653E
        container.addEventListener('wheel', (e) => {
          e.preventDefault();
          const delta = e.deltaY > 0 ? 0.9 : 1.1;
          scale = Math.max(0.3, Math.min(5, scale * delta));
          updateTransform();
        });
      }
      
      // \u9875\u9762\u52A0\u8F7D\u5B8C\u6210\u540E\u6E32\u67D3
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderMermaidDiagrams);
      } else {
        renderMermaidDiagrams();
      }
    <\/script>  </body> </html>`])), title, addAttribute(description, "content"), addAttribute(siteURL, "href"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(type, "content"), addAttribute(siteURL, "content"), addAttribute(ogImage, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(ogImage, "content"), noIndex && renderTemplate`<meta name="robots" content="noindex, nofollow">`, renderHead(), addAttribute(`min-h-[100dvh] min-h-screen flex flex-col transition-colors duration-300 ${gradientBg ? "gradient-bg" : "bg-bg-primary text-text-primary"}`, "class"), renderSlot($$result, $$slots["default"]));
}, "D:/Projects/MyBlog-Astro/src/layouts/Layout.astro", void 0);

const $$Astro = createAstro("https://iqwqi.win");
const $$FloatingNavCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$FloatingNavCard;
  return renderTemplate`${maybeRenderHead()}<div id="floatingNavCard" class="fixed top-4 left-4 z-50"> <!-- 完全复制主界面 GlassCard 结构和样式 --> <div class="glass-card relative overflow-hidden bg-white/30 backdrop-blur-xl border border-white/60 rounded-[2rem] p-3 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 ease-out cursor-pointer" data-tilt="true" style="
      transform-style: preserve-3d;
      will-change: transform;
      box-shadow:
        0 20px 40px -15px rgba(0, 0, 0, 0.08),
        0 40px 60px -20px rgba(0, 0, 0, 0.05),
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.7),
        inset 0 -1px 1px 0 rgba(255, 255, 255, 0.3);
    "> <!-- 顶部边缘高光 - 模拟玻璃反光 --> <div class="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-[1]"></div> <!-- 内部光晕效果 - 柔和渐变 --> <div class="absolute inset-0 rounded-[2rem] pointer-events-none z-[1]" style="
        background: linear-gradient(
          165deg,
          rgba(255, 255, 255, 0.5) 0%,
          rgba(255, 255, 255, 0.2) 30%,
          rgba(255, 255, 255, 0.05) 60%,
          rgba(255, 255, 255, 0) 100%
        );
      "></div> <!-- 底部微光 - 增加立体感 --> <div class="absolute bottom-0 left-0 right-0 h-1/3 rounded-b-[2rem] pointer-events-none z-[1]" style="
        background: linear-gradient(
          to top,
          rgba(255, 255, 255, 0.15) 0%,
          transparent 100%
        );
      "></div> <!-- 动态高光/反光层 - 跟随鼠标 --> <div class="glare absolute inset-0 rounded-[2rem] pointer-events-none z-[2] opacity-0 transition-opacity duration-500" style="
        background: radial-gradient(
          circle at 50% 50%,
          rgba(255, 255, 255, 0.9) 0%,
          rgba(255, 255, 255, 0.5) 20%,
          rgba(255, 255, 255, 0.2) 40%,
          transparent 70%
        );
        mix-blend-mode: soft-light;
      "></div> <!-- 内容区域 - 与主界面转换后的导航栏完全一致 --> <div class="relative z-[999] h-full" style="pointer-events: auto;"> <!-- 横向布局，紧凑排列 --> <div class="flex flex-row items-center gap-2"> <!-- 头像 - 2rem (32px) 与主界面转换后一致 --> <a href="/" class="flex-shrink-0" style="pointer-events: auto;"> <div class="nav-avatar relative w-8 h-8"> <img src="/ZhenXun.png" alt="iqwqi" class="w-full h-full object-cover rounded-lg border-2 border-white/60 shadow-md"> <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white shadow-sm"></div> </div> </a> <!-- 导航链接 - 横向排列，正方形图标按钮 2rem x 2rem --> <nav class="nav-links flex flex-row gap-1"> <a href="/cs/" class="nav-link-item" title="posts" style="pointer-events: auto;"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path> </svg> </a> <a href="/series/" class="nav-link-item" title="series" style="pointer-events: auto;"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path> </svg> </a> <a href="/tags/" class="nav-link-item" title="tags" style="pointer-events: auto;"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path> </svg> </a> <a href="/archives/" class="nav-link-item" title="archives" style="pointer-events: auto;"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg> </a> <a href="/poetry/" class="nav-link-item" title="poetry" style="pointer-events: auto;"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path> </svg> </a> <a href="/about/" class="nav-link-item" title="about" style="pointer-events: auto;"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path> </svg> </a> <a href="/search/" class="nav-link-item" title="search" style="pointer-events: auto;"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> </a> </nav> </div> </div> </div> </div> ${renderScript($$result, "D:/Projects/MyBlog-Astro/src/components/layout/FloatingNavCard.astro?astro&type=script&index=0&lang.ts")} `;
}, "D:/Projects/MyBlog-Astro/src/components/layout/FloatingNavCard.astro", void 0);

export { $$Layout as $, $$FloatingNavCard as a };
