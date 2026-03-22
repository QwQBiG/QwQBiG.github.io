/**
 * 代码块功能集成 - 移植自 MyBlog 项目
 * 适配 Astro 框架的 pre.astro-code 结构
 */

// ========== 强制语法高亮修复 ==========
(function() {
  // Java/C++/Rust 关键字列表
  const keywords = [
    // Java 关键字
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
    'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
    'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
    'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new',
    'package', 'private', 'protected', 'public', 'return', 'short', 'static',
    'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
    'transient', 'try', 'void', 'volatile', 'while', 'true', 'false', 'null',
    // Java 常用类名
    'String', 'System', 'Object', 'Integer', 'Long', 'Double', 'Float', 'Boolean',
    'Character', 'Byte', 'Short', 'Math', 'Arrays', 'ArrayList', 'List', 'Map',
    'HashMap', 'Set', 'HashSet', 'Collection', 'Collections', 'Iterator',
    'Comparable', 'Comparator', 'Runnable', 'Thread', 'Exception', 'RuntimeException',
    'Scanner', 'BufferedReader', 'InputStreamReader', 'PrintWriter', 'StreamTokenizer',
    // Java 异常相关
    'Throwable', 'Error', 'IOException', 'FileNotFoundException', 'InterruptedException',
    'IllegalArgumentException', 'IllegalStateException', 'NullPointerException',
    'IndexOutOfBoundsException', 'ArrayIndexOutOfBoundsException', 'ClassCastException',
    'UnsupportedOperationException', 'NoSuchElementException', 'ConcurrentModificationException',
    'ArithmeticException', 'NumberFormatException', 'ParseException', 'SQLException',
    'ClassNotFoundException', 'InstantiationException', 'IllegalAccessException',
    'InvocationTargetException', 'NoSuchMethodException', 'NoSuchFieldException',
    // C++ 关键字
    'auto', 'bool', 'char8_t', 'char16_t', 'char32_t', 'concept', 'consteval',
    'constexpr', 'constinit', 'co_await', 'co_return', 'co_yield', 'decltype',
    'delete', 'explicit', 'export', 'extern', 'friend', 'inline', 'mutable',
    'namespace', 'noexcept', 'nullptr', 'operator', 'register', 'reinterpret_cast',
    'requires', 'sizeof', 'static_assert', 'static_cast', 'struct', 'template',
    'thread_local', 'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using',
    'virtual', 'wchar_t', 'override', 'final', 'const_cast', 'dynamic_cast',
    'explicit', 'mutable', 'volatile', 'signed', 'asm', 'alignas', 'alignof',
    // C++ 标准库常用类/函数
    'std', 'cout', 'cin', 'cerr', 'clog', 'endl', 'vector', 'string', 'map',
    'set', 'queue', 'stack', 'deque', 'priority_queue', 'pair', 'tuple',
    'make_pair', 'make_tuple', 'begin', 'end', 'push_back', 'pop_back',
    'push', 'pop', 'top', 'front', 'back', 'size', 'empty', 'clear',
    'insert', 'erase', 'find', 'count', 'sort', 'reverse', 'unique',
    'next_permutation', 'prev_permutation', 'lower_bound', 'upper_bound',
    'binary_search', 'min', 'max', 'swap', 'move', 'forward', 'make_unique',
    'make_shared', 'unique_ptr', 'shared_ptr', 'weak_ptr', 'optional',
    'variant', 'any', 'function', 'bind', 'lambda', 'constexpr', 'consteval',
    // Rust 关键字
    'as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn',
    'else', 'enum', 'extern', 'false', 'fn', 'for', 'if', 'impl', 'in',
    'let', 'loop', 'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return',
    'self', 'Self', 'static', 'struct', 'super', 'trait', 'true', 'type',
    'unsafe', 'use', 'where', 'while', 'yield', 'abstract', 'become', 'box',
    'do', 'final', 'macro', 'override', 'priv', 'typeof', 'unsized', 'virtual',
    // Rust 常用类型和宏
    'Option', 'Some', 'None', 'Result', 'Ok', 'Err', 'Vec', 'String', 'str',
    'Box', 'Rc', 'Arc', 'Cell', 'RefCell', 'Mutex', 'RwLock', 'HashMap',
    'BTreeMap', 'HashSet', 'BTreeSet', 'VecDeque', 'LinkedList', 'BinaryHeap',
    'println', 'print', 'format', 'panic', 'assert', 'assert_eq', 'assert_ne',
    'debug_assert', 'vec', 'todo', 'unimplemented', 'unreachable', 'drop',
    'Clone', 'Copy', 'Debug', 'Default', 'Eq', 'Hash', 'Ord', 'PartialEq',
    'PartialOrd', 'Send', 'Sync', 'Sized', 'Drop', 'Fn', 'FnMut', 'FnOnce',
    'From', 'Into', 'AsRef', 'AsMut', 'Deref', 'DerefMut', 'Iterator',
    'IntoIterator', 'FromIterator', 'Extend', 'ToString', 'ToOwned', 'Borrow',
    'BorrowMut', 'Cow', 'Range', 'RangeFrom', 'RangeFull', 'RangeInclusive',
    'RangeTo', 'RangeToInclusive', 'i8', 'i16', 'i32', 'i64', 'i128', 'isize',
    'u8', 'u16', 'u32', 'u64', 'u128', 'usize', 'f32', 'f64', 'char', 'bool'
  ];

  const forceHighlight = function() {
    const codeBlocks = document.querySelectorAll('.prose pre.astro-code');

    codeBlocks.forEach(block => {
      if (block.dataset.forceHighlight === 'true') return;

      const content = block.querySelector('.code-content');
      if (!content) return;

      const codeElement = content.querySelector('code');
      if (!codeElement) return;

      // 遍历所有行
      const lines = codeElement.querySelectorAll('.line');
      lines.forEach(line => {
        // 遍历行内所有 span
        const spans = line.querySelectorAll('span');
        spans.forEach(span => {
          const text = span.textContent.trim();
          // 如果是关键字且当前是普通文本颜色，强制改为关键字颜色
          if (keywords.includes(text) && span.style.color === 'rgb(248, 248, 242)') {
            span.style.color = '#e84a7a';
            span.style.fontWeight = '600';
          }
        });
      });

      block.dataset.forceHighlight = 'true';
    });
  };

  // 延迟执行，确保 Shiki 已经渲染完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(forceHighlight, 100);
      setTimeout(forceHighlight, 500);
      setTimeout(forceHighlight, 1000);
    }, false);
  } else {
    setTimeout(forceHighlight, 100);
    setTimeout(forceHighlight, 500);
    setTimeout(forceHighlight, 1000);
  }

  // 监听动态添加的代码块
  const highlightObserver = new MutationObserver(function() {
    setTimeout(forceHighlight, 100);
  });

  highlightObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.addEventListener('load', function() {
    setTimeout(forceHighlight, 500);
    setTimeout(forceHighlight, 1000);
  });
})();

