---
title: "Hugo + GitHub Pages 绑定自定义域名完整指南"
date: 2026-03-03T12:00:00+08:00
draft: false
tags: ["hugo", "github-pages", "cloudflare", "domain", "运维"]
categories: ["运维"]
---

## 前言

之前博客一直用 GitHub Pages 默认的域名 `QwQBiG.github.io`，虽然免费，但总觉得不够专业。既然已经在 Cloudflare 买了 `iqwqi.win`，就决定把博客绑定到这个域名上。这里把配置流程和容易卡住的地方记下来，方便以后重配时查。

## 准备工作

### 现有环境

- **博客框架**：Hugo
- **托管平台**：GitHub Pages
- **域名注册及 DNS 管理**：Cloudflare
- **原域名**：`QwQBiG.github.io`
- **新域名**：`iqwqi.win`

博客已经能通过默认域名访问。开始前，先打开仓库的 **Settings → Pages**，看一下 **Build and deployment → Source** 里现有的发布来源。后面的 `CNAME` 文件和部署方式要按这一项处理，绑定域名本身不要求更换发布流程。[GitHub 发布来源说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

### 配置目标

- 用 `iqwqi.win` 访问博客。
- 访问 `www.iqwqi.win` 时，自动跳转到主域名。
- 从 `QwQBiG.github.io` 访问时，跳转到新域名。
- 启用 HTTPS，并将 HTTP 访问转到 HTTPS。

## 配置步骤

### 第一步：在 GitHub Pages 中添加域名

先打开原博客仓库的 **Settings → Pages**，在 **Custom domain** 中填入：

```text
iqwqi.win
```

点击 **Save**。这里只填域名，不加 `https://` 或路径。此时 DNS 还没改，检查暂未通过也可以继续往下配置。

GitHub 要求先在 Pages 中添加自定义域名，再到 DNS 服务商那里设置指向。[GitHub 自定义域名配置说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#about-custom-domain-configuration)

### 第二步：修改 Hugo 配置

编辑项目里的 `hugo.toml`，把原来的 `https://QwQBiG.github.io/` 改成新地址：

```toml
baseURL = "https://iqwqi.win/"
```

`baseURL` 是网站正式发布的地址，末尾保留 `/`。Hugo 会据此生成需要站点地址的链接；菜单、主题配置或文章里手动写死的旧域名，还需要另外检查。[Hugo 的 baseURL 配置说明](https://gohugo.io/configuration/all/#baseurl)

### 第三步：按发布来源处理 CNAME 文件

如果 Pages 的 **Source** 是 **Deploy from a branch**，最终发布目录的根目录中需要有一个全大写、无后缀的 `CNAME` 文件。在 Hugo 项目的 `static/` 目录下保留它，可以让后续构建继续带上域名配置：

```text
static/
└── CNAME
```

文件只写一行：

```text
iqwqi.win
```

不要加协议、路径或第二个域名。按 Hugo 的默认目录设置构建后，它会被复制为 `public/CNAME`。[Hugo 静态文件目录说明](https://gohugo.io/getting-started/directory-structure/#directories)

在 Pages 设置中保存域名时，GitHub 可能已经向发布分支提交了 `CNAME`。如果你在本地维护这个分支，先同步该提交，再继续发布，避免后续构建把它覆盖掉。

如果 **Source** 是 **GitHub Actions**，由自定义工作流直接部署 Pages，则不需要这个文件，已有的 `CNAME` 也会被忽略，域名以 Pages 设置为准。即使有 Actions 参与构建，只要 Pages 最后仍从分支发布，就还是按分支发布处理。[GitHub 的 CNAME 文件说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages#cname-errors)

### 第四步：配置 Cloudflare DNS

登录 [Cloudflare Dashboard](https://dash.cloudflare.com)，选择 `iqwqi.win`，进入 **DNS → Records**。

#### 添加 A 记录

这里用 A 记录把主域名指向 GitHub Pages，名称中的 `@` 代表 `iqwqi.win`：

| 类型 | 名称 | IPv4 地址 | 代理状态 |
| --- | --- | --- | --- |
| A | @ | 185.199.108.153 | 仅 DNS |
| A | @ | 185.199.109.153 | 仅 DNS |
| A | @ | 185.199.110.153 | 仅 DNS |
| A | @ | 185.199.111.153 | 仅 DNS |

这些是 [GitHub 官方文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain) 当前列出的 IPv4 地址，以后重配时仍应以官方列表为准。

检查一下 `@` 是否还留着指向其他主机的旧 A、AAAA 记录，避免它们干扰访问或证书配置。本文只配置 IPv4，不必额外添加 AAAA；已有但指向错误地址的 AAAA 记录也要处理。[GitHub 的 HTTPS DNS 配置说明](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https#verifying-the-dns-configuration)

#### 添加 www 的 CNAME 记录

| 类型 | 名称 | 目标 | 代理状态 |
| --- | --- | --- | --- |
| CNAME | www | QwQBiG.github.io | 仅 DNS |

目标直接填 `QwQBiG.github.io`，不带协议、仓库名或路径。[GitHub 的 www 配置说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain-and-the-www-subdomain-variant)

Pages 中的主域名设为 `iqwqi.win`，主域名和 `www` 的 DNS 都配好后，GitHub Pages 会把 `www.iqwqi.win` 的访问自动转到 `iqwqi.win`。[GitHub 对主域名与 www 跳转的说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages#using-an-apex-domain-for-your-github-pages-site)

本次配置把上述记录都设成 **仅 DNS**，也就是灰色云。这样 Cloudflare 只负责解析，网站流量直接到 GitHub Pages，查询时看到的也是 GitHub 的地址。[Cloudflare 代理状态说明](https://developers.cloudflare.com/dns/proxy-status/)

### 第五步：部署更新后的博客

在 Hugo 项目根目录构建网站：

```bash
hugo
```

构建完成后，沿用原来的发布方式：使用 Actions 直接部署时，提交并推送修改后的源文件，让现有流程完成构建和发布；使用分支发布时，把生成文件更新到 Pages 指定的分支和目录。现有构建命令如果传了 `--baseURL`，也要确认它使用的是新地址。[Hugo 部署到 GitHub Pages](https://gohugo.io/host-and-deploy/deploy-to-github-pages/)

只有当 `public/` 本来就是单独的发布仓库，而且 Pages 从该仓库的根目录发布时，下面这组命令才适用：

```bash
cd public
git add -A
git commit -m "chore: configure custom domain iqwqi.win"
git push
```

### 第六步：启用 HTTPS

回到 **Settings → Pages**，查看自定义域名的 DNS 检查和证书状态。证书准备好、**Enforce HTTPS** 可以勾选后，将它启用，HTTP 请求就会转到 HTTPS。[GitHub HTTPS 设置说明](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https#enforcing-https-for-your-github-pages-site)

这个选项可能不会立即出现。GitHub 文档提示，自定义域名配置后，最长可能需要 24 小时才可启用。[GitHub 自定义域名配置说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)

## 验证配置

### 1. 检查 DNS 解析

```bash
nslookup iqwqi.win
nslookup -type=CNAME www.iqwqi.win
```

主域名的解析地址应与上面的 GitHub Pages IP 对应；`www` 的 CNAME 应指向 `QwQBiG.github.io`。

### 2. 检查 CNAME 文件

分支发布时，检查最终发布目录根目录里的 `CNAME`。如果使用默认输出目录，可以在 Hugo 项目根目录运行：

```bash
cat public/CNAME
```

内容应只有 `iqwqi.win`。还要确认部署后的发布分支里保留了这个文件。使用 Actions 直接部署 Pages 时，可以跳过这一项。

### 3. 检查页面、跳转和 HTTPS

```bash
curl -I https://iqwqi.win/
curl -I https://www.iqwqi.win/
curl -I https://QwQBiG.github.io/
curl -I http://iqwqi.win/
```

主域名应返回正常响应。检查其他入口的响应头，看看 `Location` 是否把访问带到主域名或 HTTPS 地址，再用浏览器分别打开这些地址，确认最终进入 `https://iqwqi.win/`。

除了首页，也点开一篇文章，检查链接、图片和样式是否正常，浏览器是否出现证书警告。这里只列出验证方法，实际结果要以配置后的响应和页面为准。

## 常见问题

### Q1：DNS 检查一直失败？

先核对这几项：

- Cloudflare 中主域名的四条 A 记录是否正确，`www` 的 CNAME 是否直指 `QwQBiG.github.io`。
- 上述记录是否都保持 **仅 DNS**，有没有旧的 A、AAAA 记录指向其他主机。
- Pages 的 **Custom domain** 是否仍是 `iqwqi.win`。

刚改完 DNS 时，还要给缓存更新留出时间。GitHub 文档说明，DNS 变更传播可能需要最长 24 小时。[GitHub DNS 配置说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#about-custom-domain-configuration)

### Q2：HTTPS 证书无法签发？

先确认 DNS 检查通过，并保持本文使用的 **仅 DNS** 配置。若记录被改成了代理状态，先切回灰色云，再检查 Pages 的证书状态。

如果域名配置过 CAA 记录，还要确认它允许 `letsencrypt.org` 签发证书；没有 CAA 记录时，不需要为了这一步专门添加。DNS 已纠正却仍卡在证书配置时，可以按官方排障建议，移除并重新添加 Pages 中的自定义域名，重新触发证书配置。[GitHub 证书排障说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages#https-errors)

### Q3：旧域名无法跳转？

先确认设置自定义域名的仓库，就是原来提供 `QwQBiG.github.io` 站点的仓库。域名跳转由 GitHub Pages 处理，只修改 Hugo 的 `baseURL` 还不够。

检查 Pages 中的域名设置和最近一次部署是否成功；分支发布还要检查 `CNAME` 是否被覆盖。再用前面的 `curl -I` 查看旧地址的响应头，确认是否有指向新域名的 `Location`。如果响应已经正确、浏览器却还停留在旧地址，可以清理缓存后再试。[GitHub 自定义域名排障说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)

### Q4：如何同时使用其他子域名？

可以继续给其他服务分配子域名。例如，`api.iqwqi.win` 可以用 A 记录指向实际提供 API 的服务器，这与博客的主域名配置分开管理。

如果希望 `blog.iqwqi.win` 也跳转到这个博客，需要另设 HTTP 重定向。CNAME 只负责 DNS 中的域名映射，单独加一条指向主域名的 CNAME，不会产生网页跳转；同一个 Pages 站点同时使用主域名和任意子域名也不受支持，`www` 是例外。[Cloudflare CNAME 说明](https://developers.cloudflare.com/dns/manage-dns-records/reference/dns-record-types/#cname)、[GitHub 支持的域名组合](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages#custom-domain-names-that-are-unsupported)

要用 Cloudflare 的 **Redirect Rules** 实现这个跳转，`blog` 这条记录需要开启代理，让请求经过 Cloudflare；这是另外一项配置，按 [Cloudflare 重定向规则文档](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-dashboard/) 操作即可。

## 总结

这次绑定需要让 Hugo、GitHub Pages 和 DNS 三边使用一致的地址：

1. 先在 GitHub Pages 中保存 `iqwqi.win`。
2. 修改 Hugo 的 `baseURL`。
3. 分支发布时保留 `static/CNAME`，确保构建产物中也有它。
4. 在 Cloudflare 配置主域名的 A 记录和 `www` 的 CNAME。
5. 沿用现有方式部署更新后的博客。
6. 启用 HTTPS，并检查页面与跳转。

做完后，除了确认主域名能打开，也检查一下 `www.iqwqi.win` 和 `QwQBiG.github.io` 两个入口，避免只看首页就漏掉跳转或旧链接的问题。

## 参考链接

- [GitHub Pages 自定义域名配置](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages 自定义域名排障](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)
- [GitHub Pages HTTPS 设置](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- [Hugo 部署到 GitHub Pages](https://gohugo.io/host-and-deploy/deploy-to-github-pages/)
- [Cloudflare DNS 文档](https://developers.cloudflare.com/dns/)