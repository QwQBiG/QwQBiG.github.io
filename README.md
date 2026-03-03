# QwQBiG's Blog

[![Hugo](https://img.shields.io/badge/Hugo-v0.152.2+-ff4088?logo=hugo)](https://gohugo.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-success?logo=github)](https://github.com/QwQBiG/QwQBiG.github.io/actions)

基于 Hugo + PaperMod 主题构建的个人博客，支持双主题切换、阅读进度条、猫咪钢琴等交互功能。

[在线访问](https://qwqbig.github.io/) | [项目文档](./docs/README.md) | [开发规范](./docs/development-guide.md)

## 特性

- 🎨 **双主题支持** - 浅色/深色模式自动切换
- 📊 **阅读进度条** - 彩虹色动态进度指示
- 🎹 **猫咪钢琴** - 互动式页脚组件
- 💬 **Giscus 评论** - 基于 GitHub Discussions
- 🔍 **全文搜索** - Fuse.js 驱动的站内搜索
- 📱 **响应式设计** - 完美适配各种设备

## 快速开始

### 环境要求

- Hugo Extended v0.152.2+
- Git

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/QwQBiG/QwQBiG.github.io.git
cd QwQBiG.github.io

# 启动开发服务器
hugo server -D --bind 0.0.0.0 --port 1313

# 访问 http://localhost:1313
```

### 构建

```bash
# 构建站点
hugo --minify

# 输出到 public/ 目录
```

## 项目结构

```
MyBlog/
├── archetypes/         # 文章模板
├── assets/             # 自定义资源
│   ├── css/           # 全局样式
│   ├── js/            # 全局脚本
│   └── modules/       # 功能模块
├── content/            # 网站内容
│   ├── cs/           # 计算机科学
│   ├── games/        # 游戏
│   └── poetry/       # 诗词
├── layouts/           # 页面模板
├── docs/              # 项目文档
└── static/            # 静态文件
```

详细结构说明见 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## 内容管理

### 创建新文章

```bash
# 创建计算机科学文章
hugo new content/cs/posts/文章标题.md

# 创建诗词
hugo new content/poetry/posts/诗词标题.md
```

### 文章模板

```markdown
---
title: "文章标题"
date: 2024-01-01T00:00:00+08:00
draft: false
tags: ["标签1", "标签2"]
categories: ["分类"]
description: "文章描述"
---

文章内容...
```

## 自定义开发

### 添加新模块

1. 在 `assets/modules/` 创建模块目录
2. 添加 CSS/JS/HTML 文件
3. 在 `layouts/partials/extend_footer.html` 注册

### 主题定制

- 主色调: `#e84a7a` (浅色) / `#bd93f9` (深色)
- 全局样式: `assets/css/custom.css`
- 模块样式: `assets/modules/css/`

详见 [开发规范](./docs/development-guide.md)

## 部署

项目使用 GitHub Actions 自动部署到 GitHub Pages：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动构建并部署
3. 访问 `https://<username>.github.io`

部署配置: `.github/workflows/deploy.yml`

## 技术栈

- [Hugo](https://gohugo.io/) - 静态网站生成器
- [PaperMod](https://github.com/adityatelange/hugo-PaperMod) - Hugo 主题
- [Giscus](https://giscus.app/) - 评论系统
- [Fuse.js](https://fusejs.io/) - 模糊搜索

## 许可证

MIT License © 2026 QwQBiG