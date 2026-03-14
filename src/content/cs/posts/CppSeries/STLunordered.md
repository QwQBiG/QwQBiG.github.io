---
title: "STL unordered_map/unordered_set - 哈希容器"
date: 2026-03-05T11:00:00+08:00
tags: ["C++", "STL", "cpp", "编程语言", "算法竞赛", "C++11"]
categories: ["语言学习"]
series: ["C++的世界"]
weight: 3
---

## unordered_map/unordered_set - 哈希关联容器

`std::unordered_map` 和 `std::unordered_set` 是基于**哈希表**实现的无序关联容器，提供**平均 O(1)** 的查找、插入和删除操作。在算法竞赛中，它们是处理**不需要有序性**场景的首选容器。

### 竞赛中的核心考点

| 操作 | 时间复杂度 | 竞赛要点 |
|------|-----------|----------|
| 查找 (find) | 平均 O(1) | 快速判断元素是否存在 |
| 插入 (insert) | 平均 O(1) | 高效插入元素 |
| 删除 (erase) | 平均 O(1) | 高效删除元素 |
| 遍历 | O(n) | 无序访问所有元素 |
| 哈希冲突 | O(n) 最坏 | 避免哈希冲突影响性能 |

---

## 一、unordered_map - 哈希键值对容器

### 1.1 基本用法

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // 初始化
    unordered_map<string, int> ump;
    
    // 插入元素
    ump["apple"] = 100;
    ump.insert({"banana", 80});
    ump.emplace("orange", 120);  // C++11
    
    // 查找元素
    auto it = ump.find("apple");
    if (it != ump.end())
    {
        cout << "apple: " << it->second << endl;
    }
    
    // 遍历（无序）
    for (const auto& pair : ump)  // C++11
    {
        cout << pair.first << ": " << pair.second << endl;
    }
    
    // 删除元素
    ump.erase("banana");
    
    // 大小
    cout << "size: " << ump.size() << endl;
    
    // 清空
    ump.clear();
    
    return 0;
}
```

### 1.2 竞赛常用技巧

```cpp
// 统计频率（比 map 更快）
unordered_map<int, int> freq;
for (int x : a)
{
    freq[x]++;
}

// 检查元素是否存在
if (ump.count("apple"))
{
    cout << "apple exists" << endl;
}

// 遍历所有键值对
for (const auto& pair : ump)
{
    int key = pair.first;
    int val = pair.second;
    // 处理键值对
}

// 批量插入
vector<pair<string, int>> data = {{"a", 1}, {"b", 2}, {"c", 3}};
unordered_map<string, int> ump(data.begin(), data.end());
```

---

## 二、unordered_set - 哈希集合

### 2.1 基本用法

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // 初始化
    unordered_set<int> us;
    
    // 插入元素（自动去重）
    us.insert(10);
    us.insert(20);
    us.insert(10);  // 重复元素，会被忽略
    
    // 查找元素
    auto it = us.find(10);
    if (it != us.end())
    {
        cout << "找到: " << *it << endl;
    }
    
    // 遍历（无序）
    for (int x : us)
    {
        cout << x << " ";
    }
    cout << endl;
    
    // 删除元素
    us.erase(10);
    
    // 大小
    cout << "size: " << us.size() << endl;
    
    return 0;
}
```

### 2.2 竞赛常用技巧

```cpp
// 快速去重（比 set 更快）
vector<int> a = {3, 1, 4, 1, 5, 9, 2, 6};
unordered_set<int> us(a.begin(), a.end());
vector<int> unique_vals(us.begin(), us.end());

// 检查元素是否存在
if (us.count(5))
{
    cout << "5 exists" << endl;
}

// 清空并重新填充
us.clear();
for (int x : b)
{
    us.insert(x);
}
```

---

## 三、自定义哈希函数

### 3.1 基本类型的哈希

