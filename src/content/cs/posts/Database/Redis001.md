---
title: "Redis001 基础概念"
date: 2026-06-08T12:00:00+08:00
tags: ["Redis", "基础", "概念", "数据库" , "实践"]
categories: ["数据库"]
series: ["数数数据库"]
weight: 1
---

 **SQL** (Structured Query Language)，中文意思是 结构化查询语言，代表为关系型数据库 而 **NoSQL** 则是 非结构化查询语言，代表为非关系型数据库。

我们的 Redis 就是一个非关系型数据库。

> SQL 发音 belike：**C 阔~**

## SQL 与 NoSQL 对比

| 特性 | SQL | NoSQL |
| :--- | :--- | :--- |
| **数据结构** | 结构化 (Structured) | 非结构化 |
| **数据关联** | 关联的 (Relational) | 无关联的 |
| **查询方式** | SQL 查询 | 非 SQL |
| **事务特性** | ACID | BASE |
| **存储方式** | 磁盘 | 内存 |
| **扩展性** | 垂直 | 水平 |
| **使用场景** | 1) 数据结构固定<br>2) 相关业务对数据安全性、一致性要求较高 | 1) 数据结构不固定<br>2) 对一致性要求不高<br>3) 对性能要求较高 |

> **NoSQL 主要类型：**
> 1 键值类型 (Redis)
> 2 文档类型 (MongoDB)
> 3 列类型 (HBase)
> 4 Graph 类型 (Neo4j)

---

# Redis 初见

## 1. 简介与工作原理

### 核心特性

* **Redis(Remote Dictionary Server)**，中文：远程字典服务器。
* **定义**：高性能内存型键值（Key-Value）数据库。
* **主要用途**：缓存系统、分布式锁、消息队列、排行榜、Session 共享、限流系统、GEO 地理位置、延迟队列、分布式 ID 生成等。
* **五大优势**：基于内存读写极快、支持丰富的数据结构、单线程模型（无线程切换与锁竞争）、支持高并发（单机 QPS 可达 10W ~ 20W+）、支持集群与高可用。

### 工作流与高性能设计

```text
客户端请求 ──> [I/O 多路复用] ──> [单线程事件循环处理] ──> 返回结果
```

* **高效支撑**：基于内存访问 + 非阻塞 I/O 多路复用 + 高效数据结构（如 HashTable、SkipList、ZipList）。

---

## 2. 数据结构与应用场景映射

| 数据类型 | 特性说明 | 典型应用场景 / 核心机制 |
| :--- | :--- | :--- |
| **String**（字符串） | 最基础类型，二进制安全 | 缓存、计数器、分布式 ID、分布式锁（`SETNX`）、限流（`INCR`、`EXPIRE`） |
| **Hash**（哈希表） | 键值对集合，适合存储对象 | 用户信息、商品详情存储 |
| **List**（列表） | 双向链表，有序可重复 | 消息队列、异步削峰（双端操作） |
| **Set**（无序集合） | 无序去重集合，支持交差并集 | 去重、共同好友/共同关注计算 |
| **SortedSet**（ZSet） | 带权重分数（Score）的有序集合 | 游戏排行榜、热点文章/积分排行（按分数排序） |
| **Bitmap**（位图） | 基于 String 的位操作（0/1 状态） | 签到统计、用户在线状态记录 |
| **HyperLogLog** | 基数估计算法，极小内存占用 | 网页独立访客（UV）统计 |
| **GEO** | 地理位置坐标存储与计算 | 附近的人、距离计算 |
| **Stream** | 支持消费组（Consumer Group）的消息流 | 完备的消息队列（MQ） |

---

## 3. 数据持久化机制

| 持久化方式 | 实现原理 | 优缺点 / 特点 |
| :--- | :--- | :--- |
| **RDB (快照)** | 在指定的时间间隔内，将内存数据整体保存到磁盘 | **优**：恢复速度快、备份文件体积小。<br>**缺**：可能丢失最后一次快照后的修改。 |
| **AOF (追加日志)** | 实时记录每次写操作命令，重启时重新执行命令恢复 | **优**：数据安全性更高，数据丢失极少。<br>**缺**：文件体积大、恢复速度慢。 |
| **混合持久化** | RDB 快照 + AOF 增量日志 (Redis 4.0+ 支持) | 兼顾 RDB 的快速恢复与 AOF 的高数据安全性。 |

