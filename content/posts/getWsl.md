---
title: "搞搞WSL"
date: 2025-12-18T12:00:00+08:00
tags: ["Windows", "白嫖","WSL","教程","指南","Linux"]
categories: ["技术实践"]
---

# 我要玩臭企鹅（Linux）
> 咕咕嘎嘎

紧接着上一篇内容（必须要专业版哦）：
**[Windows家庭版激活成专业版](/posts/professionalEditionWindows/)**

高雅人士们虽然有很多虚拟机软件来玩`Linux`，也比较好使，但是还是想试试`win`自带的`WSL`对不对~
好b（￣▽￣）d~　启动~

由于**网络原因**，所以我来分步安装而不去使用直接安装的代码，可以试试（大概没用）：
```bash
wsl --install
```

## 1.功能启用
在搜索框搜索 “启用或关闭 Windows 功能” 并打开。
勾选以下**两**项：
    适用于 Linux 的 Windows 子系统
    虚拟机平台
点击确定，系统会配置组件，完成后 必须**重启**电脑

## 2.手动下载安装 WSL2 内核更新包
以下是网址：
打开`GitHub`：
`https://github.com/microsoft/WSL/releases`
寻找最新版本（例如 2.3.26 或你看到的最新版）：
在 Assets 栏目下，点击下载：wsl.2.3.26.x64.msi (文件名根据版本号可能略有不同)。
直接下载链接 (如果版本已更新可能失效)： wsl.x64.msi
下载完成后，双击运行该 .msi 文件进行安装。

## 3.设置 WSL2 为默认版本
安装完更新包后，右键点击“开始”按钮，选择 终端（**管理员**），输入并回车：
```Powershell
wsl --set-default-version 2
```

## 4.下载Ubuntu镜像
这个是主网址：
`https://cdimages.ubuntu.com/ubuntu-wsl/`
找到`Index of /ubuntu-wsl/noble/daily-live`再点击`current/`
点击下载`noble-wsl-amd64.wsl`
（不会找可以点这个链接：`https://cdimages.ubuntu.com/ubuntu-wsl/noble/daily-live/current/`）

## 5.使用命令行安装
下载完成后，找到文件夹中。请打开 PowerShell（**管理员**），先切换到这个文件夹：
例如在D盘：
```bash
cd D:
```
然后运行以下命令：
```bash
wsl --install --from-file .\noble-wsl-amd64.wsl --name Ubuntu-24.04
```

## 6.撒花！
根据提示建一个用户就可以玩啦！
并且，他会有“欢迎使用WSL”的弹窗，里面会有一些介绍哒~