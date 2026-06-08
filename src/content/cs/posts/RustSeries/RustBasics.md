---
title: "Rust 与 Axum"
date: 2025-10-01T10:00:00+08:00
tags: ["Rust", "基础", "库函数", "编程语言", "后端"]
categories: ["语言学习"]
series: ["Rust 蟹蟹"]
weight: 1
---

# Axum HelloWorld 项目笔记

## 1. 创建项目
```bash
cargo new axum-helloworld
cd axum-helloworld
```

## 2. 配置依赖 (`Cargo.toml`)
```toml
[package]
name = "axum-helloworld"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.8.9"
tokio = { version = "1", features = ["full"] }
```

## 3. 编写代码 (`src/main.rs`)
```rust
use axum::{routing::get, Router, serve};
use std::net::SocketAddr;
use tokio::net::TcpListener;

// 定义路由处理函数
async fn hello_world() -> &'static str {
    "Hello, World!"
}

#[tokio::main]
async fn main() {
    // 创建路由
    let app = Router::new().route("/", get(hello_world));
    
    // 绑定地址并启动服务器
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    let listener = TcpListener::bind(addr).await.unwrap();
    serve(listener, app.into_make_service()).await.unwrap();
}
```

## 4. 运行项目
```bash
cargo run
```

访问 `http://127.0.0.1:3000` 即可看到 "Hello, World!"

---

**关键知识点：**
- `Router`：路由管理器
- `route("/", get(handler))`：绑定 GET 请求到根路径
- `serve()`：启动服务器（Axum 0.8.x 新 API）
- `#[tokio::main]`：启用异步运行时（Tokio）