// ========== 代码块结构初始化 ==========
(function() {
  const initializeCodeBlocks = function() {
    const codeBlocks = document.querySelectorAll('.prose pre.astro-code');

    codeBlocks.forEach(block => {
      // 如果已经初始化过，跳过
      if (block.dataset.initialized === 'true') return;

      const codeElement = block.querySelector('code');
      if (!codeElement) return;

      // 创建头部容器
      const header = document.createElement('div');
      header.className = 'code-header';

      // 创建左侧语言标签容器
      const langContainer = document.createElement('div');
      langContainer.className = 'code-lang-container';
      header.appendChild(langContainer);

      // 创建右侧按钮容器
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'code-header-buttons';
      header.appendChild(buttonsContainer);

      // 创建内容容器
      const content = document.createElement('div');
      content.className = 'code-content';

      // 将 code 元素移动到 content 中
      content.appendChild(codeElement);

      // 组装结构
      block.appendChild(header);
      block.appendChild(content);

      block.dataset.initialized = 'true';
    });
  };

  // 初始执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCodeBlocks, false);
  } else {
    initializeCodeBlocks();
  }

  // 监听动态添加的代码块
  const initObserver = new MutationObserver(function() {
    initializeCodeBlocks();
  });

  initObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.addEventListener('load', initializeCodeBlocks);
})();

// ========== 代码块行号添加功能 ==========
(function() {
  const addLineNumbers = function() {
    const codeBlocks = document.querySelectorAll('.prose pre.astro-code');

    codeBlocks.forEach(block => {
      // 如果已经处理过，跳过
      if (block.dataset.lineNumbersAdded === 'true') return;

      const content = block.querySelector('.code-content');
      if (!content) return;

      const codeElement = content.querySelector('code');
      if (!codeElement) return;

      const lines = codeElement.querySelectorAll('.line');
      if (lines.length === 0) return;

      // 为每一行添加行号
      lines.forEach((line, index) => {
        const lineNumber = document.createElement('span');
        lineNumber.className = 'line-number';
        lineNumber.textContent = (index + 1).toString();
        line.insertBefore(lineNumber, line.firstChild);
      });

      block.dataset.lineNumbersAdded = 'true';
    });
  };

  // 初始执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addLineNumbers, false);
  } else {
    addLineNumbers();
  }

  // 监听动态添加的代码块
  const lineNumberObserver = new MutationObserver(function() {
    addLineNumbers();
  });

  lineNumberObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.addEventListener('load', addLineNumbers);
})();

