# QwQBiG's Blog

这是我的使用 Hugo 框架搭建的个人博客，基于 PaperMod 主题。我怕自己忘记一些内容，所以还是写一下~

## 项目结构

```
├── .github/            # GitHub Actions 配置
│   └── workflows/
│       └── deploy.yml  # 自动部署配置
├── archetypes/         # 内容模板
│   └── default.md      # 默认文章模板
├── assets/             # 静态资源
│   └── css/
│       └── custom.css  # 自定义 CSS
├── content/            # 内容目录
│   ├── posts/          # 博客文章
│   ├── series/         # 文章系列
│   ├── about.md        # 关于页面
│   ├── archives.md     # 归档页面
│   └── search.md       # 搜索页面
├── layouts/            # 布局模板
│   ├── partials/       # 部分模板
│   │   ├── comments.html              # 评论功能
│   │   ├── extend_footer.html         # 页脚扩展
│   │   ├── header.html                # 头部模板
│   │   └── series_overview_card.html  # 系列卡片
│   └── index.html      # 主页模板
├── resources/          # 生成的资源
├── static/             # 静态文件
│   ├── music/          # 音乐文件
│   └── avatar.png      # 头像
├── .gitignore          # Git 忽略文件
├── .hugo_build.lock    # Hugo 构建锁文件
├── go.mod              # Go 模块文件
├── go.sum              # Go 依赖校验和
└── hugo.toml           # Hugo 配置文件
```

### 自定义页面

- **关于页面**: 编辑 `content/about.md`
- **归档页面**: 编辑 `content/archives.md`
- **搜索页面**: 编辑 `content/search.md`

### 自定义 CSS

编辑 `assets/css/custom.css` 文件以添加自定义样式：

```css
/* 在这里添加你的自定义样式 */
```

### 自定义布局

- **主页**: 编辑 `layouts/index.html`
- **头部**: 编辑 `layouts/partials/header.html`
- **评论**: 编辑 `layouts/partials/comments.html`