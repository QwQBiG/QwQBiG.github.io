---
title: "史诗级 ”Hello World“：如何从0到1（划掉）搭建个人技博（技术博客）"
date: 2025-11-13T21:00:00+08:00
draft: false
tags: ["建站", "Hugo", "GitHub Pages", "Windows", "指南", "教程"]
categories: ["技术实践"]
description: "从零开始搭建个人技术博客的完整指南"
---

你好，世界！

多年之后，看到这些文字，如今的你，是否还会想起，多年前看b站视频打印"hello world!"的那个遥远的下午…

如果你能看到这篇文章，那说明我成功了。作为一只冲浪老资历，我一直梦想拥有一个属于自己的、可以记录学习笔记、分享心得的个人博客（东方homo馆）。这便是我的”Hello World“——一个通往更广阔数字世界的起点。（兴许是"读瘾"犯了，要写点东西自己咂摸）

溯洄从之，道阻且长。如同伊人，此间追寻的过程远比我想象的要曲折，但也比我想象的要收获更多。我遇到了各种各样的问题：从 Docker 的内网穿透失败（其实成功了（但是https）），到 Windows 开发环境的重重陷阱，再到网络连接的神秘莫测，最后到项目结构的频频阻折…

所幸“时来天地皆同力”，假借实验室老老资历学长给的焚诀（代理，ai，服务器的一块ubuntu…）得以为今后的所有故事作一个序。

而我的感觉是：尽管ai飞速发展，博客、论坛、群聊比比皆是，我自己搜寻资料时，找相应操作时，或者找一些有的没有的奇怪资源时，还是有些力不从心（哈基米赛高（25.11））；加上我喜欢鼓捣些长久的、有趣的、有意味（意味深）的东西，顾影自怜，自我怀念，比如写诗著文，都是些艺术形式，于是便有了这个界面的出现。

谁不想要一个自己的文章网站呢~

现在，我想把这条被我”踩“出来的、不怕ta”爱而不见“的路，分享给你。

## 最终技术栈

- **内容生成**：Hugo (静态网站生成器)
- **免费托管**：GitHub Pages (”免费虚拟主机“)
- **版本控制**：Git (”时光机“，记录你的每一次修改)
- **域名**：GitHub Pages 自带 `username.github.io` 或自定义域名

## 前置准备：Windows 开发环境搭建

### 1. 安装 Scoop (Windows 的包管理器)

打开一个**普通用户权限**的 PowerShell 窗口（不要"以管理员身份运行"），执行以下两条命令：

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

这里有趣的是如果管理员运行会报错，这是因为Scoop 的 "用户级" 设计哲学，十分不错。

### 2. 安装所有核心工具

拥有了 Scoop，我们就可以一键安装所有需要的软件。

```powershell
# 安装 Git (版本控制)
scoop install git

# 安装 Go 语言 (Hugo 模块系统依赖)
scoop install go

# 安装 Hugo (网站生成器)
scoop install hugo

# 安装 VS Code (代码编辑器), 需要先添加 'extras' 仓库
scoop bucket add extras
scoop install vscode
```

## 创建你的 Hugo 网站

### 1. 创建站点

```powershell
# 创建一个名为 'myblog' 的新站点
hugo new site myblog
cd myblog

# 初始化 Git 仓库
git init
```

### 2. 添加主题

这里使用 PaperMod 主题，它简洁、快速且功能丰富：

```powershell
# 将主题添加为 Git 子模块
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
```

### 3. 配置 Hugo

编辑 `hugo.toml` 文件，配置站点信息和主题：

```toml
baseURL = 'https://your_user_name.github.io/'
languageCode = 'zh-cn'
title = '你的博客标题'
theme = 'PaperMod'
```

## 创建你的第一篇文章

```powershell
# 创建一篇新文章
hugo new posts/hello-world.md
```

这会在 `content/posts/` 目录下创建一个 Markdown 文件，打开它开始写作吧！

## 本地预览

```powershell
# 启动本地服务器
hugo server -D
```

在浏览器访问 `http://localhost:1313` 即可预览你的网站。

## 部署到 GitHub Pages

### 1. 创建 GitHub 仓库

在 GitHub 上创建一个名为 `yourusername.github.io` 的仓库（将 `yourusername` 替换为你的 GitHub 用户名）。

### 2. 配置 GitHub Actions

在 `.github/workflows/deploy.yml` 创建自动部署配置：

```yaml
name: Deploy Hugo Site

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
      with:
        submodules: true
    
    - name: Setup Hugo
      uses: peaceiris/actions-hugo@v2
      with:
        hugo-version: 'latest'
    
    - name: Build
      run: hugo --minify
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./public
```

### 3. 推送代码

```powershell
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git push -u origin main
```

推送后，GitHub Actions 会自动构建并部署你的网站。几分钟后，访问 `https://yourusername.github.io` 即可看到你的博客！

## 写在最后

搭建博客的过程虽然曲折，但每一步都是学习。从 Docker 到 Hugo，从 Git 到 GitHub Actions，这些工具和技术栈都是现代开发者的必备技能。

希望这篇指南能帮助你顺利搭建自己的博客。记住，最重要的是开始写，而不是追求完美。

**你好，世界！你好，博客！**