// ========== 代码块复制功能 ==========
(function() {
  const addCopyButtons = function() {
    const codeBlocks = document.querySelectorAll('.prose pre.astro-code');

    codeBlocks.forEach(block => {
      const buttonsContainer = block.querySelector('.code-header-buttons');
      if (!buttonsContainer) return;

      // 如果已经有复制按钮，跳过
      if (buttonsContainer.querySelector('.custom-copy-code')) return;

      // 创建复制按钮
      const button = document.createElement('button');
      button.className = 'custom-copy-code';
      button.textContent = 'copy';
      button.setAttribute('aria-label', '复制代码');
      button.title = '复制代码';

      // 点击事件
      button.addEventListener('click', function(e) {
        e.stopPropagation();

        const content = block.querySelector('.code-content');
        const codeElement = content ? content.querySelector('code') : null;
        let codeText = '';

        if (codeElement) {
          // 克隆并移除行号元素
          const clone = codeElement.cloneNode(true);
          const lineNumbers = clone.querySelectorAll('.line-number');
          lineNumbers.forEach(el => el.remove());
          codeText = clone.textContent;
        } else {
          codeText = block.textContent;
        }

        // 清理多余的空行和首尾空白
        codeText = codeText.replace(/\n\s*\n/g, '\n').trim();

        navigator.clipboard.writeText(codeText).then(function() {
          button.textContent = 'okkk';
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

      buttonsContainer.appendChild(button);
    });
  };

  // 初始执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCopyButtons, false);
  } else {
    addCopyButtons();
  }

  // 监听动态添加的代码块
  const copyObserver = new MutationObserver(function() {
    addCopyButtons();
  });

  copyObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.addEventListener('load', addCopyButtons);
})();

// ========== 代码块折叠功能 ==========
(function() {
  // 向上箭头 SVG
  const arrowUpSVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 14l5-5 5 5H7z"/></svg>`;

  // 检查代码块是否需要折叠（大于等于6行）
  const shouldEnableFold = function(block) {
    const lines = block.querySelectorAll('.line');
    if (lines.length >= 6) return true;

    const content = block.querySelector('.code-content');
    const codeElement = content ? content.querySelector('code') : null;
    if (codeElement) {
      const text = codeElement.textContent || '';
      const lineCount = text.split('\n').length;
      if (lineCount >= 6) return true;
    }

    return false;
  };

  const addFoldButtons = function() {
    const codeBlocks = document.querySelectorAll('.prose pre.astro-code');

    codeBlocks.forEach(block => {
      const buttonsContainer = block.querySelector('.code-header-buttons');
      if (!buttonsContainer) return;

      // 如果已经有折叠按钮，跳过
      if (buttonsContainer.querySelector('.code-fold-toggle')) return;

      // 检查是否需要折叠
      if (!shouldEnableFold(block)) return;

      // 创建折叠按钮
      const foldButton = document.createElement('button');
      foldButton.className = 'code-fold-toggle';
      foldButton.innerHTML = arrowUpSVG;
      foldButton.setAttribute('aria-label', 'fold code');
      foldButton.title = '点击折叠/展开代码';

      // 创建折叠提示文字
      const hint = document.createElement('div');
      hint.className = 'code-fold-hint';
      hint.textContent = '当前内容已折叠呐~';
      hint.style.display = 'none';

      // 折叠状态
      let isFolded = false;

      // 点击事件
      foldButton.addEventListener('click', function(e) {
        e.stopPropagation();
        isFolded = !isFolded;

        if (isFolded) {
          block.classList.add('code-folded');
          foldButton.classList.add('folded');
          hint.style.display = 'block';
          foldButton.setAttribute('aria-label', 'unfold code');
        } else {
          block.classList.remove('code-folded');
          foldButton.classList.remove('folded');
          hint.style.display = 'none';
          foldButton.setAttribute('aria-label', 'fold code');
        }
      });

      // 插入到复制按钮之前
      const copyBtn = buttonsContainer.querySelector('.custom-copy-code');
      if (copyBtn) {
        buttonsContainer.insertBefore(foldButton, copyBtn);
      } else {
        buttonsContainer.appendChild(foldButton);
      }
      block.appendChild(hint);
    });
  };

  // 初始执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addFoldButtons, false);
  } else {
    addFoldButtons();
  }

  // 监听动态添加的代码块
  const foldObserver = new MutationObserver(function() {
    addFoldButtons();
  });

  foldObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.addEventListener('load', addFoldButtons);
})();

// ========== 代码块语言标签（可点击切换行号） ==========
(function() {
  const addLanguageLabels = function() {
    const codeBlocks = document.querySelectorAll('.prose pre.astro-code');

    codeBlocks.forEach(block => {
      const langContainer = block.querySelector('.code-lang-container');
      if (!langContainer) return;

      // 如果已经有语言标签按钮，跳过
      if (langContainer.querySelector('.code-lang-btn')) return;

      // 尝试从 pre 元素的 data-language 属性获取语言
      let lang = block.getAttribute('data-language') || 'code';

      // 创建语言标签按钮
      const langBtn = document.createElement('button');
      langBtn.className = 'code-lang-btn';
      langBtn.textContent = lang.toUpperCase();
      langBtn.setAttribute('aria-label', 'Toggle line numbers');
      langBtn.title = '点击切换行号显示/隐藏';

      // 行号显示状态
      let showLineNumbers = true;

      // 点击事件 - 切换行号显示
      langBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showLineNumbers = !showLineNumbers;

        // 查找行号元素（只在当前代码块内查找）
        const lineNumbers = block.querySelectorAll('.line-number');

        lineNumbers.forEach(ln => {
          if (showLineNumbers) {
            ln.classList.remove('hidden');
          } else {
            ln.classList.add('hidden');
          }
        });

        // 更新按钮样式
        if (!showLineNumbers) {
          langBtn.classList.add('line-numbers-hidden');
        } else {
          langBtn.classList.remove('line-numbers-hidden');
        }
      });

      langContainer.appendChild(langBtn);
    });
  };

  // 初始执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addLanguageLabels, false);
  } else {
    addLanguageLabels();
  }

  // 监听动态添加的代码块
  const labelObserver = new MutationObserver(function() {
    addLanguageLabels();
  });

  labelObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.addEventListener('load', addLanguageLabels);
})();

