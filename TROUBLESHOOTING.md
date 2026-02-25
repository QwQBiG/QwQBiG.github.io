# 经典问题排查记录

## 问题 1：CSS 组件"固定在页面上"而不是"固定在屏幕上"

### 问题描述
用户反馈：阅读进度条、返回顶部按钮、猫咪钢琴等 CSS 组件"固定在了页面上"，而不是跟随页面滚动或固定在屏幕视口上。

### 根本原因
**CSS Transform 创建新的包含块（Containing Block）**

页面过渡动画的 CSS 中使用了 `transform` 属性：

```css
.page-container {
  transform-origin: center center;
  will-change: transform, opacity;
}

@keyframes pageExit {
  0% { transform: scale(1) translateZ(0); }
  ...
}
```

当 `transform` 属性应用于一个元素时，它会创建一个新的**包含块（containing block）**。这会导致所有 `position: fixed` 的子元素相对于这个包含块定位，而不是相对于视口（viewport）定位！

### 为什么这会影响 `position: fixed`？

根据 CSS 规范：
- 正常情况下，`position: fixed` 元素相对于视口定位
- 但如果父元素有 `transform`、`perspective`、`filter` 等属性，fixed 元素会相对于最近的包含块定位
- 这就导致了"固定在页面上"而不是"固定在屏幕上"的现象

### 解决方案

**将动画类从 `body` 移到 `main` 元素**

修改前：
```javascript
// 错误：应用到 body 会影响所有 fixed 子元素
document.body.classList.add('page-container');
document.body.classList.add('page-exit');
document.body.classList.add('page-enter');
```

修改后：
```javascript
// 正确：只应用到 main 元素，保留 body 的视口定位上下文
const mainElement = document.querySelector('main') || document.body;
mainElement.classList.add('page-container');
mainElement.classList.add('page-exit');
mainElement.classList.add('page-enter');
```

### 影响文件

1. `layouts/partials/page-transitions-js.html` - JavaScript 动画控制
2. `assets/css/page-transitions.css` - CSS 动画样式

### 关键代码变更

**JavaScript 变更：**
```javascript
// 获取 main 元素进行动画（而不是 body）
const mainElement = document.querySelector('main') || document.body;

// 将动画类应用到 main 元素
mainElement.classList.add('page-container');
mainElement.classList.add('page-exit');  // 或 'page-enter'
```

**CSS 变更：**
```css
/* 应用到 main 元素，不影响 fixed 子元素 */
.page-container {
  position: relative;
  width: 100%;
  min-height: calc(100vh - var(--header-height, 60px));
  /* transform 只在动画期间应用，不默认应用 */
}
```

### 经验总结

1. **`transform` 会创建包含块** - 使用时要小心对 `position: fixed` 子元素的影响
2. **动画应该作用于内容容器** - 而不是整个 body，避免破坏全局定位上下文
3. **fixed 定位的陷阱** - 任何父元素的 `transform`、`filter`、`perspective` 都会影响 fixed 元素的定位参考

### 相关资源

- [MDN: Containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block)
- [CSS Spec: Transform Rendering Model](https://www.w3.org/TR/css-transforms-1/#transform-rendering)
