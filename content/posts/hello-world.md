---
title: "史诗级“Hello World”：如何从0到1（划掉）搭建个人技博（技术博客）"
date: 2025-11-13T21:00:00+08:00
tags: ["建站", "Hugo", "GitHub Pages", "Windows", "避坑指南", "新手教程"]
categories: ["技术实践"]
toc: true  # 目录
# math: true  # 开启数学公式渲染
---

你好，世界！

多年之后，看到这些文字，如今的你，是否还会想起，多年前看b站视频打印“hello world!”的那个遥远的下午...

如果你能看到这篇文章，那说明我成功了。作为一只冲浪老资历，我一直梦想拥有一个属于自己的、可以记录学习笔记、分享心得的个人博客（东方homo馆）。这便是我的“Hello World”——一个通往更广阔数字世界的起点。（兴许是“读瘾”犯了，要写点东西自己咂摸）

溯洄从之，道阻且长。如同伊人，此间追寻的过程远比我想象的要曲折，但也比我想象的要收获更多。我遇到了各种各样的问题：从 Docker 的内网穿透失败（其实成功了（但是https）），到 Windows 开发环境的重重陷阱，再到网络连接的神秘莫测，最后到项目结构的频频阻折...

所幸“时来天地皆同力”，假借实验室老老资历学长给的焚诀（代理，ai，服务器的一块ubuntu...）得以为今后的所有故事作一个序。

而我的感觉是：尽管ai飞速发展，博客、论坛、群聊比比皆是，我自己搜寻资料时，找相应操作时，或者找一些有的没有的奇怪资源时，还是有些力不从心（主要是豆沙包和臭鲸鱼现在确实一般般（25.11））；加上我喜欢鼓捣些长久的、有趣的、有意味（意味深）的东西，顾影自怜，自我怀念，比如写诗著文，都是些艺术形式，于是便有了这个界面的出现。

谁不想要一个自己的文章网站呢~

现在，我想把这条被我“踩”出来的、不怕ta“爱而不见”的路，分享给你。

<!--more-->

### **最终技术栈**

*   **内容生成**：**Hugo** (一个快如闪电的静态网站生成器)
*   **免费托管**：**GitHub Pages** (程序员的“免费虚拟主机”)
*   **写作工具**：**VS Code** + **Markdown** 语法
*   **版本控制与部署**：**Git**
*   **本地环境**：**Windows 11**

---

## **第一章：环境搭建——地基决定上层建筑**

事实证明，一个干净、稳定、配置正确的本地开发环境，是所有成功的一半。在经历了多次失败后，我总结出以下在 Windows 上最可靠的安装流程。

### 1. 安装 Scoop 包管理器

Scoop 是 Windows 上的一个命令行“应用商店”，能让软件安装变得极其简单。

*   **准备 PowerShell**
    打开一个**普通用户权限**的 PowerShell 窗口（不要“以管理员身份运行”），执行以下两条命令：

    ```powershell
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
    irm get.scoop.sh | iex
    ```
    这里有趣的是如果管理员运行会报错，这是因为Scoop 的 “用户级” 设计哲学，十分不错。

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

> **避坑指南**：如果任何一条 `scoop install` 命令因为网络问题失败 (比如提示"远程方已关闭传输流")，不要灰心，这是国内网络环境的常见问题。多试几次，或者考虑为 PowerShell 设置临时的网络代理。

### 3. 为 Git 配置网络代理

为了确保后续能顺利地从 GitHub 下载主题和推送网站，我们需要为 Git 配置代理（如果你有代理工具的话）。这几乎是一劳永逸地解决网络问题的最佳方案。

```powershell
# 将 7890 替换成你自己的代理工具的 HTTP 端口
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy https://127.0.0.1:7890
```

## 第二章：创建你的博客本体

环境就绪，现在开始盖房子。我选择将项目放在 D 盘，避免 C 盘系统重装带来的麻烦（依旧怕爆红）。

### 1. 创建项目骨架

```powershell
D:
mkdir Projects
cd Projects
hugo new site my-blog
cd my-blog
```

验证：运行 ls，确保 content、archetypes 等文件夹都已成功创建。

### 2. 使用 Hugo Modules 配置主题

我们使用模块化的方式引入 PaperMod 这个简洁优雅的主题。

