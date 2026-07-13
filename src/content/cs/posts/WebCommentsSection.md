---
title: "！更新评论系统！"
date: 2026-07-13T12:00:00+08:00
draft: false
tags: ["建站", "Astro", "GitHub Pages", "Waline", "指南", "教程", "Vercel", "Neon", "评论", "评论区"]
categories: ["技术实践"]
description: "为 Astro 静态博客集成 Waline 评论系统，支持回复、表情、图片上传和敏感词过滤。"
---

### 欸，我想添加一个评论区：想要花里胡哨，想要安全，想要纯净，想要客制化~

## 选型对比

静态博客加评论区，常见的免费方案有三个：

| 方案 | 数据存储 | 匿名评论 | 内容审核 | 部署难度 |
|------|---------|---------|---------|---------|
| Utterances | GitHub Issues | ❌ | ❌ | ⭐ |
| Giscus | GitHub Discussions | ✅ | 手动审核 | ⭐ |
| **Waline** | Vercel KV / Neon | ✅ | 关键词过滤 + 手动审核 | ⭐⭐ |

最终选了 **Waline**，因为它是三者中唯一支持**自动敏感词过滤**的，而且不需要用户注册 GitHub。

## 后端部署

Waline 需要一个小后端来处理评论存储。我用的是 **Vercel + Neon PostgreSQL** 的免费方案：

官网：`https://waline.js.org/` 去找文档操作即可，十分详细~

1. 在 Vercel 上点击 Waline 模板一键部署
2. 在 Neon 上创建免费的 PostgreSQL 数据库
3. 在 Vercel 项目的环境变量中填入 Neon 数据库连接信息
4. 设置 `AUTHOR_EMAIL` 环境变量指定管理员邮箱
5. 部署完成后获得后端地址：`https://waline.iqwqi.win/`

> **注意事项**：部署后 `/ui` 会自动跳转到 `/ui/register`，只有注册了管理员账号后才能进入管理后台。如果发现自己是普通用户，需要在 Vercel 环境变量中加 `AUTHOR_EMAIL` 然后重新部署。

## 前端集成

在 Astro 项目中创建了 `WalineComments.astro` 组件，引入 Waline 的 CSS 和 JS：

- CSS：`https://unpkg.com/@waline/client@v3/dist/waline.css`
- JS：`https://unpkg.com/@waline/client@v3/dist/waline.js`

`path` 参数通过 `data-path` 属性传递（不能直接在 `is:inline` 脚本中使用 Astro 变量），在客户端读取后传给 `Waline.init()`。

然后把组件插入到 CS 文章页 (`src/pages/cs/[...slug].astro`) 和诗歌页 (`src/pages/poetry/[...slug].astro`) 的文章末尾。

## 样式客制化

通过 Waline 的 `style` 选项，用 CSS 变量覆盖了默认样式，适配本站的粉紫主题：

- 主色调 `#e84a7a`，按钮用粉紫渐变
- 容器加 `backdrop-filter: blur(20px)` 毛玻璃效果
- 评论卡片悬停上浮 + 投影
- 输入框聚焦粉色光晕
- 圆角统一 `12px`

## 管理后台

访问 Waline 管理后台：`https://waline.iqwqi.win/ui`

功能：
- **评论管理**：查看、审核、删除所有评论
- **敏感词过滤**：配置关键词列表，自动拦截违规评论
- **安全域名**：限制只有 `iqwqi.win` 域名可以使用评论服务
- **IP 黑名单**：封禁恶意用户

## 效果

现在每篇文章底部都能看到评论区了，支持 Markdown 语法、表情包、图片上传、多级回复。管理员可以在后台实时审核，敏感词自动过滤。

感觉还不错~
