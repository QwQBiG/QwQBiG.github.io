# QwQBiG's World

我的个人博客，记录计算机学习笔记、折腾过的东西，也放一些诗词和随笔。

[访问博客](https://iqwqi.win) · [文章归档](https://iqwqi.win/archives/) · [关于我](https://iqwqi.win/about/)

网站用 [Astro](https://astro.build/) 构建，样式主要用 Tailwind CSS，部分交互用 React 和 Three.js，部署在 GitHub Pages。

## 本地运行

推荐使用 Node.js 22，与 GitHub Actions 的构建环境保持一致。

```bash
git clone https://github.com/QwQBiG/QwQBiG.github.io.git
cd QwQBiG.github.io
npm ci
npm run dev
```

开发服务器默认运行在 `http://localhost:4321`。

## 构建与部署

```bash
npm test
npm run build
npm run preview
```

`npm run build` 会先优化图片，再把静态文件生成到 `dist/`。推送到 `main` 分支后，GitHub Actions 会自动构建并部署。

界面图标使用 SVG。构建时会检查源文件和生成页面中的 emoji，也可以单独运行 `npm run check:emoji`。

## 写文章

- 技术文章：`src/content/cs/posts/`
- 诗词和随笔：`src/content/poetry/posts/`

文章用 Markdown 编写，在文件开头填写标题、日期等信息：

```yaml
---
title: 文章标题
description: 一句话简介
date: 2026-01-01
tags: [Astro]
draft: false
---
```

诗词还可以填写体裁 `genre` 和主题 `mood`。其他字段见 [`src/content/config.ts`](src/content/config.ts)。

首页、归档、标签、搜索和 RSS 使用同一份内容数据，合集不计入文章数量，标签忽略大小写去重。`draft: true` 不发布，`hidden: true` 保留直达链接，但不出现在列表和统计中。

## 许可

源代码采用 [MIT License](LICENSE)。文章、图片、音频等内容不在 MIT 许可范围内，权利归各自作者或权利人所有。
