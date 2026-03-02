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

## 问题 2：Hugo 自定义模板未被应用

### 问题描述
用户反馈：为随吐集诗歌集合页面创建了自定义的 `list.html` 模板，包含网格布局和特殊样式，但页面始终显示默认样式，自定义模板未被应用。

### 根本原因
**1. `type` 参数影响模板查找优先级**

随吐集的 `_index.md` 文件中设置了 `type: series`：

```yaml
---
title: "《随吐集》"
description: "随吐随吐，恣意吐出，不拾牙慧。"
type: series
---
```

根据 Hugo 的模板查找规则，当页面有 `type` 设置时，Hugo 会优先查找与 `type` 对应的模板（如 `layouts/series/list.html`），而不是使用基于 section 路径的模板层次结构（如 `layouts/poetry/posts/suitu/list.html`）。

**2. 目录名称大小写不匹配**

内容文件目录名为大写的 `SuiTu`，但 Hugo 生成的 URL 是小写的 `suitu`。Hugo 的模板查找是基于 URL 路径的，因此需要创建小写的目录才能匹配。

### 解决方案

**1. 移除 `type` 参数**

删除 `_index.md` 中的 `type: series` 设置，让随吐集使用诗歌 section 的模板层次结构：

```yaml
---
title: "《随吐集》"
description: "随吐随吐，恣意吐出，不拾牙慧。"
cascade:
  sort_by: "Weight"
---
```

**2. 创建小写的模板目录**

创建 `layouts/poetry/posts/suitu/` 目录（小写），在其中创建 `list.html` 文件：

```
layouts/
└── poetry/
    └── posts/
        └── suitu/          # 小写目录名
            └── list.html    # 自定义模板
```

**3. 修复模板语法错误**

原模板中存在语法错误，需要修复：

```hugo
{{- $allPoetryPages := where .Site.RegularPages "Section" "poetry" -}}
{{- $allPoetryPages := where $allPoetryPages "Params.type" "ne" "series" -}}
{{- $allPoetryPages := where $allPoetryPages "RelPermalink" "contains" "/poetry/posts/suitu/" -}}
```

问题：`where` 函数不支持 `contains` 操作符

修复：直接使用 `.RegularPages` 获取当前 section 的页面

```hugo
{{- $allPoetryPages := .RegularPages -}}
{{- $allPoetryPages := where $allPoetryPages "Params.type" "ne" "series" -}}
{{- $allPoetryPages := $allPoetryPages.ByParam "Weight" -}}
{{- $paginator := .Paginate $allPoetryPages -}}
```

另一个语法错误：

```hugo
{{- range first 3 .Params.tags -}}
```

问题：当 `.Params.tags` 不存在或为空时会报错

修复：添加条件检查

```hugo
{{- if .Params.tags -}}
{{- range first 3 .Params.tags -}}
<span class="tag">{{ . }}</span>
{{- end -}}
{{- end -}}
```

### 影响文件

1. `content/poetry/posts/SuiTu/_index.md` - 移除 `type: series` 参数
2. `layouts/poetry/posts/suitu/list.html` - 创建自定义模板（新建）

### 关键代码变更

**_index.md 变更：**
```yaml
---
title: "《随吐集》"
description: "随吐随吐，恣意吐出，不拾牙慧。"
# 删除了 type: series
cascade:
  sort_by: "Weight"
---
```

**list.html 模板结构：**
```hugo
{{ define "main" }}

<style>
/* 随吐集诗歌列表样式 */
.suitu-poetry-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}
/* ... 其他样式 ... */
</style>

<div class="suitu-section-header">
    <h1><span class="emoji">📜</span> {{ .Title }}</h1>
    <p>{{ .Description }}</p>
</div>

<div class="suitu-poetry-list">
    <ul>
        {{- $allPoetryPages := .RegularPages -}}
        {{- $allPoetryPages := where $allPoetryPages "Params.type" "ne" "series" -}}
        {{- $allPoetryPages := $allPoetryPages.ByParam "Weight" -}}
        {{- $paginator := .Paginate $allPoetryPages -}}

        {{- range $paginator.Pages -}}
        <li>
            <a href="{{ .Permalink }}">
                <div class="poetry-title">{{ .Title }}</div>
                {{- if (ne .Params.hideSummary true) -}}
                <div class="poetry-summary">{{ .Summary | plainify | htmlUnescape }}</div>
                {{- end -}}
                <div class="poetry-meta">
                    {{- if .Date -}}
                    <span>📅 {{ .Date.Format "2006-01-02" }}</span>
                    {{- end -}}
                    {{- if .Params.tags -}}
                    {{- range first 3 .Params.tags -}}
                    <span class="tag">{{ . }}</span>
                    {{- end -}}
                    {{- end -}}
                </div>
            </a>
        </li>
        {{- end -}}
    </ul>

    {{- template "_internal/pagination.html" . -}}
</div>

{{ end }}
```

### 经验总结

