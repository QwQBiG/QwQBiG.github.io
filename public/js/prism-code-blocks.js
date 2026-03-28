/**
 * Prism.js 代码块功能集成
 * 功能：复制、折叠、语言标签、行号控制
 */

(function() {
  'use strict';

  // 语言映射表
  const langMap = {
    'cpp': 'C++',
    'c++': 'C++',
    'c': 'C',
    'rust': 'Rust',
    'rs': 'Rust',
    'java': 'Java',
    'python': 'Python',
    'py': 'Python',
    'javascript': 'JavaScript',
    'js': 'JS',
    'typescript': 'TypeScript',
    'ts': 'TS',
    'jsx': 'JSX',
    'tsx': 'TSX',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'Sass',
    'json': 'JSON',
    'yaml': 'YAML',
    'yml': 'YAML',
    'toml': 'TOML',
    'xml': 'XML',
    'sql': 'SQL',
    'bash': 'Bash',
    'sh': 'Shell',
    'shell': 'Shell',
    'powershell': 'PowerShell',
    'ps1': 'PS',
    'markdown': 'Markdown',
    'md': 'MD',
    'mdx': 'MDX',
    'astro': 'Astro',
    'vue': 'Vue',
    'svelte': 'Svelte',
    'go': 'Go',
    'golang': 'Go',
    'kotlin': 'Kotlin',
    'kt': 'Kotlin',
    'swift': 'Swift',
    'ruby': 'Ruby',
    'rb': 'Ruby',
    'php': 'PHP',
    'dockerfile': 'Docker',
    'docker': 'Docker',
    'nginx': 'Nginx',
    'vim': 'Vim',
    'lua': 'Lua',
    'r': 'R',
    'matlab': 'MATLAB',
    'scala': 'Scala',
    'groovy': 'Groovy',
    'perl': 'Perl',
    'haskell': 'Haskell',
    'clojure': 'Clojure',
    'erlang': 'Erlang',
    'elixir': 'Elixir',
    'dart': 'Dart',
    'flutter': 'Dart',
    'julia': 'Julia',
    'ocaml': 'OCaml',
    'fsharp': 'F#',
    'csharp': 'C#',
    'cs': 'C#',
    'vb': 'VB',
    'asm': 'Assembly',
    'wasm': 'WASM',
    'graphql': 'GraphQL',
    'regex': 'Regex',
    'diff': 'Diff',
    'git': 'Git',
    'ini': 'INI',
    'env': 'Env',
    'tex': 'LaTeX',
    'latex': 'LaTeX',
    'plain': 'Text',
    'text': 'Text',
    'txt': 'Text'
  };

  /**
   * 获取语言显示名称
   */
  function getLangName(lang) {
    if (!lang) return 'Code';
    const normalized = lang.toLowerCase().trim();
    return langMap[normalized] || lang.charAt(0).toUpperCase() + lang.slice(1);
  }

  /**
   * 创建代码块头部
   */
  function createCodeHeader(pre, code) {
    const header = document.createElement('div');
    header.className = 'code-header';

    // 获取语言
    const langClass = Array.from(pre.classList).find(c => c.startsWith('language-'));
    const lang = langClass ? langClass.replace('language-', '') : '';
    const langName = getLangName(lang);

    // 左侧：语言标签（可点击切换行号）
    const langContainer = document.createElement('div');
    langContainer.className = 'code-lang-container';

    const langBtn = document.createElement('button');
    langBtn.className = 'code-lang-btn';
    langBtn.textContent = langName;
    langBtn.title = '点击切换行号显示';
    langBtn.addEventListener('click', () => toggleLineNumbers(pre));

    langContainer.appendChild(langBtn);
    header.appendChild(langContainer);

    // 右侧：按钮组
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'code-header-buttons';

    // 搜索按钮
    const searchBtn = document.createElement('button');
    searchBtn.className = 'code-search-btn';
    searchBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14">
        <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
    `;
    searchBtn.title = '搜索代码 (Ctrl+Shift+F)';
    searchBtn.addEventListener('click', () => openCodeSearch(pre));
    buttonsContainer.appendChild(searchBtn);

    // 折叠按钮（代码超过 15 行才显示）
    const lines = code.textContent.split('\n').length;
    if (lines > 15) {
      const foldBtn = document.createElement('button');
      foldBtn.className = 'code-fold-toggle';
      foldBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      `;
      foldBtn.title = '折叠/展开';
      foldBtn.addEventListener('click', () => toggleFold(pre, foldBtn));
      buttonsContainer.appendChild(foldBtn);
    }

    // 复制按钮
    const copyBtn = document.createElement('button');
    copyBtn.className = 'custom-copy-code';
    copyBtn.textContent = 'copy';
    copyBtn.addEventListener('click', () => copyCode(code, copyBtn));
    buttonsContainer.appendChild(copyBtn);

    header.appendChild(buttonsContainer);

    return header;
  }

  /**
   * 切换行号显示
   */
  function toggleLineNumbers(pre) {
    const lineNumbers = pre.querySelectorAll('.line-number');
    const isHidden = pre.dataset.lineNumbersHidden === 'true';

    lineNumbers.forEach(num => {
      num.classList.toggle('hidden', !isHidden);
    });

    // 添加/移除 line-numbers-hidden 类用于样式控制
    pre.classList.toggle('line-numbers-hidden', !isHidden);

    pre.dataset.lineNumbersHidden = (!isHidden).toString();
  }

  /**
   * 切换折叠状态
   */
  function toggleFold(pre, btn) {
    const isFolded = pre.classList.toggle('folded');
    btn.classList.toggle('folded', isFolded);

    // 显示/隐藏折叠提示
    let hint = pre.querySelector('.code-fold-hint');
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'code-fold-hint';
      hint.textContent = '当前内容已折叠呐~';
      pre.appendChild(hint);
    }
    hint.style.display = isFolded ? 'block' : 'none';
  }

  /**
   * 复制代码
   */
  async function copyCode(code, btn) {
    try {
      // 获取纯文本代码（去除行号）
      const lines = code.querySelectorAll('.line');
      const text = Array.from(lines)
        .map(line => {
          // 克隆行内容，移除行号
          const clone = line.cloneNode(true);
          const num = clone.querySelector('.line-number');
          if (num) num.remove();
          return clone.textContent;
        })
        .join('\n');

      await navigator.clipboard.writeText(text);

      // 显示成功反馈
      btn.textContent = 'okkk';
      btn.classList.add('copied');

      setTimeout(() => {
        btn.textContent = 'copy';
        btn.classList.remove('copied');
      }, 1500);
    } catch (err) {
      console.error('复制失败:', err);
      btn.textContent = 'fail';
      setTimeout(() => {
        btn.textContent = 'copy';
      }, 1500);
    }
  }

  /**
   * 添加行号和行包装
   */
  function addLineNumbers(pre, code) {
    const lines = code.innerHTML.split('\n');
    
    // 移除最后一个空行（如果存在）
    if (lines.length > 0 && lines[lines.length - 1].trim() === '') {
      lines.pop();
    }
    
    const wrappedLines = lines.map((line, index) => {
      const lineNum = index + 1;
      return `<span class="line-number">${lineNum}</span><span class="line-content">${line}</span>`;
    });

    // 创建内容容器
    const contentDiv = document.createElement('div');
    contentDiv.className = 'code-content';

    // 重新构建代码，每行包装
    code.innerHTML = wrappedLines.map(line =>
      `<div class="line">${line}</div>`
    ).join('');

    contentDiv.appendChild(code.cloneNode(true));
    code.parentNode.replaceChild(contentDiv, code);

    // 将原始 code 移回 content 中
    const newContent = pre.querySelector('.code-content');
    const newCode = document.createElement('code');
    newCode.className = code.className;
    newCode.innerHTML = code.innerHTML;
    newContent.innerHTML = '';
    newContent.appendChild(newCode);

    return newCode;
  }

  /**
   * 处理单个代码块
   */
  function processCodeBlock(pre) {
    if (pre.dataset.processed === 'true') return;

    const code = pre.querySelector('code');
    if (!code) return;

    // 创建头部
    const header = createCodeHeader(pre, code);
    pre.insertBefore(header, pre.firstChild);

    // 添加行号
    addLineNumbers(pre, code);

    // 标记已处理
    pre.dataset.processed = 'true';
    pre.dataset.lineNumbersHidden = 'false';
  }

  /**
   * 初始化所有代码块
   */
  function initCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre[class*="language-"]');
    codeBlocks.forEach(processCodeBlock);
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeBlocks);
  } else {
    initCodeBlocks();
  }

  // 监听动态添加的代码块
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches && node.matches('pre[class*="language-"]')) {
            processCodeBlock(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('pre[class*="language-"]').forEach(processCodeBlock);
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