```powershell
# 初始化
git init
hugo mod init my-blog

# 打开 VS Code 编辑配置文件
code .
```

在 VS Code 里，清空 hugo.toml 文件，并粘贴以下内容。注意：baseURL 必须换成你自己的 GitHub Pages 网址！

```toml
baseURL = "https://QwQBiG.github.io/" # 换成你的！
languageCode = "en-us"
title = "QwQBiG's Blog" # 换成你的博客标题
theme = "github.com/adityatelange/hugo-PaperMod"

[params]
    ShowCodeCopyButtons = true
```

### 3. 下载主题

```powershell
hugo mod tidy
```

这条命令会读取配置文件，并自动下载所需的主题模块。

## 第三章：日常写作与发布

这是你以后会日复一日重复的流程。

### 1. 创作与预览

```powershell
# 创建一篇新文章
hugo new content posts/my-first-post.md

# 启动本地实时预览服务器
hugo server
```

现在，打开浏览器访问 http://localhost:1313。然后去 VS Code 里编辑 content/posts/my-first-post.md 文件（记得把 draft: true 改成 false），你所有的修改都会在浏览器里实时呈现。

### 2. 发布到全世界

当你在本地预览满意后，就可以正式发布了。

#### 第一步：在 GitHub 创建仓库

创建一个公开仓库，名称必须是 `你的用户名.github.io`。

#### 第二步：构建并部署

```powershell
# (在 my-blog 根目录) 停止本地服务器 (Ctrl+C)

# 1. 构建最终的网站文件到 public 文件夹
hugo

# 2. 进入 public 文件夹
cd public

# 3. 将 public 文件夹作为独立的 Git 仓库推送到线上
git init
# 首次部署需要配置用户信息和远程地址
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的GitHub注册邮箱"
git remote add origin https://github.com/你的用户名/你的用户名.github.io.git

# 添加所有文件，提交并强制推送到 main 分支
git add .
git commit -m "发布我的第一篇文章！"
git branch -M main
git push --force -u origin main
#最后这一步如果报错可以多试两次，我经常是第二次才成功
```

> **避坑指南**：整个部署流程最致命的错误，就是把 Git 仓库错误地初始化在了 `my-blog` 父目录，而不是 `public` 子目录。**一定要确保你是在 `public` 文件夹里执行 `git init` 和后续命令！**

### 3. 最后的等待

GitHub Pages 需要几分钟来部署你的网站。之后，访问 `https://你的用户名.github.io`，并按下 `Ctrl + Shift + R` 强制刷新缓存，你就能看到你的成果了。如果其他设备暂时无法访问，请耐心等待 DNS 传播（吃口饭去吧）。

## 第四章：重生之我是脚本小子（自动化）

我们每一次的发布还是太繁琐了，那...就直接写个脚本吧！

我们可以在项目根目录下创建一个 PowerShell 脚本文件，把所有命令都预先写好。以后，我们只需要运行这个脚本，就能完成所有部署操作。

> **注意**：我们也可以不用脚本自动化，可以借助GitHub Action实现，我放到了进阶教程里面哈。

### 第一步：创建脚本文件

在你的博客项目根目录（`my-blog`）下，创建一个新文件，命名为 `deploy.ps1`。

### 第二步：填入脚本代码

用 VS Code 打开 `deploy.ps1`，将以下代码完整地粘贴进去。这是一个纯英文、注释清晰、健壮可靠的版本，能避免所有因编码格式导致的奇怪错误。