// ========== 代码块键盘导航功能 ==========
(function() {
  let focusedCodeBlock = null;

  const initKeyboardNavigation = function() {
    const codeBlocks = document.querySelectorAll('.prose pre.astro-code');

    codeBlocks.forEach(block => {
      // 如果已经初始化过，跳过
      if (block.dataset.keyboardNav === 'true') return;

      const content = block.querySelector('.code-content');
      if (!content) return;

      // 使代码块可以聚焦
      block.setAttribute('tabindex', '0');
      block.style.outline = 'none';

      // 点击时聚焦
      block.addEventListener('click', function(e) {
        // 如果点击的是按钮，不聚焦
        if (e.target.closest('button')) return;

        focusedCodeBlock = block;
        block.focus();
        block.style.boxShadow = '0 0 0 2px rgba(232, 74, 122, 0.5)';
      });

      // 失去焦点时移除高亮
      block.addEventListener('blur', function() {
        if (focusedCodeBlock === block) {
          focusedCodeBlock = null;
        }
        block.style.boxShadow = '';
      });

      // 键盘事件 - 左右箭头控制水平滚动，上下箭头滚动页面
      block.addEventListener('keydown', function(e) {
        // 确保是当前聚焦的代码块
        if (focusedCodeBlock !== block) return;

        const scrollAmount = 30; // 水平滚动距离
        const pageScrollAmount = 50; // 页面滚动距离

        switch(e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            content.scrollLeft -= scrollAmount;
            break;
          case 'ArrowRight':
            e.preventDefault();
            content.scrollLeft += scrollAmount;
            break;
          case 'ArrowUp':
            e.preventDefault();
            e.stopPropagation();
            // 使用 document.documentElement 滚动，支持平滑滚动
            document.documentElement.scrollBy({
              top: -pageScrollAmount,
              behavior: 'smooth'
            });
            break;
          case 'ArrowDown':
            e.preventDefault();
            e.stopPropagation();
            // 使用 document.documentElement 滚动，支持平滑滚动
            document.documentElement.scrollBy({
              top: pageScrollAmount,
              behavior: 'smooth'
            });
            break;
        }
      });

      block.dataset.keyboardNav = 'true';
    });
  };

  // 初始执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKeyboardNavigation, false);
  } else {
    initKeyboardNavigation();
  }

  // 监听动态添加的代码块
  const keyboardObserver = new MutationObserver(function() {
    initKeyboardNavigation();
  });

  keyboardObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.addEventListener('load', initKeyboardNavigation);
})();
