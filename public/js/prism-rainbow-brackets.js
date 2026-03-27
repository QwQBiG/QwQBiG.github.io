/**
 * 彩虹括号功能 - VSCode 风格
 * 为代码块中的括号对添加彩虹颜色，并支持点击匹配
 */

(function() {
  'use strict';

  // 括号对映射
  const BRACKET_PAIRS = {
    '(': ')',
    '[': ']',
    '{': '}',
    ')': '(',
    ']': '[',
    '}': '{'
  };

  // 开括号
  const OPEN_BRACKETS = ['(', '[', '{'];
  // 闭括号
  const CLOSE_BRACKETS = [')', ']', '}'];

  /**
   * 检查字符是否是括号
   */
  function isBracket(char) {
    return BRACKET_PAIRS.hasOwnProperty(char);
  }

  /**
   * 检查是否是开括号
   */
  function isOpenBracket(char) {
    return OPEN_BRACKETS.includes(char);
  }

  /**
   * 检查是否是闭括号
   */
  function isCloseBracket(char) {
    return CLOSE_BRACKETS.includes(char);
  }

  /**
   * 获取括号在代码块中的索引位置
   * 返回一个数组，包含所有括号的详细信息
   */
  function getAllBracketsInfo(code) {
    const brackets = code.querySelectorAll('.rainbow-bracket');
    const bracketInfos = [];

    brackets.forEach((bracket, index) => {
      const char = bracket.dataset.bracket;
      bracketInfos.push({
        element: bracket,
        char: char,
        index: index,
        isOpen: isOpenBracket(char)
      });
    });

    return bracketInfos;
  }

  /**
   * 查找与指定括号匹配的另一半括号
   * 使用栈算法，时间复杂度 O(n)
   * @param {number} targetIndex - 目标括号在 bracketInfos 中的索引
   * @param {Array} bracketInfos - 所有括号的信息数组
   * @returns {Object|null} 匹配括号的详细信息，未找到返回 null
   */
  function findMatchingBracket(targetIndex, bracketInfos) {
    const target = bracketInfos[targetIndex];
    const targetChar = target.char;

    // 如果是开括号，向后查找匹配的闭括号
    if (target.isOpen) {
      const expectedClose = BRACKET_PAIRS[targetChar];
      let depth = 0;

      for (let i = targetIndex; i < bracketInfos.length; i++) {
        const current = bracketInfos[i];

        if (current.char === targetChar) {
          // 遇到同类型的开括号，深度+1
          depth++;
        } else if (current.char === expectedClose) {
          // 遇到匹配的闭括号，深度-1
          depth--;
          if (depth === 0) {
            // 找到匹配
            return current;
          }
        }
      }
    }
    // 如果是闭括号，向前查找匹配的开括号
    else {
      const expectedOpen = BRACKET_PAIRS[targetChar];
      let depth = 0;

      for (let i = targetIndex; i >= 0; i--) {
        const current = bracketInfos[i];

        if (current.char === targetChar) {
          // 遇到同类型的闭括号，深度+1
          depth++;
        } else if (current.char === expectedOpen) {
          // 遇到匹配的开括号，深度-1
          depth--;
          if (depth === 0) {
            // 找到匹配
            return current;
          }
        }
      }
    }

    return null;
  }

  /**
   * 清除所有括号的高亮状态
   */
  function clearAllHighlights(code) {
    const brackets = code.querySelectorAll('.rainbow-bracket');
    brackets.forEach(bracket => {
      bracket.classList.remove('bracket-match-highlight');
    });
  }

  /**
   * 处理括号点击事件
   */
  function handleBracketClick(event, code) {
    const clickedBracket = event.target.closest('.rainbow-bracket');
    if (!clickedBracket) return;

    // 阻止事件冒泡，避免触发行高亮
    event.stopPropagation();

    // 获取所有括号信息
    const bracketInfos = getAllBracketsInfo(code);

    // 找到被点击括号的索引
    const clickedIndex = bracketInfos.findIndex(
      info => info.element === clickedBracket
    );

    if (clickedIndex === -1) return;

    // 清除之前的高亮
    clearAllHighlights(code);

    // 查找匹配的括号
    const matchingInfo = findMatchingBracket(clickedIndex, bracketInfos);

    if (matchingInfo) {
      // 高亮当前括号和匹配的括号
      clickedBracket.classList.add('bracket-match-highlight');
      matchingInfo.element.classList.add('bracket-match-highlight');
    } else {
      // 未找到匹配，高亮当前括号表示未匹配状态
      clickedBracket.classList.add('bracket-match-highlight', 'bracket-unmatched');
    }
  }

  /**
   * 处理单个代码块，添加彩虹括号
   */
  function processRainbowBrackets(pre) {
    const code = pre.querySelector('code');
    if (!code) return;

    // 获取所有文本节点
    const walker = document.createTreeWalker(
      code,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    // 处理每个文本节点
    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      if (!text.split('').some(isBracket)) return;

      // 创建文档片段
      const fragment = document.createDocumentFragment();
      let currentText = '';

      for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (isBracket(char)) {
          // 先添加之前的文本
          if (currentText) {
            fragment.appendChild(document.createTextNode(currentText));
            currentText = '';
          }

          // 创建括号 span
          const span = document.createElement('span');
          span.textContent = char;
          span.className = 'rainbow-bracket';
          span.dataset.bracket = char;
          fragment.appendChild(span);
        } else {
          currentText += char;
        }
      }

      // 添加剩余的文本
      if (currentText) {
        fragment.appendChild(document.createTextNode(currentText));
      }

      // 替换原节点
      textNode.parentNode.replaceChild(fragment, textNode);
    });

    // 计算括号层级并添加颜色类
    calculateBracketLevels(code);

    // 添加点击事件监听
    code.addEventListener('click', (e) => handleBracketClick(e, code));
  }

  /**
   * 计算括号层级并应用颜色
   */
  function calculateBracketLevels(code) {
    const brackets = code.querySelectorAll('.rainbow-bracket');
    const stack = [];

    brackets.forEach(bracket => {
      const char = bracket.dataset.bracket;

      if (isOpenBracket(char)) {
        // 开括号 - 压入栈
        const level = stack.length % 6 + 1;
        stack.push({
          bracket: char,
          element: bracket,
          level: level
        });
        bracket.classList.add(`rainbow-bracket-level-${level}`);
      } else {
        // 闭括号 - 尝试匹配
        const matchingOpen = BRACKET_PAIRS[char];
        let matched = false;

        // 从栈顶开始查找匹配的开括号
        for (let i = stack.length - 1; i >= 0; i--) {
          if (stack[i].bracket === matchingOpen) {
            // 找到匹配
            const level = stack[i].level;
            bracket.classList.add(`rainbow-bracket-level-${level}`);

            // 移除匹配的开括号及其之间的所有括号
            stack.splice(i, 1);
            matched = true;
            break;
          }
        }

        // 未匹配的括号
        if (!matched) {
          bracket.classList.add('rainbow-bracket-unmatched');
        }
      }
    });

    // 标记未匹配的开括号
    stack.forEach(item => {
      item.element.classList.add('rainbow-bracket-unmatched');
    });
  }

  /**
   * 初始化所有代码块的彩虹括号
   */
  function initRainbowBrackets() {
    const codeBlocks = document.querySelectorAll('pre[class*="language-"]');
    codeBlocks.forEach(pre => {
      // 避免重复处理
      if (pre.dataset.rainbowProcessed === 'true') return;

      processRainbowBrackets(pre);
      pre.dataset.rainbowProcessed = 'true';
    });
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRainbowBrackets);
  } else {
    initRainbowBrackets();
  }

  // 监听动态添加的代码块
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches && node.matches('pre[class*="language-"]')) {
            shouldProcess = true;
          } else if (node.querySelectorAll) {
            const codeBlocks = node.querySelectorAll('pre[class*="language-"]');
            if (codeBlocks.length > 0) {
              shouldProcess = true;
            }
          }
        }
      });
    });

    if (shouldProcess) {
      setTimeout(initRainbowBrackets, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