```cpp
// 基本类型自动支持哈希
unordered_map<int, string> ump1;
unordered_map<string, int> ump2;
unordered_map<long long, double> ump3;
```

### 3.2 自定义类型的哈希

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

// 自定义结构体
struct Point
{
    int x, y;
    bool operator==(const Point& other) const
    {
        return x == other.x && y == other.y;
    }
};

// 自定义哈希函数
namespace std
{
    template<>
    struct hash<Point>
    {
        size_t operator()(const Point& p) const
        {
            // 组合哈希值
            size_t h1 = hash<int>()(p.x);
            size_t h2 = hash<int>()(p.y);
            return h1 ^ (h2 << 1);
        }
    };
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    unordered_set<Point> us;
    us.insert({1, 2});
    us.insert({3, 4});
    
    if (us.count({1, 2}))
    {
        cout << "Point (1,2) exists" << endl;
    }
    
    return 0;
}
```

### 3.3 使用 boost 哈希（竞赛中不推荐）

```cpp
// 注意：竞赛环境通常不支持 boost
#include <boost/functional/hash.hpp>

struct Point
{
    int x, y;
    bool operator==(const Point& other) const
    {
        return x == other.x && y == other.y;
    }
};

namespace std
{
    template<>
    struct hash<Point>
    {
        size_t operator()(const Point& p) const
        {
            size_t seed = 0;
            boost::hash_combine(seed, p.x);
            boost::hash_combine(seed, p.y);
            return seed;
        }
    };
}
```

---

## 四、C++11 现代特性

### 4.1 高效查找方法

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    unordered_set<string> us;
    us.insert("apple");
    
    // C++11: 使用 find 方法查找
    if (us.find("apple") != us.end())
    {
        cout << "apple exists" << endl;
    }
    
    // 或者使用 count 方法
    if (us.count("apple"))
    {
        cout << "apple exists" << endl;
    }
    
    return 0;
}
```

### 4.2 批量操作

```cpp
// C++11: 批量插入
vector<pair<string, int>> data = { {"a", 1}, {"b", 2}, {"c", 3} };
unordered_map<string, int> ump(data.begin(), data.end());

// 批量遍历
for (const auto& pair : ump)
{
    cout << pair.first << ": " << pair.second << endl;
}

// 批量删除
ump.erase(ump.begin(), ump.end());
```

---

## 五、竞赛实战技巧

### 5.1 快速查找

```cpp
// 查找是否存在重复元素
bool has_duplicate(const vector<int>& nums)
{
    unordered_set<int> seen;
    for (int x : nums)
    {
        if (seen.count(x))
        {
            return true;
        }
        seen.insert(x);
    }
    return false;
}

// 两数之和
vector<int> two_sum(const vector<int>& nums, int target)
{
    unordered_map<int, int> val_to_idx;
    for (int i = 0; i < nums.size(); i++)
    {
        int complement = target - nums[i];
        if (val_to_idx.count(complement))
        {
            return {val_to_idx[complement], i};
        }
        val_to_idx[nums[i]] = i;
    }
    return {};
}
```

### 5.2 缓存优化

```cpp
// 记忆化搜索（斐波那契）
unordered_map<int, long long> memo;

long long fib(int n)
{
    if (n <= 1)
    {
        return n;
    }
    if (memo.count(n))
    {
        return memo[n];
    }
    memo[n] = fib(n-1) + fib(n-2);
    return memo[n];
}

// 缓存计算结果
unordered_map<string, int> cache;

int compute(const string& key)
{
    if (cache.count(key))
    {
        return cache[key];
    }
    int result = /* 复杂计算 */;
    cache[key] = result;
    return result;
}
```

### 5.3 字符串处理

```cpp
// 单词频率统计
unordered_map<string, int> word_freq;
string word;
while (cin >> word)
{
    word_freq[word]++;
}

// 查找重复的子字符串
unordered_set<string> seen;
for (int i = 0; i < s.size() - k + 1; i++)
{
    string substr = s.substr(i, k);
    if (seen.count(substr))
    {
        return substr;
    }
    seen.insert(substr);
}
```