```powershell
# =================================================================
#  Hugo Deployment Script for GitHub Pages
#  Author: QwQBiG & hisai
#  Version: 2.0 (All-English, Robust)
# =================================================================

# This script automates the entire process of building and deploying your Hugo site.
# It requires one argument: a commit message for this deployment.

param(
    [string]$commitMessage
)

# --- Step 1: Validate Input ---
if (-not $commitMessage) {
    Write-Host "ERROR: A commit message is required." -ForegroundColor Red
    Write-Host "USAGE: .\deploy.ps1 \"Your meaningful commit message\""
    exit 1
}

Write-Host "INFO: Starting deployment process..." -ForegroundColor Cyan

# --- Step 2: Clean previous build ---
Write-Host "INFO: Cleaning up the old 'public' directory..."
if (Test-Path -Path public) {
    Remove-Item -Recurse -Force public
}

# --- Step 3: Build the site with Hugo ---
Write-Host "INFO: Building the website with Hugo..."
hugo

# --- Step 4: Verify the build was successful ---
if (-not (Test-Path -Path public)) {
    Write-Host "ERROR: Hugo build failed. The 'public' directory was not created." -ForegroundColor Red
    exit 1
}
Write-Host "INFO: Hugo build successful." -ForegroundColor Green

# --- Step 5: Navigate into the public directory ---
cd public

# --- Step 6: Deploy to GitHub ---
Write-Host "INFO: Preparing to push to GitHub..."
git init
git remote add origin https://github.com/QwQBiG/QwQBiG.github.io.git
git add .
git commit -m "$commitMessage"
git branch -M main

Write-Host "INFO: Pushing files to the 'main' branch..."
git push --force -u origin main

# --- Step 7: Finalize ---
cd ..
Write-Host "-----------------------------------------------------"
Write-Host "SUCCESS: Deployment complete!" -ForegroundColor Green
Write-Host "Your website has been successfully pushed to GitHub."
Write-Host "Please wait 1-2 minutes for GitHub Pages to update."
Write-Host "Then, remember to hard-refresh your browser (Ctrl+Shift+R)."
Write-Host "-----------------------------------------------------"
```

### 第三步：如何使用

现在，你的发布流程被简化为一条命令：

```powershell
# 格式: .\deploy.ps1 "你的发布说明"

# 示例:
.\deploy.ps1 "发布我的第二篇文章"
```

> **避坑指南：首次运行的准备工作**
>
> 出于安全考虑，Windows PowerShell 默认可能不允许运行本地脚本。你需要以管理员身份打开 PowerShell，执行一次性设置：
>
> ```powershell
> Set-ExecutionPolicy RemoteSigned
> ```
>
> 按 `Y` 确认即可。此后你的电脑就信任并允许运行你自己写的脚本了。

---

## 第五章：主页大一统

### 1. 问题现象

你可能发现，最新发布的文章会"赤裸裸"地全文显示在主页顶部，没有卡片背景；而旧文章则以带背景的摘要卡片形式排列在下面。同时，你在 `hugo.toml` 里设置的博客总标题 `title` 也不见了。

### 2. 根本原因

这是 Hugo PaperMod 主题默认的 **"个人资料模式 (Profile Mode)"**。它会将最新的一篇文章作为"精选内容"直接在主页展示全文，并隐藏网站总标题，以营造个人主页的氛围。

但对于一个纯粹的博客，我们更想要一个所有文章样式统一的 **"列表模式 (List Mode)"**。

### 3. 解决方案：修改 hugo.toml

我们只需要修改配置文件，明确告诉主题我们想要的主页样式。

#### 第一步：打开 hugo.toml

#### 第二步：替换为推荐配置

将你的 `hugo.toml` 文件全部内容替换为下面的代码。这份配置不仅解决了布局问题，还额外添加了菜单导航等实用功能。

```toml
# hugo.toml (推荐的完整配置)

baseURL = "https://QwQBiG.github.io/" #改成你的！！！
languageCode = "zh-cn" # 修改为中文，对主题更友好
title = "QwQBiG's Blog" # 这是你的网站总标题
theme = "github.com/adityatelange/hugo-PaperMod"

# 主菜单配置
[menu]
  [[menu.main]]
    identifier = "archives"
    name = "归档"
    url = "/archives/"
    weight = 10
  [[menu.main]]
    identifier = "tags"
    name = "标签"
    url = "/tags/"
    weight = 20

# 这是最关键的参数配置部分
[params]
    ShowCodeCopyButtons = true

    # 1. 关闭特殊的"个人资料"主页模式
    # 这会让你的主页变成一个标准的文章列表
    [params.profileMode]
        enabled = false

    # 2. 在主页文章列表上方显示一个欢迎语
    # 这会解决主标题不显示的问题，并让主页更好看
    [params.homeInfoParams]
        Title = "你好，世界 👋"
        Content = "欢迎来到我的技术博客。在这里记录学习，分享心得。"

    # 3. 告诉主题，主页的文章列表主要来源于 "posts" 文件夹
    mainSections = ["posts"]
```

#### 第三步：重新部署

保存文件后，用我们全新的自动化脚本发布这次更新！

