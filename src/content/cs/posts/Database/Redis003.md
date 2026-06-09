---
title: "Redis003 常见命令"
date: 2026-06-09T16:00:00+08:00
tags: ["Redis", "基础", "操作", "数据库", "命令"]
categories: ["数据库"]
series: ["数数数据库"]
weight: 3
---

# 如何查找文档

1. Redis 官方的文档链接：[https://redis.io/docs/latest/](https://redis.io/docs/latest/)

2. 或者在 Redis 命令行中输入 `help` 查看所有命令。

---

# Redis 的通用命令

查找通用命令只要在方才的两个地方找 `generic` 的命令分类，或者命令行输入 `help @generic` 即可。

那如果你不知道某一个命令的详细信息，也可以在 Redis 命令行中输入 `help <command>` 查看该命令的详细信息。

在 Redis 中，通用命令是指**不针对特定数据结构**（如 String、List、Hash 等），而是用于管理和操作 Key 本身的指令。

---

## 1. 键查询与探测

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`EXISTS`** <br>(Exists / 存在性检查) | `EXISTS key [key ...]` | 判断一个或多个键是否存在。返回存在的键的数量。 | `EXISTS mykey` |
| **`TYPE`** <br>(Type / 数据类型) | `TYPE key` | 返回键的数据类型（如 `string`、`hash`、`list`、`set`、`zset`）。 | `TYPE mykey` |
| **`KEYS`** <br>(Keys / 键查询) | `KEYS pattern` | 查找所有符合给定模式的键。例如 `KEYS *` 会列出所有键。 | `KEYS user:*` |

> ⚠️ **生产环境安全警告（`KEYS` 命令）**：
> 在包含大量 Key 的生产环境数据库中，绝对不要运行 `KEYS *`。该命令会阻塞 Redis 单线程服务器，导致其他所有客户端请求超时。如果需要检索 Key，请使用非阻塞的 **`SCAN`** <br> (Scan / 渐进式扫描) 命令。

---

## 2. 键删除与修改

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`DEL`** <br>(Delete / 同步删除) | `DEL key [key ...]` | 同步删除一个或多个键。返回被成功删除的键的数量。 | `DEL key1 key2` |
| **`UNLINK`** <br>(Unlink / 异步删除) | `UNLINK key [key ...]` | **非阻塞删除**。后台线程异步释放内存，适合删除包含大量元素的大 Key（如几百万个元素的 Hash/List），不会阻塞主线程。 | `UNLINK big_list_key` |
| **`RENAME`** <br>(Rename / 重命名) | `RENAME key newkey` | 重命名键。如果 `newkey` 已经存在，会直接覆盖它。 | `RENAME old_key new_key` |
| **`RENAMENX`** <br>(Rename if Not Exists / 不存在时重命名) | `RENAMENX key newkey` | 仅当 `newkey` 不存在时，才进行重命名操作。 | `RENAMENX a b` |

---

## 3. 生存时间（TTL）管理

在 Redis 中，我们可以为 Key 设置一个"生存时间"，过期后 Redis 会自动将其删除。

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`EXPIRE`** <br>(Expire / 设置秒级过期时间) | `EXPIRE key seconds` | 为键设置过期时间，单位为**秒**。 | `EXPIRE token_key 3600` |
| **`PEXPIRE`** <br>(Millisecond Expire / 设置毫秒级过期时间) | `PEXPIRE key milliseconds` | 为键设置过期时间，单位为**毫秒**。 | `PEXPIRE token_key 5000` |
| **`TTL`** <br>(Time To Live / 剩余生存时间) | `TTL key` | 查询键的剩余存活时间（秒）。根据返回值有三种结果：<br>• 返回 `>= 0`：剩余存活秒数。<br>• 返回 `-1`：没有设置过期时间（永久）。<br>• 返回 `-2`：该键不存在。 | `TTL token_key` |
| **`PERSIST`** <br>(Persist / 移除过期时间并持久化) | `PERSIST key` | 移除键的过期时间，使该键重新变为**永久有效**。 | `PERSIST token_key` |

---

## 4. 数据库全局操作

Redis 默认提供 16 个数据库，编号为 `0` 到 `15`（默认连接的是 `0` 号库）。

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`SELECT`** <br>(Select / 选择数据库) | `SELECT index` | 切换到指定编号的数据库。 | `SELECT 1` |
| **`DBSIZE`** <br>(Database Size / 数据库键总数) | `DBSIZE` | 返回**当前**数据库的键总数。 | `DBSIZE` |
| **`FLUSHDB`** <br>(Flush Database / 清空当前数据库) | `FLUSHDB [ASYNC]` | **高危命令**：清空**当前**数据库的所有数据。 | `FLUSHDB` |
| **`FLUSHALL`** <br>(Flush All / 清空所有数据库) | `FLUSHALL [ASYNC]` | **高危命令**：清空**所有**数据库的数据。 | `FLUSHALL` |

---

# Redis String（字符串）类型与常用命令笔记

**String（字符串）** 是 Redis 最基础、最常用的数据类型。
* **二进制安全（Binary-safe）**：意味着它可以存储任何类型的数据，不仅是普通文本，还可以是 JSON 字符串、XML、序列化的 C++ 对象，甚至是图片或音频等纯二进制流。
* **最大容量**：单个 String 键值对的最大限制为 **512 MB**。
* **典型场景**：缓存数据（如用户信息、配置）、计数器（如点赞数、播放量）、分布式锁、Session 共享等。

---

## 1. 基础读写操作

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`SET`** <br>(Set / 设置) | `SET key value` | 设置指定键的值。如果键已存在，则覆盖旧值。 | `SET name "iqwqi"` |
| **`GET`** <br>(Get / 获取) | `GET key` | 获取指定键的值。如果键不存在，返回 `(nil)`。 | `GET name` |
| **`STRLEN`** <br>(String Length / 字符串长度) | `STRLEN key` | 获取指定键存储的字符串长度。 | `STRLEN name` |
| **`APPEND`** <br>(Append / 追加) | `APPEND key value` | 如果键已存在，将 `value` 追加到旧值末尾；若键不存在，则相当于 `SET`。 | `APPEND name "123"` |

---

## 2. 条件与带过期时间的写入（分布式锁基础）

虽然 `SETNX` 和 `SETEX` 是经典命令，但自 Redis 2.6.12 起，**推荐统一使用 `SET` 命令的扩展参数**来实现这些功能，因为它可以保证"设置值"和"设置过期时间"是**原子操作**。

| 常用参数写法（参数全拼 / 中文） | 对应经典命令（全拼 / 中文） | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`SET key value NX`**<br>(Not Exists / 若不存在则设置) | **`SETNX`**<br>(Set if Not Exists / 若不存在则设置) | 仅在键不存在时才写入，如果已存在则不作任何操作。 | `SET lock_key "1" NX` |
| **`SET key value EX sec`**<br>(Expire / 过期秒数) | **`SETEX`**<br>(Set with Expire / 设置并指定秒级过期时间) | 写入值的同时，设置以**秒**为单位的过期时间。 | `SET code "9527" EX 60` |
| **`SET key val NX EX sec`** | （无直接对应，由参数组合实现） | **原子操作**：仅在不存在时写入，并同时设置过期时间（常用于实现简易分布式锁）。 | `SET lock "uuid" NX EX 10` |

---

## 3. 数值递增与递减（计数器）

如果 String 存储的是一个**能够解析为数字的字符串**（例如 `"10"`），Redis 允许直接对其进行原子性（线程安全）的加减操作。

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`INCR`** <br>(Increment / 递增) | `INCR key` | 将键存储的整数值**加 1**。如果键不存在，会先初始化为 `0` 再加 1。 | `INCR page_view` |
| **`DECR`** <br>(Decrement / 递减) | `DECR key` | 将键存储的整数值**减 1**。 | `DECR stock_count` |
| **`INCRBY`** <br>(Increment By / 按整型值递增) | `INCRBY key increment` | 将键存储的整数值**加上指定的整数**。 | `INCRBY score 10` |
| **`DECRBY`** <br>(Decrement By / 按整型值递减) | `DECRBY key decrement` | 将键存储的整数值**减去指定的整数**。 | `DECRBY score 5` |
| **`INCRBYFLOAT`** <br>(Increment By Float / 按浮点数值递增) | `INCRBYFLOAT key increment` | 将键存储的值**加上指定的浮点数**（支持小数加减）。 | `INCRBYFLOAT money 1.5` |

> 💡 **C++ 开发者视角**：这些加减操作在 Redis 内部是**原子性**的，类似于 C++ 中的 `std::atomic`。在多线程或多进程的高并发场景下，直接使用 `INCR` 计数，无需加锁，也不会出现数据竞争（Race Condition）导致的计数偏差。

---

## 4. 批量操作（批量读写）

为了减少网络往返延迟（RTT），在需要一次性操作多个键时，应优先使用批量命令。

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`MSET`** <br>(Multiple Set / 批量设置) | `MSET key value [key value ...]` | 同时设置一个或多个键值对。 | `MSET k1 "v1" k2 "v2"` |
| **`MGET`** <br>(Multiple Get / 批量获取) | `MGET key [key ...]` | 同时获取一个或多个键的值。 | `MGET k1 k2 k3` |

---

# Redis Hash（哈希/散列）类型与常用命令笔记

**Hash（哈希/散列）** 是一个键值对集合，非常适合用于存储对象（Object），例如一个用户的属性列表。
* **数据模型**：Redis 的 Hash 在概念上非常类似于 C++ 中的 `std::unordered_map<std::string, std::string>`，或者一个嵌套的 JSON 对象。
* **存储容量**：每个 Hash 键最多可以存储 $2^{32} - 1$ 个键值对（超过 40 亿个）。
* **典型场景**：存储结构化数据（如用户信息：姓名、年龄、邮箱），可以独立读取或修改其中的某个属性，而不需要像 String 那样反序列化整个对象。

---

## 1. 基础读写与删除

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`HSET`** <br>(Hash Set / 设置哈希字段值) | `HSET key field value` | 设置哈希表中指定字段的值。如果字段已存在，则覆盖。 | `HSET user:100 name "zbh"` |
| **`HGET`** <br>(Hash Get / 获取哈希字段值) | `HGET key field` | 获取哈希表中指定字段的值。如果字段不存在，返回 `(nil)`。 | `HGET user:100 name` |
| **`HDEL`** <br>(Hash Delete / 删除哈希字段) | `HDEL key field [field ...]` | 删除哈希表中一个或多个指定的字段。返回成功删除的字段数量。 | `HDEL user:100 age email` |

---

## 2. 探测与全局检索

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`HEXISTS`** <br>(Hash Exists / 检查哈希字段是否存在) | `HEXISTS key field` | 检查哈希表中是否存在指定的字段。存在返回 `1`，不存在返回 `0`。 | `HEXISTS user:100 name` |
| **`HLEN`** <br>(Hash Length / 获取哈希字段数量) | `HLEN key` | 获取哈希表中包含的字段总数。 | `HLEN user:100` |
| **`HKEYS`** <br>(Hash Keys / 获取哈希所有字段名) | `HKEYS key` | 获取哈希表中所有的字段名列表（类似于 C++ Map 中的所有 Key）。 | `HKEYS user:100` |
| **`HVALS`** <br>(Hash Values / 获取哈希所有字段值) | `HVALS key` | 获取哈希表中所有字段的值的列表（类似于 C++ Map 中的所有 Value）。 | `HVALS user:100` |
| **`HGETALL`** <br>(Hash Get All / 获取哈希所有字段和值) | `HGETALL key` | 获取哈希表中的所有字段名和对应的值。 | `HGETALL user:100` |

---

## 3. 批量操作

为了减少网络 RTT 延迟，当需要同时读写多个字段时，应当使用批量命令。

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`HSET`** <br>(Hash Set / 批量设置哈希字段值) | `HSET key field value [field value ...]` | **注意**：自 Redis 4.0 起，`HSET` 原生支持设置多个键值对，因此经典的批量设置命令 **`HMSET`** <br>(Hash Multiple Set / 批量设置) 已被逐步弃用。 | `HSET user:100 age 18 email "zbh@test.com"` |
| **`HMGET`** <br>(Hash Multiple Get / 批量获取哈希字段值) | `HMGET key field [field ...]` | 获取哈希表中一个或多个指定字段的值。 | `HMGET user:100 name age` |

---

## 4. 条件与数值操作

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`HSETNX`** <br>(Hash Set if Not Exists / 若哈希字段不存在则设置) | `HSETNX key field value` | 仅在指定的哈希字段不存在时才设置该字段的值。若已存在，则不进行任何操作。 | `HSETNX user:100 points 100` |
| **`HINCRBY`** <br>(Hash Increment By / 哈希字段整型值递增) | `HINCRBY key field increment` | 将指定哈希字段存储的数值加上给定的**整数**值。支持负数。 | `HINCRBY user:100 age 1` |
| **`HINCRBYFLOAT`** <br>(Hash Increment By Float / 哈希字段浮点数值递增) | `HINCRBYFLOAT key field increment` | 将指定哈希字段存储的数值加上给定的**浮点数**值。 | `HINCRBYFLOAT user:100 score 1.5` |

> 💡 **C++ 开发者建议（关于对象存储的选型）**：
> 在存储结构化对象（例如 User、Product）时，通常面临两种方案：
> 1. **方案 A (String + JSON)**：将整个对象序列化为 JSON 字符串，用 `SET` 存储。
> 2. **方案 B (Hash)**：将对象的每个属性映射为哈希表的 Field，用 `HSET` 存储。
> 
> * **选择方案 A 的场景**：对象属性极少变更，每次读取都是获取完整的对象（序列化和反序列化开销低）。
> * **选择方案 B 的场景**：需要高频且单独地修改或读取对象的某几个属性（例如游戏角色属性、在线用户的积分值等），这样能有效减少带宽消耗并避免并发写入时属性互相覆盖。

---

# Redis List（列表）类型与常用命令笔记

**List（列表）** 是简单的字符串列表，按照元素的插入顺序排序。
* **数据模型**：Redis 中的 List 在底层是一个 **双向链表（Doubly Linked List）**，其特性非常类似于 C++ 中的 `std::list<std::string>`。
* **时间复杂度**：在列表的头部（左端）和尾部（右端）插入或删除元素的时间复杂度为 $O(1)$（极快）；但在其中间位置通过索引进行查找或修改的时间复杂度为 $O(N)$。
* **典型场景**：最新消息时间线（Timeline）、高性能消息队列、任务分发队列。

---

## 1. 两端添加与弹出

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`LPUSH`** <br>(Left Push / 左侧头部插入) | `LPUSH key element [element ...]` | 将一个或多个元素插入到列表的**左侧（头部）**。返回插入后列表的长度。 | `LPUSH mylist "a" "b"` |
| **`RPUSH`** <br>(Right Push / 右侧尾部插入) | `RPUSH key element [element ...]` | 将一个或多个元素插入到列表的**右侧（尾部）**。 | `RPUSH mylist "c"` |
| **`LPOP`** <br>(Left Pop / 左侧头部弹出) | `LPOP key [count]` | 移除并返回列表**左侧（头部）**的第一个元素（或指定数量的元素）。若列表已空，返回 `(nil)`。 | `LPOP mylist` |
| **`RPOP`** <br>(Right Pop / 右侧尾部弹出) | `RPOP key [count]` | 移除并返回列表**右侧（尾部）**的第一个元素（或指定数量的元素）。 | `RPOP mylist` |

---

## 2. 查询与检索

在进行区间查询时，Redis 支持负数索引：`0` 表示第一个元素，`-1` 表示最后一个元素，`-2` 表示倒数第二个元素，以此类推。

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`LRANGE`** <br>(List Range / 获取指定区间元素) | `LRANGE key start stop` | 获取列表指定区间内的所有元素（包含 `start` 和 `stop`）。常使用 `0 -1` 获取全部元素。 | `LRANGE mylist 0 -1` |
| **`LINDEX`** <br>(List Index / 按索引获取元素) | `LINDEX key index` | 获取列表中指定索引位置的元素。索引从 `0` 开始。 | `LINDEX mylist 2` |
| **`LLEN`** <br>(List Length / 获取列表长度) | `LLEN key` | 获取列表的长度。若键不存在，返回 `0`。 | `LLEN mylist` |

---

## 3. 裁剪与删除

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`LREM`** <br>(List Remove / 移除指定元素) | `LREM key count element` | 移除列表中与 `element` 相等的值。根据 `count` 值确定行为：<br>• `count > 0`：从左往右删除前 `count` 个。<br>• `count < 0`：从右往左删除前 `count` 的绝对值个。<br>• `count = 0`：删除所有匹配元素。 | `LREM mylist 2 "a"` |
| **`LTRIM`** <br>(List Trim / 裁剪列表以保留指定区间) | `LTRIM key start stop` | 让列表只保留指定区间内的元素，区间之外的元素全部删除。常用它来限制列表最大容量（例如：始终只保留最新的 100 条记录）。 | `LTRIM mylist 0 99` |

---

## 4. 阻塞弹出（高性能消息队列必备）

这两个命令常用于消费队列。当列表中没有数据时，它们会让客户端进入阻塞（等待）状态，直到有新数据被 `LPUSH` / `RPUSH` 写入，或者超时。

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`BLPOP`** <br>(Blocking Left Pop / 阻塞式左侧弹出) | `BLPOP key [key ...] timeout` | `LPOP` 的阻塞版本。在给定的 `timeout`（单位：秒）时间内，如果列表中有元素则立即弹出；若没有，则进入阻塞等待。如果 `timeout` 为 `0`，则无限期等待。 | `BLPOP queue_key 5` |
| **`BRPOP`** <br>(Blocking Right Pop / 阻塞式右侧弹出) | `BRPOP key [key ...] timeout` | `RPOP` 的阻塞版本。行为与 `BLPOP` 相同，区别在于它是从尾部（右端）弹出。 | `BRPOP queue_key 0` |

> 💡 **C++ 开发者建议（生产者-消费者模型构建）**：
> 在 C++ 多线程开发中，传统的线程安全队列需要使用 `std::mutex`（互斥锁）和 `std::condition_variable`（条件变量）来实现多线程间的数据同步与等待。
> 
> 而当使用 Redis 的 **`LPUSH`** + **`BRPOP`** 组合时：
> 1. **生产者（C++ 进程 A）**：直接调用 `LPUSH` 将任务序列化后压入 Redis 列表。
> 2. **消费者（C++ 进程 B）**：在一个独立线程中开启死循环，并运行 `BRPOP queue_key 0` 阻塞等待。
> 
> 这样不需要在 C++ 端编写任何复杂的锁逻辑，就能轻松实现跨物理机、跨语言的高并发、分布式的生产者-消费者架构。

---

# Redis Set（集合）类型与常用命令笔记

**Set（集合）** 是无序的、且不重复的字符串集合。
* **数据模型**：Redis 中的 Set 在底层主要基于哈希表（Hashtable）实现，其特性非常类似于 C++ 中的 `std::unordered_set<std::string>`。
* **时间复杂度**：对集合中元素的添加、删除以及判断成员是否存在，时间复杂度均为 $O(1)$（极快）。
* **典型场景**：唯一标签管理（Tagging）、独立访客去重（UV 统计）、社交网络关系计算（如共同好友、共同关注）、随机抽奖/推荐系统。

---

## 1. 基础添加与删除

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`SADD`** <br>(Set Add / 添加集合成员) | `SADD key member [member ...]` | 向集合中添加一个或多个成员。如果成员已存在，则忽略。返回实际新增成功的成员数量。 | `SADD tags "C++" "Redis" "C++"` |
| **`SREM`** <br>(Set Remove / 移除集合成员) | `SREM key member [member ...]` | 移除集合中的一个或多个指定成员。返回被成功移除的成员数量。 | `SREM tags "Redis"` |

---

## 2. 探测与全局检索

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`SISMEMBER`** <br>(Set Is Member / 判断元素是否为集合成员) | `SISMEMBER key member` | 判断指定元素是否存在于集合中。存在返回 `1`，不存在返回 `0`。 | `SISMEMBER tags "C++"` |
| **`SCARD`** <br>(Set Cardinality / 获取集合成员数量) | `SCARD key` | 获取集合中的成员数量（基数）。如果键不存在，返回 `0`。 | `SCARD tags` |
| **`SMEMBERS`** <br>(Set Members / 获取集合所有成员) | `SMEMBERS key` | 获取集合中的所有成员列表（无序）。 | `SMEMBERS tags` |

> ⚠️ **性能警告（`SMEMBERS` 命令）**：
> 与 `KEYS` 命令类似，如果集合中的成员数量极其庞大（例如数十万个），运行 `SMEMBERS` 可能会阻塞 Redis 主线程。在生产环境下对于大集合推荐使用 **`SSCAN`** <br>(Set Scan / 渐进式集合扫描) 命令进行分批迭代。

---

## 3. 随机抽取操作（抽奖/随机推荐常用）

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`SRANDMEMBER`** <br>(Set Random Member / 随机获取成员) | `SRANDMEMBER key [count]` | 随机返回集合中的一个或多个成员（**不移除**）。若指定 `count`，则返回指定数量的成员。 | `SRANDMEMBER tags 3` |
| **`SPOP`** <br>(Set Pop / 随机弹出成员) | `SPOP key [count]` | 随机移除并返回集合中的一个或多个成员（**移除**）。 | `SPOP lottery_pool 1` |

---

## 4. 集合间运算（社交关系计算）

| 命令（全拼 / 中文） | 格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| **`SINTER`** <br>(Set Intersection / 集合交集) | `SINTER key [key ...]` | 返回给定所有集合的**交集**（即同时存在于所有集合中的成员）。 | `SINTER userA:follows userB:follows` |
| **`SUNION`** <br>(Set Union / 集合并集) | `SUNION key [key ...]` | 返回给定所有集合的**并集**（即所有集合中的所有成员，去重后）。 | `SUNION userA:follows userB:follows` |
| **`SDIFF`** <br>(Set Difference / 集合差集) | `SDIFF key [key ...]` | 返回第一个集合与其他集合的**差集**（即存在于第一个集合但不存在于其他集合的成员）。 | `SDIFF userA:follows userB:follows` |
| **`SINTERSTORE`** <br>(Set Intersection Store / 存储交集) | `SINTERSTORE destination key [key ...]` | 计算给定集合的**交集**，并将结果存储到 `destination` 集合中。 | `SINTERSTORE common_friends userA:follows userB:follows` |
| **`SUNIONSTORE`** <br>(Set Union Store / 存储并集) | `SUNIONSTORE destination key [key ...]` | 计算给定集合的**并集**，并将结果存储到 `destination` 集合中。 | `SUNIONSTORE all_tags tags1 tags2` |
| **`SDIFFSTORE`** <br>(Set Difference Store / 存储差集) | `SDIFFSTORE destination key [key ...]` | 计算第一个集合与其他集合的**差集**，并将结果存储到 `destination` 集合中。 | `SDIFFSTORE unique_to_A userA:follows userB:follows` |

> 💡 **C++ 开发者建议（社交网络应用）**：
> 在社交网络中，集合运算非常适合用于计算用户关系：
> * **共同好友**：使用 `SINTER` 计算 A 和 B 的关注列表交集。
> * **二度人脉**：先计算 A 的关注列表与 B 的关注列表的交集，再对结果进行扩展。
> * **好友推荐**：使用 `SDIFF` 计算 A 的好友关注了但 A 还没关注的人。
> 
> 这些操作在 Redis 中都是高度优化的，性能远优于在应用层进行循环比对。

# 总结一下

内容太多了，我们就不总结了哈~