---

## 六、性能优化

### 6.1 预分配空间

```cpp
// 错误示范：频繁扩容
unordered_map<int, int> ump;
for (int i = 0; i < 1e6; i++)
{
    ump[i] = i;
}

// 正确做法：预分配空间
unordered_map<int, int> ump;
ump.reserve(1e6);  // 预分配足够的桶
for (int i = 0; i < 1e6; i++)
{
    ump[i] = i;
}
```

### 6.2 避免哈希冲突

```cpp
// 自定义哈希函数时避免冲突
struct MyHash
{
    size_t operator()(int x) const
    {
        // 更好的哈希函数
        x = ((x >> 16) ^ x) * 0x45d9f3b;
        x = ((x >> 16) ^ x) * 0x45d9f3b;
        x = (x >> 16) ^ x;
        return x;
    }
};

unordered_map<int, int, MyHash> ump;
```

### 6.3 合理选择容器

| 场景 | 推荐容器 | 原因 |
|------|---------|------|
| 需要键值对且无序 | `unordered_map` | O(1) 平均操作时间 |
| 需要自动去重且无序 | `unordered_set` | O(1) 平均操作时间 |
| 需要有序性 | `map`/`set` | 自动排序 |
| 数据量小 | 任意 | 性能差异不明显 |
| 数据量大且频繁查找 | `unordered_map`/`unordered_set` | 性能优势明显 |

---

## 七、常见错误与注意事项

| 错误 | 说明 | 解决方案 |
|------|------|----------|
| 自定义类型未定义 `operator==` | 哈希容器需要比较元素是否相等 | 为自定义类型定义 `operator==` |
| 自定义类型未提供哈希函数 | 编译器无法为自定义类型生成哈希值 | 特化 `std::hash` 或提供哈希函数 |
| 哈希冲突严重 | 导致 O(n) 时间复杂度 | 使用更好的哈希函数或增大桶数 |
| 内存使用过高 | 哈希表需要额外空间 | 权衡时间和空间，考虑使用其他容器 |
| 遍历顺序依赖 | 代码依赖于遍历顺序 | 不要依赖哈希容器的遍历顺序 |
| 频繁重哈希 | 影响性能 | 预先 reserve 足够空间 |

---

## 八、C++11 完整竞赛模板

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // unordered_map 统计频率
    int n;
    cin >> n;
    vector<int> a(n);
    for (auto& x : a)
    {
        cin >> x;
    }
    
    unordered_map<int, int> freq;
    freq.reserve(n);  // 预分配空间
    for (int x : a)
    {
        freq[x]++;
    }
    
    // 查找元素
    int x;
    cin >> x;
    if (freq.find(x) != freq.end())  // C++11
    {
        cout << x << " 出现了 " << freq[x] << " 次" << endl;
    }
    else
    {
        cout << x << " 不存在" << endl;
    }
    
    // unordered_set 去重
    unordered_set<int> us(a.begin(), a.end());
    cout << "去重后大小: " << us.size() << endl;
    
    return 0;
}
```

---

## 总结：竞赛要点

1. **性能优势**：平均 O(1) 的操作时间，比有序容器快
2. **无序性**：不保证元素顺序，不要依赖遍历顺序
3. **哈希冲突**：注意哈希函数的质量，避免严重冲突
4. **内存使用**：哈希表需要额外空间，权衡时间和空间
5. **现代 C++**：使用 C++11 auto 类型推导和范围 for 循环
6. **预分配空间**：使用 reserve 避免频繁扩容
7. **自定义类型**：需要提供 `operator==` 和哈希函数
8. **实战应用**：快速查找、频率统计、缓存、字符串处理等

unordered_map 和 unordered_set 是算法竞赛中处理不需要有序性场景的最佳选择，掌握它们的使用技巧能显著提升代码性能。