```powershell
.\deploy.ps1 "Update theme settings for a professional homepage layout"
```
等待部署完成后，强制刷新你的网站。你会看到一个清爽、专业、所有文章样式统一的新主页！

**Congratulations!!!**

---
## **进阶内容！！！**

---

## 第六章：Giscus - 赋予博客“对话”的能力

静态博客自身无法处理评论，但我们可以嵌入一个基于 GitHub 的、免费且无广告的评论系统：**Giscus**。

它的原理绝妙：将你 GitHub 仓库的 **Discussions** (讨论区) 功能，变成你博客文章的评论区。

### 集成 Giscus 的正确步骤

**第一步：核心准备 - 找到对的“家”**

Giscus 需要连接到你的**博客源代码仓库**。在我的实践中，我犯了一个错误，差点连错了地方。

*   **Aha! 时刻**：Giscus 需要连接的，就是你存放 `hugo.toml` 和 `content/` 文件夹的那个仓库。对我来说，就是 `QwQBiG/QwQBiG.github.io`。
*   **调试妙招**：如果你不确定仓库的全名，可以在后面“安装 Giscus App”的步骤中，从“Only select repositories (仅选择仓库)”的下拉列表里找到并复制它，绝对不会错！

**第二步：为“家”开启讨论功能**

1.  访问你的博客源代码仓库（例如 `https://github.com/QwQBiG/QwQBiG.github.io`）。
2.  点击 `Settings` -> `General` -> `Features`。
3.  找到 `Discussions`，给它打上勾。

**第三步：邀请“管家” Giscus App 入住**