1. **`type` 参数会改变模板查找优先级** - 如果不需要特殊的类型处理，尽量避免使用 `type` 参数
2. **Hugo URL 默认小写** - 模板目录名应该与生成的 URL 路径匹配（小写）
3. **`where` 函数的语法限制** - 不支持 `contains` 等复杂操作符，需要使用其他方法筛选
4. **模板中的条件检查很重要** - 使用 `first`、`where` 等函数时，要确保数据存在且不为空
5. **调试模板问题** - 检查生成的 HTML 文件（如 `public/poetry/posts/suitu/index.html`）可以确认模板是否被正确应用

### 相关资源

- [Hugo Template Lookup Order](https://gohugo.io/templates/lookup-order/)
- [Hugo where Function](https://gohugo.io/functions/where/)
- [Hugo Type Parameter](https://gohugo.io/content-management/types/)

## 问题 3：Hugo 模板中多次调用 .Paginate 方法导致的问题

### 问题描述
问题：诗歌页面的列表不显示，合集只在第一页显示的功能导致了冲突，页面无法正常渲染。

### 根本原因
**Hugo 模板中 .Paginate 方法的调用限制**

在 Hugo 模板中，每个页面模板只能调用一次 `.Paginate` 方法。如果在同一个模板中多次调用 `.Paginate` 方法，会导致 Hugo 无法正确处理分页，从而导致页面渲染失败或内容不显示。

原模板中的问题代码：

```hugo
<!-- 诗歌系列区域 - 只在第一页显示 -->
{{- if eq .Paginator.PageNumber 1 -}}  <!-- 第一次使用 .Paginator -->
...
{{- end -}}

<!-- 诗歌列表 -->
<div class="poetry-list-section">
    ...
    {{- $paginator := .Paginate $poetryPages -}}  <!-- 第二次调用 .Paginate -->
    ...
</div>
```

### 解决方案

**将 .Paginate 方法的调用移到模板的早期**

修改模板结构，将 `.Paginate` 方法的调用移到模板的早期，然后使用 `$paginator` 变量来访问分页信息：

```hugo
<!-- 先调用 .Paginate 方法 -->
{{- $allPages := .Site.RegularPages -}}
{{- $poetryPages := where $allPages "Params.categories" "intersect" (slice "诗歌") -}}
{{- $poetryPages := where $poetryPages "Params.pin" "ne" true -}}
{{- $paginator := .Paginate $poetryPages -}}

<!-- 然后使用 $paginator 变量 -->
<!-- 诗歌系列区域 - 只在第一页显示 -->
{{- if eq $paginator.PageNumber 1 -}}
...
{{- end -}}

<!-- 诗歌列表 -->
<div class="poetry-list-section">
    ...
    {{- range $paginator.Pages -}}
    ...
    {{- end -}}
</div>
```

### 影响文件

1. `layouts/poetry/list.html` - 诗歌页面的主模板

### 关键代码变更

**修改前：**
```hugo
<!-- 诗歌系列区域 - 只在第一页显示 -->
{{- if eq .Paginator.PageNumber 1 -}}
{{- $allPages := .Site.RegularPages -}}
{{- $allPages := where $allPages "Layout" "ne" "search" -}}
{{- $allPages := where $allPages "Layout" "ne" "archives" -}}
{{- $allPages := where $allPages "Params.hidden" "ne" true -}}
{{- $pinnedPages := where $allPages "Params.pin" true -}}
{{- $pinnedPages := where $pinnedPages "Section" "poetry" -}}

{{- if or $pinnedPages (where .Site.Pages "Title" "《随吐集》") -}}
<div class="poetry-series-section">
    <h2 class="section-title">诗歌系列</h2>
    <div class="series-grid">
    {{- range $pinnedPages -}}
        {{- partial "components/cards/series-overview.html" . -}}
    {{- end -}}
    ...
    </div>
</div>
{{- end -}}
{{- end -}}

<!-- 诗歌列表 -->
<div class="poetry-list-section">
    <h2 class="section-title">诗歌</h2>
    <div class="posts-list">
        {{- $allPages := .Site.RegularPages -}}
        {{- $poetryPages := where $allPages "Params.categories" "intersect" (slice "诗歌") -}}
        {{- $poetryPages := where $poetryPages "Params.pin" "ne" true -}}
        {{- $paginator := .Paginate $poetryPages -}}

        {{- range $paginator.Pages -}}
        ...
        {{- end -}}
    </div>
</div>
```

**修改后：**
```hugo
{{- $allPages := .Site.RegularPages -}}
{{- $poetryPages := where $allPages "Params.categories" "intersect" (slice "诗歌") -}}
{{- $poetryPages := where $poetryPages "Params.pin" "ne" true -}}
{{- $paginator := .Paginate $poetryPages -}}

<!-- 诗歌系列区域 - 只在第一页显示 -->
{{- if eq $paginator.PageNumber 1 -}}
{{- $allPages := .Site.RegularPages -}}
{{- $allPages := where $allPages "Layout" "ne" "search" -}}
{{- $allPages := where $allPages "Layout" "ne" "archives" -}}
{{- $allPages := where $allPages "Params.hidden" "ne" true -}}
{{- $pinnedPages := where $allPages "Params.pin" true -}}
{{- $pinnedPages := where $pinnedPages "Section" "poetry" -}}

{{- if or $pinnedPages (where .Site.Pages "Title" "《随吐集》") -}}
<div class="poetry-series-section">
    <h2 class="section-title">诗歌系列</h2>
    <div class="series-grid">
    {{- range $pinnedPages -}}
        {{- partial "components/cards/series-overview.html" . -}}
    {{- end -}}
    ...
    </div>
</div>
{{- end -}}
{{- end -}}

<!-- 诗歌列表 -->
<div class="poetry-list-section">
    <h2 class="section-title">诗歌</h2>
    <div class="posts-list">
        {{- range $paginator.Pages -}}
        ...
        {{- end -}}
    </div>
</div>
```

### 经验总结

1. **Hugo 模板中 .Paginate 方法的调用限制** - 每个页面模板只能调用一次 `.Paginate` 方法
2. **使用 $paginator 变量** - 将 `.Paginate` 方法的调用移到模板的早期，然后使用 `$paginator` 变量来访问分页信息
3. **分页信息的使用** - 在模板的其他部分使用 `$paginator` 变量来访问分页信息，如 `$paginator.PageNumber`
4. **模板结构的重要性** - 合理组织模板结构，确保 `.Paginate` 方法的调用在模板的早期，避免多次调用

### 相关资源

- [Hugo Pagination](https://gohugo.io/templates/pagination/)
- [Hugo .Paginate Method](https://gohugo.io/functions/paginate/)

## 问题 4：代码折叠功能异常（多个按钮、箭头样式不正确）

### 问题描述
用户反馈：代码折叠功能出现多个按钮、箭头样式不正确、折叠状态显示异常等问题。具体表现为：
- 同一个代码块上显示多个折叠按钮
- 按钮上的箭头样式显示为字符而非 SVG 图标
- 代码块折叠后按钮状态未正确更新

### 根本原因
1. **代码块选择范围过大**
   - 原代码中代码块的选择范围包括 `.highlight, .chroma, pre, code`，导致同一个代码块被多次处理，从而添加了多个折叠按钮。

2. **Hugo 服务器缓存**
   - 在修改代码后，Hugo 服务器可能没有完全重建网站，导致旧的 JavaScript 代码（使用字符箭头）仍然被加载，而不是新的代码（使用 SVG 图标）。

3. **CSS 样式问题**
   - 当代码块折叠时，按钮的状态没有正确更新，导致箭头图标没有旋转 180 度，显示状态与实际折叠状态不一致。

### 解决方案
1. **缩小代码块选择范围**
   - 修改 `code-fold.js` 文件，将代码块的选择范围从 `.highlight, .chroma, pre, code` 缩小到只有 `.highlight, .chroma`，避免重复添加按钮。

2. **停止并重新启动 Hugo 服务器**
   - 确保所有修改都能正确生效，清除服务器缓存。

3. **恢复 SVG 相关的 CSS 样式**
   - 确保按钮在折叠状态时正确显示，箭头图标旋转 180 度。

4. **确保按钮状态与代码块折叠状态一致**
   - 通过 CSS 控制 SVG 图标的旋转，确保按钮状态与代码块的折叠状态一致。

### 影响文件

1. `assets/extend_footer_modules/js/code-fold.js` - 代码折叠功能的 JavaScript 实现
2. `assets/extend_footer_modules/css/code-fold.css` - 代码折叠功能的 CSS 样式

### 关键代码变更

**code-fold.js 变更：**
```javascript
// 修改前：选择范围过大
const codeBlocks = document.querySelectorAll('.highlight, .chroma, pre, code');

// 修改后：缩小选择范围，避免重复添加按钮
const codeBlocks = document.querySelectorAll('.highlight, .chroma');
```

**code-fold.css 变更：**
```css
/* 确保按钮在代码块折叠时正确显示 */
.code-fold-toggle svg {
  width: 12px !important;
  height: 12px !important;
  fill: currentColor !important;
  transition: transform 0.3s ease !important;
}

.code-fold-toggle.folded svg {
  transform: rotate(180deg) !important;
}

/* 确保按钮在代码块折叠时正确显示 */
.code-folded .code-fold-toggle svg {
  transform: rotate(180deg) !important;
}
```

### 经验总结

1. **代码块选择范围的重要性** - 选择范围过大可能导致重复处理同一个代码块，从而添加多个按钮。
2. **Hugo 服务器缓存** - 在修改静态资源后，有时需要停止并重新启动 Hugo 服务器，确保所有修改都能正确生效。
3. **CSS 样式与 JavaScript 逻辑的配合** - 确保 CSS 样式能够正确反映 JavaScript 控制的状态变化，如代码块的折叠/展开状态。
4. **调试方法** - 检查生成的 HTML 文件可以确认修改是否已经生效，以及是否存在多个版本的代码在运行。

### 相关资源

- [JavaScript querySelectorAll](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll)
- [CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions)
- [Hugo Static Files](https://gohugo.io/content-management/static-files/)
