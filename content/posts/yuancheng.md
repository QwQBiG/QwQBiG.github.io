---
title: "远程失灵了"
date: 2025-11-29T10:00:00+08:00
tags: ["运维", "Linux"]
categories: ["语言学习"]
series: ["运维"]
---

# Docker 部署 FRP 客户端终极避坑指南

**适用于：** Linux (Ubuntu/CentOS) + Docker 环境，目标是穿透本地 SSH 或其他服务。

## 核心结论

**不要使用 Docker 默认的网络模式，直接使用 Host 模式 + 强制指定 DNS。**

这将解决：容器内网不通、DNS 解析失败、路由器重启导致 IP 变动失效等所有常见问题。

## 1. 部署命令 (黄金标准版)

直接复制替换参数，一步到位：

```bash
sudo docker run -d \
  --name frp-client \
  --restart=always \
  --network host \
  --dns 223.5.5.5 \
  --dns 8.8.8.8 \
  vaalacat/frp-panel \
  client -s <你的服务端Key> \
  -i <你的客户端ID> \
  --api-url <面板API地址> \
  --rpc-url <面板RPC地址>
```

**本地地址 (Local IP):** 填 `127.0.0.1`

**原因：** 配合 Host 模式，`127.0.0.1` 永远指向本机。即使路由器分配的局域网 IP 变了（如 `.12` 变 `.13`），配置依然有效。

**本地端口 (Local Port):** 填 `22` (SSH) 或其他真实端口

**远程端口 (Remote Port):** 填公网服务器已放行的端口 (如 `8080`, `2222` 等)

## 3. 故障排查速查表

如果状态不是 Online，按以下顺序检查：

**看日志 (唯一真理):**
```bash
sudo docker logs --tail 20 frp-client
```

**常见报错及对策：**

- `dns lookup error` / `i/o timeout`: 没加 `--dns` 参数，容器断网了。
- `connect to server failed`: 公网服务器挂了，或参数填错。
- `connect to 127.0.0.1:22 connection refused`: 没加 `--network host` 参数，容器里找不到 SSH 服务。
- `remote port is already in use`: 公网端口被占，去网页换个远程端口。

## 一句话总结：

**Docker 跑 FRP，认准 `--network host` 和 `--dns`，内网 IP 填 `127.0.0.1`，永远不掉线。**