1.  访问 Giscus 的应用主页：[https://github.com/apps/giscus](https://github.com/apps/giscus)。
2.  点击 `Install`，在接下来的页面选择 `Only select repositories`。
3.  在下拉菜单中，**务必勾选你的博客源代码仓库**。
4.  点击 `Install & Authorize` 完成安装。

**第四步：在 Giscus 官网生成“门牌号”**

1.  访问 [https://giscus.app/](https://giscus.app/)。
2.  在“仓库”一栏输入你的仓库全名。现在，因为你已经完成了所有准备，它会立刻成功识别！
3.  根据页面提示，完成设置（推荐映射关系选择 "Discussion title contains page `pathname`"）。
4.  最后，它会为你生成一段 `<script>` 代码。**复制它**。

**第五步：把“门牌号”挂到博客上**

1.  在你的 `my-blog` 项目的 `layouts/partials/` 路径下，创建一个新文件 `comments.html`。
2.  将刚才复制的 `<script>` 代码完整地粘贴进去。
3.  打开 `hugo.toml` 文件，在 `[params]` 的最下方加入代码，正式开启评论功能：

```toml
[params.comments]
    enabled = true
```

现在，部署你的网站。你会惊喜地发现，每篇文章下方，都有了一个功能完善的评论区！

## 第七章：GitHub Actions - 你的云端部署机器人儿

我们之前做的 `deploy.ps1` 脚本很好玩，一行命令搞定一切，很有成就感。但它有一个"束缚"：它只能在我的电脑上运行。

而 GitHub Actions，虽然配置文件看起来行数更多，但它提供的是一种更高维度的自动化。

### 它是什么？

一个住在你 GitHub 仓库里的免费机器人。你只要把代码 push 到仓库，剩下的所有部署工作，它在云端自动帮你完成。

### 它比本地脚本强在哪里？

- **随时随地**：我可以在平板上、朋友的电脑上、甚至用手机网页版修改一个错字并提交，网站就会自动更新。我不再需要本地的 Hugo 环境和 PowerShell 脚本。
- **绝对稳定**：云端环境是标准化的，永远不会出现"在我电脑上明明是好的"这种问题。
- **专业流程**：这是行业标准，理解它，就等于理解了现代软件开发的核心理念之一：CI/CD（持续集成/持续部署）。

### 配置 GitHub Actions 的正确步骤

#### 第一步：创建"机器人指令室"

在你的项目根目录，手动创建这样一个文件夹结构：`.github/workflows/`。

#### 第二步：编写"机器人指令集"

在 `workflows` 文件夹里，创建一个 `deploy.yml` 文件，把下面的"指令集"粘贴进去。

**注意**：这份配置是为像我一样，在同一个仓库里进行开发和部署的场景量身定制的。

```yaml
# .github/workflows/deploy.yml

name: Deploy Hugo Site to Pages

on:
  # 当 main 分支有 push 时触发
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      # 第一步：机器人先"检出"你的代码
      - name: Checkout
        uses: actions/checkout@v3
        with:
          submodules: true  # 获取主题等子模块

      # 第二步：机器人安装 Hugo 环境
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest'
          extended: true

      # 第三步：机器人运行 hugo 命令，构建网站
      - name: Build
        run: hugo

      # 第四步：机器人将构建好的网站（public目录）部署到 gh-pages 分支
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          # 这个令牌是 GitHub 自动提供的，无需设置
          github_token: ${{ secrets.GITHUB_TOKEN }}
          # 我们要部署的分支是 gh-pages
          publish_branch: gh-pages
          # 部署的源文件夹是 public
          publish_dir: ./public
```

#### 第三步：(仅需一次) 设定 GitHub Pages 的发布源

机器人现在会自动把网站发布到 `gh-pages` 这个分支了。我们需要告诉 GitHub Pages 去这个分支读取网站文件。

1. 访问你的仓库 `Settings` -> `Pages`
2. 在 `Build and deployment` -> `Source` 这里，选择 `Deploy from a branch`
3. 在下面的 `Branch` 下拉菜单中，选择 `gh-pages` 分支，然后点击 `Save`

> **提示**：如果暂时没有 `gh-pages` 分支，没关系。你先提交一次代码，让机器人运行一次，这个分支就会自动出现，你再回来设置即可。

---

### 总结：全新工作流

现在，你的博客之旅达到了一个全新的境界。

- **写作**：你只需要专注于在 `content/` 文件夹里创建和修改 Markdown 文件
- **发布**：你只需要 `git push`

就是这样。评论、部署、更新……所有的事情都已自动化。本地的 `deploy.ps1` 脚本可以光荣退役了（qwq）。

#### 第一步：在你的电脑上创作

想写新文章了？打开 PowerShell，进入 `D:\Projects\my-blog` 目录。

运行命令：
```powershell
hugo new content posts/你的新文章标题.md
```

在 VS Code 里打开这个新文件，把 draft: false，然后尽情写作。

#### 第二步：在你的电脑上提交


文章写完并保存后，在 PowerShell 终端里，运行我们最熟悉的三条命令：
```powershell
git add .
git commit -m "写了一篇关于...的新文章"
git push
```

#### 第三步：其他的一切，交给云端机器人

在你 `push` 成功的那一刻，你的所有工作就结束了。

- 你不需要管 `public` 文件夹
- 你不需要管 `gh-pages` 分支  
- 你不需要运行任何本地脚本

你的 GitHub Actions 机器人会自动被唤醒，在云端帮你完成所有构建和部署的脏活累活。几分钟后，你的新文章就会出现在全世界的面前。

---

### （Q）反问：登陆、安全和隐私呢？

> **（A）解答：** 这是静态博客和动态博客（比如 WordPress）最大的不同之处，也是它的核心优势。
>
> **登陆：** 静态博客没有后台登陆。因为你的网站就是一堆纯粹的 HTML 文件，没有任何数据库或服务器程序在运行。你管理博客的方式，就是修改本地的 Markdown 文件，然后通过 Git 推送。评论区的"登陆"，实际上是授权 Giscus 使用读者的 GitHub 账号，与你的网站本身无关。
>
> **安全：** 静态博客极其安全！这是它最爽的地方。黑客们常攻击的是网站的数据库、后台漏洞、服务器程序。而你的网站只是一堆静态文件，没有任何程序可以攻击。黑客无法"黑进"你的网站，因为根本"无门可入"。你的安全由 GitHub 这样的大公司保障，远比自己维护一台服务器要安全得多。
>
> **隐私：** 你的网站本身不收集任何访客信息。但你集成的第三方服务（比如 Giscus）有它们自己的隐私策略。这是一个很好的习惯：可以在博客上创建一个"关于"页面或"隐私"页面，简单说明你使用了 Giscus 进行评论，并链接到 GitHub 的隐私政策。

---

## 结语

最后用一句信达雅的名人名言结语：

> **Talk is cheap,show me the code.(废话少说，放码过来。)**
>          --Linus Torvalds

我们可以发现：只要根据报错的代码，一步步走下来，计算机确实就没有什么“黑魔法”，而你就是甘道夫。

Now,it's your turn.