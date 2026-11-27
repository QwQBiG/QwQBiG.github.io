# QwQBiG's World

我是 iqwqi。这个博客收着我的计算机学习笔记和自己做的小项目。写代码之外，我也写诗，陆陆续续攒成了一本《随吐集》。

**[打开博客](https://iqwqi.win/)** · [技术文章归档](https://iqwqi.win/archives/) · [站内搜索](https://iqwqi.win/search/) · [订阅 RSS](https://iqwqi.win/rss.xml)

<a href="https://iqwqi.win/">
  <picture>
    <source media="(prefers-reduced-motion: no-preference)" srcset=".github/media/homepage-motion.webp">
    <img src=".github/media/homepage.webp" alt="博客首页，点击中央人物可切换表情，四周是导航、日历、音乐播放器和最新文章卡片">
  </picture>
</a>

## 在站里逛逛

| 栏目 | 可以从这里开始 |
| --- | --- |
| [计算机笔记](https://iqwqi.win/cs/) | [系列目录](https://iqwqi.win/series/)里有 C++、Rust、算法、数据库、Linux 网络、嵌入式和运维。想动手试试，可以从[给 ESP32 点灯](https://iqwqi.win/cs/posts/embeddedseries/q26han01/)读起。 |
| 个人项目 | [弦歌册](https://iqwqi.win/cs/posts/xiangece/)是我做的校园事项助手，用来查课表、记待办，也能回听课堂录音。 |
| [诗词和随笔](https://iqwqi.win/poetry/) | 我在[《随吐集》前言](https://iqwqi.win/poetry/posts/folder-01/st000_前言/)里写了集名的来历。想直接读一首，可以翻[《儿时的纸船》](https://iqwqi.win/poetry/posts/folder-02/st021_儿时的纸船/)。 |
| [画廊](https://iqwqi.win/gallery/) | 照片从画面中心一张张展开。可以点开看大图，也可以拖动相框，同一浏览器下次打开时还会记得位置。 |
| [关于我](https://iqwqi.win/about/) | 这里有我的自我介绍和其他账号。[友链](https://iqwqi.win/friends/)也有单独的一页。 |

**按标签读**　[C++](https://iqwqi.win/tags/c%2B%2B/) · [Rust](https://iqwqi.win/tags/rust/) · [Linux](https://iqwqi.win/tags/linux/) · [算法](https://iqwqi.win/tags/算法/) · [数据库](https://iqwqi.win/tags/数据库/) · [嵌入式](https://iqwqi.win/tags/嵌入式/) · [古体诗](https://iqwqi.win/tags/古体诗/) · [现代诗](https://iqwqi.win/tags/现代诗/) · [全部标签](https://iqwqi.win/tags/)

## 本地运行

网站用 Astro 生成静态页面，样式主要用 Tailwind CSS，评论用 Waline。部署环境使用 Node.js 22，本地推荐同一主版本的最新补丁版。

```bash
git clone https://github.com/QwQBiG/QwQBiG.github.io.git
cd QwQBiG.github.io
npm ci
npm run dev
```

浏览器打开 `http://localhost:4321` 就能预览。改动 Markdown 文件后，开发服务器会自动更新页面。

## 写文章

技术文章放在 [src/content/cs/posts/](src/content/cs/posts/)，诗文放在 [src/content/poetry/posts/](src/content/poetry/posts/)。新建一个 Markdown 文件，在开头填上标题和日期就可以动笔。

```yaml
---
title: 串口调试笔记
date: 2026-01-21
tags: [嵌入式, ESP32]
draft: true
---
```

草稿不会生成页面。写好后将 `draft` 改成 `false`，下次部署就会发布。想保留直达链接、从公开列表中隐藏文章时，用 `hidden: true`。技术文章可以用 `series` 加入已有合集，诗词可以用 `genre` 和 `mood` 标注体裁和主题。[完整字段定义](src/content/config.ts)

## 构建与部署

```bash
npm test
npm run build
npm run preview
```

构建会优化图片、检查源码和生成页面中的 emoji，并把静态文件写入 `dist/`。推送到 `main` 后，GitHub Actions 会运行测试并发布到 GitHub Pages。[部署记录](https://github.com/QwQBiG/QwQBiG.github.io/actions/workflows/deploy.yml)

## 许可

[MIT 许可](LICENSE)仅适用于本站源码。文章、图片、音频等内容的权利归各自作者或权利人所有。
