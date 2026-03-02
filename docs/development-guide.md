# 开发规范

## 文件组织规范

### 目录命名

- 使用小写字母
- 多单词使用连字符 `-` 连接
- 保持语义清晰

### 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| CSS | 小写，连字符 | `reading-progress.css` |
| JS | 小写，连字符 | `site-features.js` |
| 布局 | 小写，下划线 | `extend_footer.html` |
| 内容 | 大驼峰或中文 | `HelloWorld.md` |

## CSS 编写规范

### 结构

```css
/*——————————————————————————————————————————————
                区块说明
——————————————————————————————————————————————*/
.selector {
    property: value !important;
}

/* 深色模式 */
body.dark .selector {
    property: value !important;
}

/* 自动模式 */
@media (prefers-color-scheme: dark) {
    html[data-theme="auto"] .selector {
        property: value !important;
    }
}
```

### 颜色变量

- 浅色主色: `#e84a7a` (粉红)
- 深色主色: `#bd93f9` (紫罗兰)
- 浅色文字: `#2d3436`
- 深色文字: `#dee2e6`

## JavaScript 编写规范

### 兼容性

- 使用 ES5 语法确保兼容性
- 使用 `var` 而非 `let/const`
- 避免使用箭头函数

### 示例

```javascript
(function() {
  'use strict';
  
  function init() {
    // 代码逻辑
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

## 内容编写规范

### Front Matter

```yaml
---
title: "文章标题"
date: 2024-01-01T00:00:00+08:00
draft: false
tags: ["标签1", "标签2"]
categories: ["分类"]
description: "文章描述"
---
```

### 文章结构

1. 标题使用 H1
2. 章节使用 H2
3. 小节使用 H3
4. 代码块标注语言

## Git 提交规范

### 提交信息格式

```
<type>: <subject>

<body>
```

### 类型

- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 样式
- `refactor`: 重构
- `chore`: 构建/工具

## 模块开发规范

### 新模块目录结构

```
assets/modules/
└── module-name/
    ├── css/
    │   └── module-name.css
    ├── js/
    │   └── module-name.js
    └── html/
        └── module-name.html
```

### 模块注册

在 `layouts/partials/extend_footer.html` 中添加：

```html
{{- readFile (printf "%s%s" $cssPath "module-name.css") | safeCSS -}}
{{- readFile (printf "%s%s" $jsPath "module-name.js") | safeJS -}}
```
