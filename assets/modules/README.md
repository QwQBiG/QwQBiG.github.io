# 功能模块目录

本目录包含博客的所有自定义功能模块，采用模块化设计，便于维护和扩展。

## 模块列表

| 模块 | 说明 | 文件 |
|------|------|------|
| reading-progress | 阅读进度条 | css/reading-progress.css<br>js/reading-progress.js |
| back-to-top | 返回顶部按钮 | css/back-to-top.css |
| neko-piano | 猫咪钢琴 | css/neko-piano.css<br>js/neko-piano.js<br>html/neko-piano.html |
| pagination | 分页样式 | css/pagination.css<br>js/pagination.js |
| disable-theme-scroll | 禁用主题滚动 | js/disable-theme-scroll.js |

## 目录结构

```
modules/
├── css/              # 模块样式
│   ├── back-to-top.css
│   ├── neko-piano.css
│   ├── pagination.css
│   └── reading-progress.css
├── html/             # 模块 HTML 模板
│   └── neko-piano.html
├── js/               # 模块脚本
│   ├── disable-theme-scroll.js
│   ├── neko-piano.js
│   ├── pagination.js
│   └── reading-progress.js
└── README.md         # 本文件
```

## 添加新模块

1. 创建模块文件
   - CSS: `css/module-name.css`
   - JS: `js/module-name.js` (可选)
   - HTML: `html/module-name.html` (可选)

2. 注册模块
   编辑 `layouts/partials/extend_footer.html`，添加：
   ```html
   {{- readFile (printf "%s%s" $cssPath "module-name.css") | safeCSS -}}
   {{- readFile (printf "%s%s" $jsPath "module-name.js") | safeJS -}}
   ```

3. 更新本文档

## 命名规范

- 文件名使用小写
- 多单词使用连字符 `-` 连接
- 保持文件名与模块名一致

## 兼容性要求

- CSS: 支持主流浏览器
- JS: 使用 ES5 语法确保兼容性
- 避免使用实验性特性
