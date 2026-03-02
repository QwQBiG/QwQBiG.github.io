# 项目结构说明

## 目录树

```
MyBlog/
├── archetypes/              # Hugo 文章模板
│   └── default.md          # 默认文章模板
├── assets/                  # 自定义资源文件
│   ├── css/                # 全局样式
│   │   ├── code-blocks.css    # 代码块样式
│   │   ├── custom.css         # 自定义主题样式
│   │   └── page-transitions.css  # 页面过渡动画
│   ├── js/                 # 全局脚本
│   │   └── site-features.js   # 网站功能脚本
│   └── modules/            # 功能模块 (原 extend_footer_modules)
│       ├── css/               # 模块样式
│       ├── html/              # 模块 HTML
│       └── js/                # 模块脚本
├── content/                 # 网站内容
│   ├── cs/                 # 计算机科学分类
│   │   ├── posts/             # 文章
│   │   └── _index.md          # 分类首页
│   ├── games/              # 游戏分类
│   ├── poetry/             # 诗词分类
│   ├── about.md            # 关于页面
│   ├── archives.md         # 归档页面
│   └── search.md           # 搜索页面
├── docs/                    # 项目文档
│   ├── README.md              # 文档首页
│   ├── project-overview.md    # 项目概述
│   └── development-guide.md   # 开发规范
├── layouts/                 # Hugo 模板
│   ├── _default/           # 默认模板
│   ├── cs/                 # CS 分类模板
│   ├── games/              # 游戏分类模板
│   ├── partials/           # 模板片段
│   │   ├── components/        # 组件
│   │   ├── integrations/      # 第三方集成
│   │   └── layout/            # 布局片段
│   ├── poetry/             # 诗词分类模板
│   ├── 404.html            # 404 页面
│   └── index.html          # 首页
├── static/                  # 静态文件
├── .github/                 # GitHub 配置
│   └── workflows/             # GitHub Actions
├── hugo.toml               # Hugo 配置文件
└── README.md               # 项目说明
```

## 关键文件说明

### 配置文件

| 文件 | 说明 |
|------|------|
| `hugo.toml` | Hugo 主配置 |
| `go.mod` | Go 模块依赖 |

### 核心模板

| 文件 | 说明 |
|------|------|
| `layouts/_default/baseof.html` | 基础布局 |
| `layouts/index.html` | 首页 |
| `layouts/partials/extend_footer.html` | 页脚扩展模块加载器 |
| `layouts/partials/extend_head.html` | 头部扩展 |

### 样式文件

| 文件 | 说明 |
|------|------|
| `assets/css/custom.css` | 主题定制样式 |
| `assets/css/code-blocks.css` | 代码块样式 |
| `assets/css/page-transitions.css` | 页面过渡动画 |

### 功能模块

| 模块 | 文件 | 功能 |
|------|------|------|
| reading-progress | `modules/css/reading-progress.css`<br>`modules/js/reading-progress.js` | 阅读进度条 |
| back-to-top | `modules/css/back-to-top.css`<br>`modules/js/back-to-top.js` | 返回顶部按钮 |
| neko-piano | `modules/css/neko-piano.css`<br>`modules/js/neko-piano.js`<br>`modules/html/neko-piano.html` | 猫咪钢琴 |
| pagination | `modules/css/pagination.css`<br>`modules/js/pagination.js` | 分页样式 |

## 命名规范

### 目录命名
- 小写字母
- 多单词用连字符 `-` 连接
- 例如: `reading-progress`, `page-transitions`

### 文件命名
- CSS/JS: 小写，连字符连接
- 布局模板: 小写，下划线连接
- 内容文件: 大驼峰或中文

### CSS 类名
- 使用 BEM 命名法
- 模块前缀: `模块名-元素名--修饰符`
- 例如: `.reading-progress-bar`, `.neko-piano--active`

## 新增文件指南

### 添加新模块

1. 在 `assets/modules/` 创建模块目录
2. 添加 CSS/JS/HTML 文件
3. 在 `layouts/partials/extend_footer.html` 注册

### 添加新文章

1. 在对应分类目录创建 `.md` 文件
2. 使用 `hugo new content/分类/文章名.md` 命令
3. 填写 Front Matter

### 添加新布局

1. 在 `layouts/` 或对应分类目录创建 `.html` 文件
2. 继承 `baseof.html` 或使用 `define` 块
3. 参考现有布局模板