---

## 4. 主流数据库横向对比

### 4.1 Redis vs. MySQL

| 对比维度 | Redis | MySQL |
| :--- | :--- | :--- |
| **类型/介质** | 内存型 KV 数据库 | 关系型磁盘数据库 |
| **数据模型** | 键值对，多种复杂数据结构 | 二维数据表，支持复杂 SQL |
| **读写性能** | 极快（微秒级），QPS 10W+ | 较慢（毫秒级），QPS 几千~上万 |
| **事务与一致性**| 弱事务，最终一致性 | 强一致性事务（ACID） |
| **适用场景** | 缓存、高并发、非核心临时数据 | 核心业务数据持久化存储 |

### 4.2 Redis vs. MongoDB

| 对比维度 | Redis | MongoDB |
| :--- | :--- | :--- |
| **类型/格式** | 内存型键值数据库 | 磁盘文档数据库（BSON 格式） |
| **查询能力** | 较弱（主要基于 Key 定位） | 较强（支持多条件、复杂关联与索引） |
| **数据量/持久化**| 较小，内存容量受限，持久化可选 | 大数据量支持，默认持久化落盘 |
| **适用场景** | 缓存、排行榜、高吞吐计数 | 非结构化/半结构化大数据存储 |

### 4.3 Redis vs. Memcached

| 对比维度 | Redis | Memcached |
| :--- | :--- | :--- |
| **数据类型** | 丰富（String/Hash/List/Set/GEO等） | 仅支持 String 类型 |
| **功能支持** | 支持持久化、事务、发布订阅、Lua 脚本 | 仅纯缓存，不支持持久化、事务和脚本 |
| **集群架构** | 原生支持 Cluster 分布式 | 原生不支持，需依赖客户端或代理实现分布式 |
| **内存利用率** | 较高 | 较低 |

### 4.4 Redis vs. Elasticsearch (ES)

| 对比维度 | Redis | Elasticsearch |
| :--- | :--- | :--- |
| **类型/核心** | 键值数据库 | 分布式搜索引擎（基于倒排索引） |
| **核心能力** | 极速读写、临时缓存 | 深度文本检索、多维模糊查询与分析 |
| **模糊查询** | 不支持（仅支持简单通配符） | 极强 |
| **适用场景** | 高并发缓存、排行榜、临时队列 | 全文搜索系统、日志分析（ELK） |

---

## 5. 优缺点分析

| 优点 | 说明 | 缺点 | 说明 |
| :--- | :--- | :--- | :--- |
| **速度极快** | 基于内存读写 | **内存昂贵** | 硬件成本高 |
| **吞吐量大** | 单机可达 10W+ QPS | **容量有限** | 不适合存储超大规模数据 |
| **结构丰富** | 原生支持 9 大数据类型 | **数据易失** | 极端宕机情况下存在丢数据风险 |
| **高可用性** | 支持 Cluster、哨兵及持久化 | **查询受限** | 缺乏复杂 SQL 及多表关联支持 |

---

## 6. 缓存高可用常见问题及对策

| 问题类型 | 现象定义 | 解决方案 |
| :--- | :--- | :--- |
| **缓存穿透** | 查询**不存在**的数据，请求越过缓存直达数据库，造成数据库压力。 | ① **布隆过滤器**：拦截非法请求；<br>② **缓存空值**：对不存在的 Key 缓存短效空值。 |
| **缓存击穿** | **热点 Key** 失效瞬间，海量并发请求同时涌入数据库。 | ① **互斥锁**：使用分布式锁限制并发读取数据库；<br>② 设置热点数据**永不过期**。 |
| **缓存雪崩** | **大量 Key** 同时失效或 Redis 宕机，导致数据库瞬间瘫痪。 | ① **随机过期时间**：在原有失效时间上增加随机扰动；<br>② 部署 **Redis 高可用集群**保障服务可用。 |

---

## 7. 经典应用架构

