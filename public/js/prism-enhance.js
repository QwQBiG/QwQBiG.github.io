/**
 * Prism.js 语法高亮增强
 * 为访问控制关键字、修饰符等添加更细粒度的 token 类
 * 适用于 Astro 内置的 Prism 高亮输出
 */

(function() {
  'use strict';

  // ==================== 关键字分类 ====================

  // 访问控制关键字
  const ACCESS_KEYWORDS = ['public', 'private', 'protected', 'internal'];

  // 静态/实例修饰符
  const MODIFIER_KEYWORDS = ['static', 'readonly', 'const', 'final', 'abstract', 'virtual', 'override', 'sealed', 'volatile', 'transient', 'synchronized', 'native', 'strictfp', 'inline', 'explicit', 'implicit', 'extern', 'mutable'];

  // 异步相关
  const ASYNC_KEYWORDS = ['async', 'await', 'yield', 'Task', 'Promise', 'Future'];

  // 声明关键字
  const DECLARATION_KEYWORDS = ['var', 'let', 'const', 'function', 'class', 'interface', 'enum', 'struct', 'fn', 'def', 'type', 'impl', 'mod', 'pub', 'crate', 'use', 'namespace', 'template', 'typename', 'concept', 'requires'];

  // 模块/导入导出关键字
  const MODULE_KEYWORDS = ['import', 'export', 'from', 'module', 'require', 'package', 'include', 'using', 'extern', 'crate', 'mod', 'use', 'as'];

  // 控制流关键字
  const CONTROL_KEYWORDS = ['if', 'else', 'switch', 'case', 'default', 'break', 'continue', 'for', 'while', 'do', 'loop', 'match', 'goto', 'return'];

  // 异常处理关键字
  const EXCEPTION_KEYWORDS = ['try', 'catch', 'finally', 'throw', 'throws', 'except', 'raise', 'panic', 'unwrap', 'expect'];

  // 类型相关关键字
  const TYPE_KEYWORDS = ['typeof', 'instanceof', 'in', 'of', 'as', 'is', 'new', 'this', 'super', 'self', 'Self', 'where', 'dyn', 'impl'];

  // 布尔值和空值
  const BOOLEAN_KEYWORDS = ['true', 'false'];
  const NULL_KEYWORDS = ['null', 'undefined', 'nil', 'None', 'Option', 'Result'];

  // Rust 特定关键字
  const RUST_KEYWORDS = ['mut', 'ref', 'box', 'move', 'unsafe', 'trait', 'impl', 'dyn', 'macro', 'derive'];

  // C++ 特定关键字
  const CPP_KEYWORDS = ['auto', 'decltype', 'constexpr', 'consteval', 'constinit', 'co_await', 'co_return', 'co_yield', 'friend', 'decltype', 'noexcept', 'static_cast', 'dynamic_cast', 'reinterpret_cast', 'const_cast'];

  // Java 特定关键字
  const JAVA_KEYWORDS = ['extends', 'implements', 'instanceof', 'strictfp', 'assert', 'native', 'transient', 'volatile', 'synchronized', 'finally'];

  // Python 特定关键字
  const PYTHON_KEYWORDS = ['lambda', 'with', 'pass', 'assert', 'del', 'global', 'nonlocal', 'raise', 'except', 'finally', 'from', 'import', 'as', 'in', 'is', 'not', 'or', 'and'];

  // 运算符符号 (需要特殊处理)
  const ARROW_OPERATORS = ['=>', '->', '<-', '::', '::'];

  // ==================== 处理函数 ====================

  /**
   * 增强代码块的语法高亮
   */
  function enhanceSyntaxHighlighting() {
    // 查找所有代码块
    const codeBlocks = document.querySelectorAll('pre[class*="language-"] code, pre code');

    codeBlocks.forEach(code => {
      // 处理关键字
      enhanceKeywords(code);
      // 处理运算符
      enhanceOperators(code);
      // 处理标识符
      enhanceIdentifiers(code);
    });
  }

  /**
   * 增强关键字处理
   */
  function enhanceKeywords(code) {
    // 查找所有 keyword token
    const keywords = code.querySelectorAll('.token.keyword');

    keywords.forEach(el => {
      const text = el.textContent.trim();

      // 访问控制关键字
      if (ACCESS_KEYWORDS.includes(text)) {
        el.classList.add('access');
      }
      // 修饰符关键字
      else if (MODIFIER_KEYWORDS.includes(text)) {
        el.classList.add('modifier');
      }
      // 异步关键字
      else if (ASYNC_KEYWORDS.includes(text)) {
        el.classList.add('async');
      }
      // 声明关键字
      else if (DECLARATION_KEYWORDS.includes(text)) {
        el.classList.add('declaration');
      }
      // 模块关键字
      else if (MODULE_KEYWORDS.includes(text)) {
        el.classList.add('module');
      }
      // 控制流关键字
      else if (CONTROL_KEYWORDS.includes(text)) {
        el.classList.add('control');
      }
      // 异常处理关键字
      else if (EXCEPTION_KEYWORDS.includes(text)) {
        el.classList.add('exception');
      }
      // 类型关键字
      else if (TYPE_KEYWORDS.includes(text)) {
        el.classList.add('type-check');
      }
      // Rust 特定
      else if (RUST_KEYWORDS.includes(text)) {
        el.classList.add('rust-specific');
      }
      // C++ 特定
      else if (CPP_KEYWORDS.includes(text)) {
        el.classList.add('cpp-specific');
      }
      // Java 特定
      else if (JAVA_KEYWORDS.includes(text)) {
        el.classList.add('java-specific');
      }
      // Python 特定
      else if (PYTHON_KEYWORDS.includes(text)) {
        el.classList.add('python-specific');
      }
    });
  }

  /**
   * 增强运算符处理
   */
  function enhanceOperators(code) {
    // 查找所有 operator token
    const operators = code.querySelectorAll('.token.operator');

    operators.forEach(el => {
      const text = el.textContent.trim();

      // 箭头运算符
      if (ARROW_OPERATORS.includes(text)) {
        el.classList.add('arrow');
      }
      // 根据内容判断类型
      else if (['+', '-', '*', '/', '%'].includes(text)) {
        el.classList.add('arithmetic');
      }
      else if (['==', '!=', '<', '>', '<=', '>=', '===', '!=='].includes(text)) {
        el.classList.add('comparison');
      }
      else if (['&&', '||', '!'].includes(text)) {
        el.classList.add('logical');
      }
      else if (['&', '|', '^', '~', '<<', '>>', '>>>'].includes(text)) {
        el.classList.add('bitwise');
      }
      else if (text === '=' || text.endsWith('=')) {
        el.classList.add('assignment');
      }
    });
  }

  /**
   * 增强标识符处理 (函数名、类型名等)
   */
  function enhanceIdentifiers(code) {
    // 处理函数调用
    const functions = code.querySelectorAll('.token.function');
    functions.forEach(el => {
      const text = el.textContent.trim();

      // 构造函数
      if (/^[A-Z]/.test(text)) {
        el.classList.add('constructor');
      }
      // 方法调用判断 (后面跟着括号的)
      else {
        el.classList.add('call');
      }
    });

    // 处理类型/类名
    const classNames = code.querySelectorAll('.token.class-name');
    classNames.forEach(el => {
      const text = el.textContent.trim();

      // Rust 的 Result, Option 等
      if (['Result', 'Option', 'Vec', 'String', 'Box', 'Rc', 'Arc', 'RefCell'].includes(text)) {
        el.classList.add('rust-generic');
      }
      // C++ 标准库类型
      else if (['std', 'vector', 'string', 'map', 'set', 'unique_ptr', 'shared_ptr'].includes(text)) {
        el.classList.add('cpp-std');
      }
      // Java 标准库类型
      else if (['System', 'String', 'Integer', 'Object', 'Class'].includes(text)) {
        el.classList.add('java-std');
      }
    });

    // 处理布尔值
    const booleans = code.querySelectorAll('.token.boolean');
    booleans.forEach(el => {
      el.classList.add('boolean-value');
    });

    // 处理 null
    const nulls = code.querySelectorAll('.token.null');
    nulls.forEach(el => {
      el.classList.add('null-value');
    });
  }

  /**
   * 使用 MutationObserver 监听 DOM 变化
   */
  function initObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldProcess = false;

      mutations.forEach((mutation) => {
        // 检查新增的节点
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 如果是代码块
            if (node.matches && (node.matches('pre[class*="language-"]') || node.matches('code'))) {
              shouldProcess = true;
            }
            // 或者包含代码块
            else if (node.querySelectorAll) {
              const codeBlocks = node.querySelectorAll('pre[class*="language-"], pre code');
              if (codeBlocks.length > 0) {
                shouldProcess = true;
              }
            }
          }
        });

        // 检查属性变化（比如 class 变化）
        if (mutation.type === 'attributes' && mutation.target.matches && mutation.target.matches('code')) {
          shouldProcess = true;
        }
      });

      if (shouldProcess) {
        // 延迟执行，确保高亮已完成
        setTimeout(enhanceSyntaxHighlighting, 50);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  // 初始化
  function init() {
    // 初始处理
    enhanceSyntaxHighlighting();

    // 监听 DOM 变化
    initObserver();

    // 定期检查（处理可能的异步加载）
    let checkCount = 0;
    const checkInterval = setInterval(() => {
      enhanceSyntaxHighlighting();
      checkCount++;
      if (checkCount > 20) { // 10秒后停止检查
        clearInterval(checkInterval);
      }
    }, 500);
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // 延迟执行，确保其他脚本已完成
    setTimeout(init, 100);
  }

})();
