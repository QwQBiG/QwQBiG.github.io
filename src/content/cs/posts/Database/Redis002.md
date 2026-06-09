---
title: "Redis002 客户端"
date: 2026-06-09T12:00:00+08:00
tags: ["Redis", "基础", "操作", "数据库", "客户端"]
categories: ["数据库"]
series: ["数数数据库"]
weight: 2
---

# Redis 客户端

## 命令行客户端

### 一、如何打开命令行客户端

因为在上一个文章中我们设置了密码 `yourpassword`，现在打开客户端主要有以下两种方式：

#### 方式 A：安全输入方式（推荐，无安全警告）
在终端中直接输入 `redis-cli` 进入交互界面，然后再输入密码进行验证：
```bash
redis-cli
```
进入后，命令行提示符会变成 `127.0.0.1:6379>`，此时输入 `auth` 命令并跟上您的密码：
```text
127.0.0.1:6379> auth yourpassword
OK
```
出现 `OK` 即表示验证成功，可以开始操作。

#### 方式 B：一步到位方式（会有安全警告）
在启动命令中直接携带 `-a` 参数和密码：
```bash
redis-cli -a yourpassword
```
*提示：这种方式会在终端显示一条“在命令行中使用密码可能不安全”的警告信息，但在本地开发环境下使用非常方便。*

---

### 二、简单演示

验证通过后，您就进入了交互式命令行状态。以下是一个最基本的存取数据和退出的流程演示：

```text
127.0.0.1:6379> set mykey "hello"
OK

127.0.0.1:6379> get mykey
"hello"

127.0.0.1:6379> exit
```

**说明**：
* `set mykey "hello"`：向 Redis 中存入一个键为 `mykey`，值为 `"hello"` 的数据。
* `get mykey`：获取键为 `mykey` 的数据。
* `exit`（或 `quit`）：退出 Redis 命令行客户端，返回到 Ubuntu 终端。

针对 WSL2 环境，最方便的方式是将图形化客户端直接安装在您的 **Windows 宿主机**上，然后直接连接 `127.0.0.1:6379` 即可（WSL2 会自动将端口转发到 Windows 本地）。

## 图形化客户端：

### 推荐一：Redis Insight (官方免费客户端)
这是 Redis 官方推出并维护的图形化管理工具，功能非常强大，对开发者完全免费。

* **特点**：
  * 官方出品，支持 Redis 所有的最新特性（包括 JSON、Stream 等数据结构）。
  * 界面极具现代感，内置了可视化的 CLI 命令行（带智能提示）。
  * 包含内存分析、慢日志监控、Pub/Sub（发布订阅）可视化等进阶功能。
* **下载途径**：
  * 或者访问官方网站：[https://redis.io/insight/](https://redis.io/insight/)

---

### 推荐二：Another Redis Desktop Manager (极简开源客户端)
这是一款非常轻量、启动极快、性能出众的开源客户端。

* **特点**：
  * 运行非常流畅，在大数据量（加载成千上万个 Key）时也不容易卡顿。
  * 界面简洁明了，没有多余的复杂功能，非常适合日常快速查看和修改数据。
* **下载途径**：
  * 国内推荐通过 **Gitee** 下载最新发布版：[https://gitee.com/qishibo/AnotherRedisDesktopManager/releases](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases)
  * 境外推荐通过 **GitHub** 下载：[https://github.com/qishibo/AnotherRedisDesktopManager/releases](https://github.com/qishibo/AnotherRedisDesktopManager/releases)

---

### 三、如何在客户端中配置连接？

下载并安装好上述任意一款客户端后，打开它并新建连接（Create Connection），填写以下信息即可：

1. **Host (主机名/IP)**: `127.0.0.1` （直接填写本地 IP 即可，WSL2 默认支持此环回地址连接）
2. **Port (端口)**: `6379`
3. **Connection Name (连接别名)**: 例如 `MyRedis` （选填）
4. **Auth / Credentials (验证)**:
   * **Username**: `default` （如果客户端要求填写用户名）
   * **Password**: `yourpassword` （你滴 Redis 密码）

点击 **Test Connection** 测试，连接成功后保存即可开始图形化管理。

# 总结一下

还是没有什么，继续学习叭~
