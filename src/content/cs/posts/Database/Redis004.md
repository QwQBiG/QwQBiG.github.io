---
title: "Redis004 常见命令"
date: 2026-06-09T18:00:00+08:00
tags: ["Redis", "基础", "操作", "数据库", "层级", "设计模式"]
categories: ["数据库"]
series: ["数数数据库"]
weight: 4
---

# Redis 键（Key）命名规范与多层级结构设计

在关系型数据库（如 MySQL）中，数据是通过“数据库（Database）-> 数据表（Table）-> 行（Row）-> 列（Column）”这种天然的树状结构来组织和隔离的。

然而，**Redis 是一个扁平的 Key-Value（键值对）存储空间**，它在物理上没有“表（Table）”的概念。为了在 Redis 中优雅地组织不同类型、不同业务的数据，我们必须引入**层级命名规范**（利用特定的分隔符，通常是冒号 `:`）来人为构造出命名空间（Namespace）。

---

## 一、 经典多层级命名模板

推荐在项目中使用以下标准的多段式命名法，各段之间使用 **冒号 `:`** 进行分割：

`[系统或应用名]:[业务模块]:[数据实体或表名]:[唯一标识或主键]:[属性或子后缀]`

* **`[系统或应用名]`**：避免多套系统共用同一个 Redis 实例时产生 Key 冲突。
* **`[业务模块]`**：例如：用户（usr/user）、订单（ord/order）、商品（prod/goods）、授权（auth）。
* **`[数据实体或表名]`**：对应 MySQL 中的表名。
* **`[唯一标识或主键]`**：对应具体某行记录的唯一 ID（如用户 ID、订单号）。
* **`[属性或子后缀]`**：*(非必填)* 仅当需要区分同一实体的不同维度或子类型时使用。

---

## 二、 MySQL 数据向 Redis Key 转换示例

下面展示了如何将关系型数据库中的表设计转换为 Redis 中的多层级 Key 设计：

| 业务场景 | MySQL 数据源 | 转换后的 Redis Key 设计 | 推荐 Redis 数据类型 | 数据值或作用说明 |
| :--- | :--- | :--- | :--- | :--- |
| **用户信息** | `user` 表中 `id=100` 的一行记录 | `mall:usr:info:100` | **`Hash`** <br>(Hash / 哈希) | 存储用户多维属性，如姓名、年龄、邮箱 |
| **用户短信验证码** | `verify_code` 表中给手机号 `138xxx` 发送的验证码 | `mall:auth:code:138xxxxxxxx` | **`String`** <br>(String / 字符串) | 存储 6 位验证码，并设置 **`EX`**<br>(Expire / 过期时间) 为 60 秒 |
| **商品库存数量** | `goods` 表中 `id=88` 的商品的库存 | `mall:prod:stock:88` | **`String`** <br>(String / 字符串) | 存储库存数值，方便通过 **`DECR`**<br>(Decrement / 递减) 实现秒杀扣减 |
| **用户购物车** | `cart` 表中 `user_id=100` 的购物车商品及数量 | `mall:cart:items:100` | **`Hash`** <br>(Hash / 哈希) | 键为商品 ID，值为加购数量 |
| **最新活动报名列表** | `activity_signup` 表中活动 `id=99` 的最新报名用户 | `mall:act:signup:99` | **`List`** <br>(List / 列表) | 用 **`LPUSH`**<br>(Left Push / 左侧头部插入) 存储最新报名的用户 ID 列表 |

---

## 三、 图形化客户端中的自动树状渲染

冒号 `:` 不仅在语义上代表层级，Redis 所有的主流图形化客户端（如 Redis Insight、Another Redis Desktop Manager）都会自动将冒号 `:` 识别为 **目录分隔符（Directory Separator）**。

例如，如果您写入了以下三个 Key：
1. `mall:usr:info:100`
2. `mall:usr:info:101`
3. `mall:prod:stock:88`

在图形界面中，它们不会杂乱无章地平铺，而是会被自动收纳在清晰的树形目录结构中：

```text
📁 mall
  ├── 📁 prod
  │     └── 📁 stock
  │           └── 📄 88  (String 对象)
  └── 📁 usr
        └── 📁 info
              ├── 📄 100  (Hash 对象)
              └── 📄 101  (Hash 对象)
```
这彻底解决了没有 Table 导致数据难以维护、难以全局查阅的痛点。

---

## 四、 C++ 开发者视角的最佳实践

### 1. 控制 Key 的长度（精简命名）
Redis 的 Key 是常驻于内存中的，Key 占据的每一个字节都会消耗内存空间。如果 Key 极其冗长，在有数百万个 Key 的情况下，单是 Key 自身就会浪费数 GB 内存。
* ❌ **反面教材**：`e_commerce_shopping_mall_system:user_profile_information_module:user_id_number:10086`
* ✔️ **正面推荐**：`mall:usr:info:10086` （使用业务缩写，既具备可读性，又节省宝贵的内存）。

### 2. 命名的一致性（使用 C++ 构建器模式）
在 C++ 后端项目中，绝不要让开发人员在各个业务代码中手动拼接 Key 字符串，极易因拼写错误导致逻辑 Bug。推荐在代码中封装统一的 Key 生成器类（KeyBuilder）：

```cpp
#include <string>

class RedisKeyBuilder
{
public:
    // 获取用户基本信息 Key
    static std::string GetUserInfoKey(uint64_t userId)
    {
        return "mall:usr:info:" + std::to_string(userId);
    }
    
    // 获取商品库存 Key
    static std::string GetProductStockKey(uint64_t productId)
    {
        return "mall:prod:stock:" + std::to_string(productId);
    }
};

// 业务调用示例
std::string userKey = RedisKeyBuilder::GetUserInfoKey(10086); // 返回 "mall:usr:info:10086"
```

### 3. 使用大括号 `{}` 锁定哈希槽（集群模式进阶）
如果您未来的 C++ 服务连接的是 **Redis Cluster（集群模式）**，集群是通过对 Key 进行哈希计算并分配到 16384 个哈希槽（Hash Slot）上的。
* 默认情况下，`mall:usr:info:10086` 和 `mall:usr:history:10086` 计算出的哈希值不同，会被分配到不同的集群节点上，此时您无法使用批量操作或事务。
* **解决方案**：使用 **`{}`**（Hash Tag / 哈希标签）。Redis 在计算哈希槽时，**只会计算大括号 `{}` 内的字符**。
  * 将 Key 命名为：`mall:usr:{10086}:info` 和 `mall:usr:{10086}:history`。
  * 这样可以确保同一个用户的所有相关数据，绝对被分配到**同一个 Redis 节点**上，方便在 C++ 端进行高性能的多键原子操作。

# 总结一下

依旧不总结~