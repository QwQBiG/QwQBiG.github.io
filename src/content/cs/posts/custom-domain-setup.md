---
title: "Hugo + GitHub Pages 绑定自定义域名完整指南"
date: 2026-03-03T12:00:00+08:00
draft: false
tags: ["hugo", "github-pages", "cloudflare", "domain", "运维"]
categories: ["运维"]
---

## 前言

之前一直使用 GitHub Pages 默认的域名 `QwQBiG.github.io`，虽然免费但不够专业。毕竟在 Cloudflare 买了 `iqwqi.win` 域名，决定将博客绑定到这个自定义域名上。本文详细记录整个配置流程。

## 准备工作

### 现有环境
- **博客框架**: Hugo
- **托管平台**: GitHub Pages
- **域名注册**: Cloudflare
- **原域名**: `QwQBiG.github.io`
- **新域名**: `iqwqi.win`

### 配置目标
- 主域名 `iqwqi.win` 访问博客
- `www.iqwqi.win` 自动跳转到主域名
- `QwQBiG.github.io` 自动跳转到新域名
- 启用 HTTPS

## 配置步骤

### 第一步：修改 Hugo 配置

编辑 `hugo.toml` 文件，修改 `baseURL`：

```toml
# 修改前
baseURL = "https://QwQBiG.github.io/"

# 修改后
baseURL = "https://iqwqi.win/"
```

**作用**: 确保生成的所有链接都使用新域名。

### 第二步：创建 CNAME 文件

在 `static/` 目录下创建 `CNAME` 文件（无后缀）：

```text
static/
└── CNAME          # 新建此文件
```

文件内容：

```text
iqwqi.win
```

**作用**: GitHub Pages 通过此文件识别自定义域名。

### 第三步：配置 Cloudflare DNS

登录 [Cloudflare Dashboard](https://dash.cloudflare.com)，选择域名后进入 DNS 设置：

#### 添加 A 记录

GitHub Pages 的 IP 地址（请查询官方文档获取最新地址）：

| 类型 | 名称 | IPv4 地址 | 代理状态 |
|------|------|-----------|----------|
| A | @ | 185.199.108.xxx | 仅 DNS |
| A | @ | 185.199.109.xxx | 仅 DNS |
| A | @ | 185.199.110.xxx | 仅 DNS |
| A | @ | 185.199.111.xxx | 仅 DNS |

> **获取最新 IP**: 访问 [GitHub Pages 文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) 获取当前有效 IP

#### 添加 CNAME 记录

| 类型 | 名称 | 目标 | 代理状态 |
|------|------|------|----------|
| CNAME | www | @ | 仅 DNS |

**重要提示**:
- 代理状态选择"仅 DNS"（灰色云），不要开启代理
- 如果开启 Cloudflare 代理，GitHub 无法自动签发 HTTPS 证书

### 第四步：GitHub Pages 设置

1. 打开仓库的 Settings → Pages
2. 在 **Custom domain** 处输入：`iqwqi.win`
3. 点击 **Save**
4. 等待 DNS 检查通过（显示绿色勾选）
5. 勾选 **Enforce HTTPS**

**注意**: HTTPS 证书签发可能需要几分钟到几小时。

### 第五步：部署网站

```bash
# 构建网站
hugo

# 进入 public 目录
cd public

# 提交更改
git add -A
git commit -m "chore: configure custom domain iqwqi.win"

# 推送到 GitHub
git push
```

## 验证配置

### 1. 检查 DNS 解析

```bash
nslookup iqwqi.win
```

应返回 GitHub 的 IP 地址。

### 2. 检查 CNAME 文件

```bash
curl -I https://iqwqi.win/CNAME
```

### 3. 浏览器访问

- 访问 `https://iqwqi.win` 应正常显示博客
- 地址栏应显示 HTTPS 安全锁

## 常见问题

### Q1: DNS 检查一直失败？
- 等待 DNS 传播（通常 10-30 分钟）
- 检查 Cloudflare 代理是否关闭
- 确认 A 记录 IP 地址正确

### Q2: HTTPS 证书无法签发？
- 确保 DNS 检查已通过
- 确保 Cloudflare 代理处于关闭状态
- 等待 24 小时后重试

### Q3: 旧域名无法跳转？
GitHub Pages 会自动将旧域名 301 跳转到新域名，无需额外配置。

### Q4: 如何同时使用子域名？
可以在 Cloudflare 添加其他子域名记录：

```
api.iqwqi.win     → 其他服务器 IP
blog.iqwqi.win    → CNAME 到主域名
```

## 总结

绑定自定义域名的关键步骤：

1. ✅ 修改 Hugo `baseURL`
2. ✅ 创建 `static/CNAME` 文件
3. ✅ Cloudflare 添加 DNS 记录
4. ✅ GitHub Pages 设置自定义域名
5. ✅ 启用 HTTPS
6. ✅ 部署网站

现在博客可以通过 `https://iqwqi.win` 访问了！🎉

## 参考链接

- [GitHub Pages 自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Hugo 部署到 GitHub Pages](https://gohugo.io/hosting-and-deployment/hosting-on-github/)
- [Cloudflare DNS 设置](https://developers.cloudflare.com/dns/)
