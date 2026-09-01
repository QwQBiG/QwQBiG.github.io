# QwQBiG's World

这是我的个人博客，也是一个仍在慢慢生长的数字花园。

我在这里记录计算机、编程与系统实践，也存放诗词、随笔和生活中的一些片段。比起做一套可以复用的博客模板，我更想让它保留个人网站应有的性格：内容可以严肃，表达可以松弛，页面也可以偶尔做些不那么实用的实验。

[访问博客](https://iqwqi.win) · [文章归档](https://iqwqi.win/archives/) · [关于我](https://iqwqi.win/about/)

## 这里有什么

- 计算机学习笔记：算法、C++、Rust、嵌入式、Linux 与日常开发实践
- 诗词与随笔：古典诗词、现代诗，以及一些难以归类的文字
- 交互页面：照片墙、音乐播放器和若干 Three.js / Canvas 视觉实验
- 阅读工具：全文搜索、标签、系列文章、归档与 RSS

网站以内容为中心，但不追求完全朴素。首页、关于页和照片墙承载了大部分视觉表达，文章页则尽量把注意力还给文字与代码。

## 技术实现

项目基于 [Astro](https://astro.build/) 构建，静态生成后部署到 GitHub Pages。交互部分按需使用 React、Three.js、GSAP 和 Framer Motion，样式由 Tailwind CSS 与项目内的 CSS 共同完成。

文章使用 Astro Content Collections 管理，代码块由 Prism.js 渲染，站内搜索由 Pagefind 生成。此外还包含数学公式、RSS 和 Sitemap 支持。

主要目录：

```text
src/
├── components/       页面组件与交互模块
├── content/
│   ├── cs/           技术文章
│   └── poetry/       诗词与随笔
├── layouts/          页面布局
├── pages/            路由页面
└── styles/           全局与专题样式
public/               字体、音乐、图片及前端脚本
```

## 本地运行

需要 Node.js 20 或更高版本。

```bash
git clone https://github.com/QwQBiG/QwQBiG.github.io.git
cd QwQBiG.github.io
npm ci
npm run dev
```

开发服务器默认运行在 `http://localhost:4321`。

```bash
npm run build
npm run preview
```

`npm run build` 会先处理站内图片，再生成静态文件到 `dist/`。推送至 `main` 分支后，GitHub Actions 会自动完成构建与部署。

## 写作

技术文章放在 `src/content/cs/posts/`，诗词与随笔放在 `src/content/poetry/posts/`。每篇内容都使用 Markdown，并通过 frontmatter 记录标题、日期、标签和发布状态。

```yaml
---
title: 文章标题
description: 一句话简介
date: 2026-01-01
tags: [Astro]
draft: false
---
```

诗词集合还支持 `genre` 与 `mood` 字段；完整约束以 [`src/content/config.ts`](src/content/config.ts) 为准。

## 许可

项目源代码采用 [MIT License](LICENSE)。博客文章、图片、音频及其他媒体内容不在 MIT 许可范围内，相关权利由原作者或各自权利人保留。