在互联网高并发系统中，通常由 **Redis 负责"速度"，MySQL 负责"数据"**，其标准协作流如下：

```text
               用户请求 (Client)
                     │
                     ▼
             【 Redis 缓存层 】 ──── (命中直接返回，QPS 10W+)
                     │
                 (未命中)
                     ▼
             【 MySQL 数据库 】 ──── (落盘持久化，保证强一致性)
```

---

# WSL2 (Ubuntu 24.04) Redis 安装、配置与 C++ 客户端集成笔记

## 1. 安装最新稳定版 Redis

### 1.1 安装工具并导入官方 GPG 密钥

```bash
sudo apt-get update
sudo apt-get install -y lsb-release curl gpg
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
sudo chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg
```

### 1.2 添加官方 APT 软件源并安装

```bash
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install -y redis
```

---

## 2. 配置并启动 Redis 服务

### 2.1 编辑配置文件

编辑 `/etc/redis/redis.conf`：

```bash
sudo nano /etc/redis/redis.conf
```

**配置 0.0.0.0 监听**（允许外部连接）：

将 `bind 127.0.0.1 -::1` 修改为：

```text
bind 0.0.0.0
```

**配置密码**：

取消 `# requirepass foobared` 的注释，并修改为您的密码：

```text
requirepass zbh123456
```

**进程守护（Daemonize）**：

由于使用 systemd 托管，保持默认的 `daemonize no` 和 `supervised systemd` 即可。

### 2.2 启动服务与设置自启动

```bash
# 启动并设置自启动
sudo systemctl enable --now redis-server
```

### 2.3 连接验证测试

```bash
redis-cli -a zbh123456 ping
# 返回 PONG 即为成功
```

---

## 3. 编译配置 C++20 客户端 (redis-plus-plus)

### 3.1 安装编译环境与底层的 hiredis 开发包

必须提前安装，否则 C++ 库 CMake 会报错：

```bash
sudo apt install -y build-essential cmake git libhiredis-dev
```

### 3.2 源码编译安装 redis-plus-plus

```bash
git clone https://github.com/sewenew/redis-plus-plus.git
cd redis-plus-plus
mkdir build && cd build
# 指定使用 C++20 标准编译
cmake -DREDIS_PLUS_PLUS_CXX_STANDARD=20 ..
make
sudo make install
# 刷新动态库缓存
sudo ldconfig
```

---

## 4. 编写与编译 C++ 测试程序

### 4.1 创建测试项目

```bash
mkdir -p ~/redis_test && cd ~/redis_test
nano main.cpp
```

### 4.2 编写 main.cpp 代码

采用 C++20 语法，使用 `ConnectionOptions` 结构体进行连接，避免 URI 密码格式的解析歧义：

```cpp
#include <sw/redis++/redis++.h>
#include <iostream>
#include <string>
#include <optional>

int main()
{
    try
    {
        // 使用配置结构体，无需担心密码中的特殊字符和默认用户名问题
        sw::redis::ConnectionOptions opts;
        opts.host = "127.0.0.1";
        opts.port = 6379;
        opts.password = "yourpassword";  // 设置您的实际密码

        auto redis = sw::redis::Redis(opts);

        std::cout << "正在连接 Redis..." << std::endl;

        // 1. 测试 Ping
        std::string ping_res = redis.ping();
        std::cout << "Ping 测试结果: " << ping_res << std::endl;

        // 2. 写入数据
        redis.set("cpp20_key", "Hello Redis!");

        // 3. 读取数据
        auto val = redis.get("cpp20_key");
        if (val.has_value())
        {
            std::cout << "成功读取值: " << val.value() << std::endl;
        }

        // 4. 清理数据
        redis.del("cpp20_key");

    }
    catch (const sw::redis::Error &e)
    {
        std::cerr << "Redis 异常: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}
```

### 4.3 编译并运行

```bash
# 编译时必须链接 -lredis++ -lhiredis -pthread，并指定 -std=c++20
g++ -std=c++20 main.cpp -o test_redis -lredis++ -lhiredis -pthread

# 运行测试
./test_redis
```

# 总结一下

没啥可总结的，快点继续学习叭~