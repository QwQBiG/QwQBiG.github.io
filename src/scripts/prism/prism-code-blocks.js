/**
 * Prism.js 代码块功能集成
 * 功能：复制、折叠、语言标签、行号控制
 */

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
function createCodeHeader(pre, lineCount, readSource) {
  const header = document.createElement('div');
  header.className = 'code-header';
  header.lang = 'en';

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
  langBtn.title = 'Toggle line numbers';
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
  searchBtn.title = 'Find in code (Ctrl/Cmd+Shift+F)';
  searchBtn.addEventListener('click', () => openCodeSearch(pre));
  buttonsContainer.appendChild(searchBtn);

  // 折叠按钮（代码超过 15 行才显示）
  if (lineCount > 15) {
    const foldBtn = document.createElement('button');
    foldBtn.className = 'code-fold-toggle';
    foldBtn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
      </svg>
    `;
    foldBtn.title = 'Collapse code';
    foldBtn.addEventListener('click', () => toggleFold(pre, foldBtn));
    buttonsContainer.appendChild(foldBtn);
  }

  // 复制按钮
  const copyBtn = document.createElement('button');
  copyBtn.className = 'custom-copy-code';
  copyBtn.textContent = 'Copy';
  copyBtn.addEventListener('click', () => copyCode(readSource(), copyBtn));
  buttonsContainer.appendChild(copyBtn);

  header.appendChild(buttonsContainer);

  return header;
}

/**
 * 切换行号显示
 */
function toggleLineNumbers(pre) {
  const hidden = pre.classList.toggle('line-numbers-hidden');
  pre.dataset.lineNumbersHidden = String(hidden);
}

/**
 * 切换折叠状态
 */
function toggleFold(pre, btn) {
  const isFolded = pre.classList.toggle('folded');
  btn.classList.toggle('folded', isFolded);
  btn.title = isFolded ? 'Expand code' : 'Collapse code';

  // 显示/隐藏折叠提示
  let hint = pre.querySelector('.code-fold-hint');
  if (!hint) {
    hint = document.createElement('div');
    hint.className = 'code-fold-hint';
    hint.lang = 'en';
    hint.textContent = 'Code collapsed';
    pre.appendChild(hint);
  }
  hint.style.display = isFolded ? 'block' : 'none';
}

/**
 * 复制代码
 */
async function copyCode(sourceText, btn) {
  try {
    await navigator.clipboard.writeText(sourceText);

    // 显示成功反馈
    btn.textContent = 'Copied';
    btn.classList.add('copied');

    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 1500);
  } catch (err) {
    console.error('复制失败:', err);
    btn.textContent = 'Copy failed';
    setTimeout(() => {
      btn.textContent = 'Copy';
    }, 1500);
  }
}

// Return one array of DOM nodes per source line. The common single-line
// token moves intact; only tokens spanning a newline need a shell on each line.
export function splitCodeLines(parent) {
  const lines = [[]];
  let line = lines[0];
  for (const child of Array.from(parent.childNodes)) {
    const text = child.textContent;
    if (!text.includes('\n') || (child.nodeType !== 1 && child.nodeType !== 3)) {
      line.push(child);
      continue;
    }

    let pieces;
    if (child.nodeType === 3) {
      pieces = text.split('\n').map(part => part ? child.ownerDocument.createTextNode(part) : null);
    } else {
      let first = true;
      pieces = splitCodeLines(child).map(children => {
        if (!children.length) return null;
        const token = child.cloneNode(false);
        if (!first) token.removeAttribute('id');
        first = false;
        for (const node of children) token.appendChild(node);
        return token;
      });
    }

    for (let i = 0; i < pieces.length; i++) {
      if (i > 0) {
        line = [];
        lines.push(line);
      }
      if (pieces[i]) line.push(pieces[i]);
    }
  }
  return lines;
}

// Raw code is readable at its final dimensions. Nearby blocks gain individual
// rows for line numbers and pointer interactions without changing their text.
export function prepareCodeLines(code) {
  if (!code.hasAttribute('data-code-lines') || code.hasAttribute('data-lines-ready')) return;
  const lines = splitCodeLines(code);
  const rows = document.createDocumentFragment();
  lines.forEach((nodes, index) => {
    const hasNewline = index < lines.length - 1;
    // A terminal LF ends the preceding row. A whitespace-only final row is visible.
    if (!hasNewline && nodes.every(node => !node.textContent)) return;
    const row = document.createElement('span');
    row.className = 'line';
    const value = document.createElement('span');
    value.className = 'line-content';
    for (const node of nodes) value.appendChild(node);
    if (hasNewline) value.append('\n');
    row.appendChild(value);
    rows.appendChild(row);
  });
  code.replaceChildren(rows);
  code.setAttribute('data-lines-ready', '');
  bindLineInteractions(code);
}

function bindLineInteractions(code) {
  let highlightedLine = null;
  function updateHover(event) {
    const line = event.target.closest('.line');
    if (!line || (event.relatedTarget instanceof Node && line.contains(event.relatedTarget))) return;
    line.classList.toggle('line-current', event.type === 'mouseover');
  }
  code.addEventListener('mouseover', updateHover);
  code.addEventListener('mouseout', updateHover);

  code.addEventListener('click', (event) => {
    const line = event.target.closest('.line');
    if (!line) return;
    const previousLine = highlightedLine;
    previousLine?.classList.remove('line-highlight');
    highlightedLine = line === previousLine ? null : line;
    highlightedLine?.classList.add('line-highlight');
  });
}

/**
 * 处理单个代码块
 */
export function prepareCodeBlock(pre) {
  if (document.body.dataset.pageCode !== 'true') return null;

  // 跳过 Mermaid 图表代码块
  const langClass = Array.from(pre.classList).find(c => c.startsWith('language-'));
  if (langClass) {
    const lang = langClass.replace('language-', '').toLowerCase();
    if (lang === 'mermaid') return null;
  }

  const code = pre.querySelector('code');
  if (!code || pre.dataset.processed === 'true') return code;

  let readSource = () => code.textContent;
  if (!code.hasAttribute('data-code-lines')) {
    // Custom blocks arrive without a scroll container or a build-time line count.
    const sourceText = code.textContent;
    readSource = () => sourceText;
    code.dataset.codeLines = String(sourceText.split('\n').length);
    if (!code.parentElement.classList.contains('code-content')) {
      const content = document.createElement('div');
      content.className = 'code-content';
      code.replaceWith(content);
      content.appendChild(code);
    }
    prepareCodeLines(code);
  }
  const header = createCodeHeader(pre, Number(code.dataset.codeLines), readSource);
  pre.insertBefore(header, pre.firstChild);

  // 标记已处理
  pre.dataset.processed = 'true';
  pre.dataset.lineNumbersHidden = 'false';
  return code;
}
