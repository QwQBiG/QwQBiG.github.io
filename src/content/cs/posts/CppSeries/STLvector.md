---
title: "STL vector"
date: 2025-11-21T10:00:00+08:00
tags: ["C++", "STL", "cpp", "编程语言", "算法竞赛", "C++11"]
categories: ["语言学习"]
series: ["C++的世界"]
weight: 1
---

## vector - 动态数组

`std::vector` 是算法竞赛中最常用的序列容器，提供**O(1) 随机访问**和**均摊 O(1) 尾部插入**。掌握 C++11 特性，能让你的代码更快更简洁，且在蓝桥杯考场上编译通过。

### 竞赛中的核心考点

| 操作 | 时间复杂度 | 竞赛要点 |
|------|-----------|---------|
| 随机访问 | O(1) | 替代普通数组，支持动态扩容 |
| 尾部 push/pop | 均摊 O(1) | 用作栈 (stack) |
| 中间插入/删除 | O(n) | 避免在循环中频繁使用 |
| `reserve` | O(n) | 预处理避免 reallocation |
| `lower_bound` | O(log n) | 配合 `sort` 实现二分查找 |

---

## 一、初始化与构造

### 1.1 竞赛常用初始化

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // 方法1: 指定大小并初始化（最常用）
    vector<int> a(n);           // n个0
    vector<int> b(n, -1);       // n个-1，常用于初始化DP数组

    // 方法2: C++11 极简读入（推荐！）
    int n; cin >> n;
    vector<int> c(n);
    for (auto& x : c)
    {
        cin >> x;    // 引用读入，避免拷贝
    }

    // 方法3: 从数组构造
    int arr[] = {1, 2, 3, 4, 5};
    vector<int> d(arr, arr + 5);

    // 方法4: C++11 列表初始化
    vector<int> e = {1, 2, 3, 4, 5};
    vector<pair<int, int>> edges = {{1, 2}, {2, 3}, {3, 4}};

    // 方法5: 二维vector（邻接表、矩阵）
    vector<vector<int>> g(n);                   // n个空vector，用于邻接表
    vector<vector<int>> mat(n, vector<int>(m)); // n×m矩阵，默认0初始化

    return 0;
}
```

### 1.2 预分配空间 - 避免 TLE

```cpp
// 错误示范：频繁push_back导致多次reallocation
vector<int> v;
for (int i = 0; i < 1e6; i++)
{
    v.push_back(i);  // 可能触发多次扩容，浪费时间
}

// 正确做法：预先reserve
vector<int> v;
v.reserve(1e6);      // 一次性分配足够空间
for (int i = 0; i < 1e6; i++)
{
    v.push_back(i);  // 不会触发reallocation
}
```

---

## 二、emplace_back vs push_back

### 2.1 性能对比

```cpp
struct Node
{
    int x, y, w;
    Node(int _x, int _y, int _w) : x(_x), y(_y), w(_w) {}
};

vector<Node> v;
v.reserve(100000);

// push_back: 构造临时对象 + 移动/拷贝
for (int i = 0; i < n; i++)
{
    v.push_back(Node(i, i+1, i+2));  // 2次操作
}

// emplace_back: 原地构造，减少一次移动
for (int i = 0; i < n; i++)
{
    v.emplace_back(i, i+1, i+2);     // 1次操作，更快
}
```

### 2.2 竞赛建议

- 对于**基本类型** (`int`, `long long`)：两者无差别
- 对于**自定义结构体**：使用 `emplace_back` 减少开销
- 对于 `pair` 和 `tuple`：`emplace_back` 可以直接传参数

```cpp
vector<pair<int, int>> edges;
edges.emplace_back(u, v);        // 优于 push_back({u, v})
edges.emplace_back(u, v, w);     // 适用于 tuple<int,int,int>
```

---

## 三、遍历技巧

### 3.1 竞赛常用遍历方式

```cpp
vector<int> a = {1, 2, 3, 4, 5};

// 方式1: 索引遍历（需要下标时）
for (int i = 0; i < (int)a.size(); i++)
{
    std::cout << a[i];
    if (i < (int)a.size() - 1)
    {
        std::cout << " ";
    }
    else
    {
        std::cout << "\n";
    }
}

// 方式2: 范围for（只读，最简洁）
for (const auto& x : a)
{
    std::cout << x << " ";
}

// 方式3: 引用遍历（需要修改）
for (auto& x : a)
{
    x *= 2;  // 原地修改
}
```

### 3.2 倒序遍历

```cpp
vector<int> a = {1, 2, 3, 4, 5};

// 方法1: 反向迭代器
for (auto it = a.rbegin(); it != a.rend(); ++it)
{
    std::cout << *it << " ";
}

// 方法2: 索引倒序（常用）
for (int i = (int)a.size() - 1; i >= 0; i--)
{
    std::cout << a[i] << " ";
}
```

---

## 四、算法配合 (C++11 写法)

### 4.1 C++11 排序与去重

```cpp
vector<int> a = {3, 1, 4, 1, 5, 9, 2, 6};

// C++11 sort（使用 all 宏）
sort(all(a));                      // 升序
sort(all(a), greater<int>());      // 降序
sort(all(a), [](int x, int y)
{
    return x % 10 < y % 10;  // 按个位数排序
});

// C++11 去重（必须先排序）
sort(all(a));
a.erase(unique(all(a)), a.end());
```

### 4.2 C++11 二分查找

```cpp
vector<int> a = {1, 3, 5, 7, 9};

// C++11 lower_bound
auto it = lower_bound(all(a), 5);
if (it != a.end() && *it == 5)
{
    std::cout << "找到，下标: " << (it - a.begin());
}

// upper_bound
it = upper_bound(all(a), 5);
std::cout << *it;  // 7

// binary_search
bool exists = binary_search(all(a), 5);
```

### 4.3 前缀和

```cpp
vector<int> a = {1, 2, 3, 4, 5};
int n = (int)a.size();

// 构造前缀和数组
vector<long long> pref(n + 1, 0);
for (int i = 0; i < n; i++)
{
    pref[i + 1] = pref[i] + a[i];
}

// 查询区间和 [l, r]
int l = 1, r = 3;
long long sum = pref[r + 1] - pref[l];  // a[1]+a[2]+a[3] = 9
```

---

## 五、C++11 安全删除法 (O(N) 性能)

### 5.1 为什么 erase + 循环是 O(N²) 陷阱

```cpp
// ❌ 致命错误！每次 erase 后移 O(N) 元素，总共 O(N²)
vector<int> v = {1, 2, 3, 4, 5};
for (auto it = v.begin(); it != v.end(); )
{
    if (*it % 2 == 0)
    {
        v.erase(it);  // 删除后，后面的元素全部前移！
    }
    else
    {
        ++it;
    }
}

// ❌ 倒序删除也是 O(N²)!
for (int i = (int)v.size() - 1; i >= 0; i--)
{
    if (v[i] % 2 == 0)
    {
        v.erase(v.begin() + i);  // 每次 erase 都是 O(N)
    }
}
```

### 5.2 C++11 Erase-Remove 惯用法 (O(N) 性能秒杀)

```cpp
#include <vector>
#include <algorithm>

vector<int> v = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

// ✅ C++11 推荐：O(N) 删除所有偶数！
v.erase(remove_if(all(v), [](int x)
{
    return x % 2 == 0;
}), v.end());

// ✅ 删除所有小于5的元素
v.erase(remove_if(all(v), [](int x)
{
    return x < 5;
}), v.end());

// ✅ 删除特定值
v.erase(remove(all(v), 5), v.end());  // 删除所有值为5的元素
```

### 5.3 多条件删除

```cpp
vector<int> v = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

// 删除既能被2整除又能被3整除的数 (即能被6整除)
v.erase(remove_if(all(v), [](int x)
{
    return x % 2 == 0 && x % 3 == 0;
}), v.end());

// 删除区间 [3, 7) 内的元素
int L = 3, R = 7;
v.erase(remove_if(all(v), [&](int x)
{
    return x >= L && x < R;
}), v.end());
```

---

## 六、vector<bool> 性能天坑

### 6.1 为什么不推荐使用 vector<bool>

```cpp
// ❌ 致命错误！vector<bool> 是特化版本，有严重性能问题
vector<bool> flags(n);

// 问题1: 无法返回真正引用，只能返回代理对象
flags[0] = true;  // 实际是代理对象赋值，有额外开销

// 问题2: 动态位压缩导致缓存不友好
// 访问 flags[i] 需要位运算提取，实际常数远大于 vector<char>

// 问题3: 无法取地址，兼容性差
// &flags[0] 返回的是代理对象指针，不是真正地址

// 问题4: 并行化不友好
// 位操作天然有依赖，难以向量化
```

### 6.2 正确替代方案

```cpp
// ✅ 推荐1: vector<char>（1字节，效率最高）
vector<char> flags(n, 0);
flags[i] = 1;

// ✅ 推荐2: vector<uint8_t> / vector<unsigned char>
vector<uint8_t> flags2(n);

// ✅ 推荐3: vector<int>（如果需要布尔运算）
vector<int> flags3(n);

// ✅ 布尔数组用 std::vector<bool>::reference 的替代方案
// 使用 deque<bool> 或自己封装
```

### 6.3 性能对比

| 类型 | 访问时间 | 内存 | 适用场景 |
|------|---------|------|---------|
| `vector<bool>` | 最慢 | 1 bit | ❌ 不推荐 |
| `vector<char>` | 最快 | 1 byte | ✅ 竞赛首选 |
| `vector<uint8_t>` | 快 | 1 byte | ✅ 明确语义 |
| `vector<int>` | 快 | 4 byte | 需要位运算时 |

---

## 七、迭代器失效问题

### 7.1 失效场景

```cpp
vector<int> v = {1, 2, 3, 4, 5};
auto it = v.begin() + 2;  // 指向3

v.push_back(6);  // 可能触发reallocation，it失效！
// *it;  // 危险！未定义行为
```

### 7.2 安全删除元素

```cpp
vector<int> v = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

// ✅ C++11 推荐：使用 Erase-Remove 惯用法，O(N)
v.erase(remove_if(all(v), [](int x)
{
    return x % 2 == 0;
}), v.end());

// ✅ 传统正确做法：使用 erase 返回值
for (auto it = v.begin(); it != v.end(); )
{
    if (*it % 2 == 0)
    {
        it = v.erase(it);  // erase返回下一个有效迭代器
    }
    else
    {
        ++it;
    }
}
```

---

## 八、竞赛实战技巧

### 8.1 用 vector 实现栈

```cpp
vector<int> stk;

// 入栈
stk.push_back(x);

// 出栈
int top = stk.back();
stk.pop_back();

// 判空
if (stk.empty())
{
    ...
}

// 栈大小（C++11）
int sz = (int)stk.size();
```

### 8.2 邻接表存图

```cpp
int n, m;  // n个点，m条边
cin >> n >> m;

vector<vector<pair<int, int>>> g(n);  // g[u] = {(v, w), ...}

for (int i = 0; i < m; i++)
{
    int u, v, w;
    cin >> u >> v >> w;
    u--; v--;  // 转0-indexed
    g[u].emplace_back(v, w);
    // 无向图：g[v].emplace_back(u, w);
}

// 遍历u的邻接点 (C++11)
for (auto& p : g[u])
{
    int to = p.first;
    int w = p.second;
    // to是邻接点，w是边权
}
```

### 8.3 动态规划中的滚动数组

```cpp
// 优化前：二维DP
vector<vector<int>> dp(n, vector<int>(m, 0));

// 优化后：滚动数组（只保留两行）
vector<int> dp(m), newdp(m);
for (int i = 0; i < n; i++)
{
    for (int j = 0; j < m; j++)
    {
        newdp[j] = ...;  // 计算
    }
    swap(dp, newdp);  // C++11 swap
}
```

### 8.4 离散化

```cpp
vector<int> a = {100, 50, 200, 50, 100, 300};
vector<int> vals = a;  // 拷贝

// C++11 离散化
sort(all(vals));
vals.erase(unique(all(vals)), vals.end());

// 映射
for (auto& x : a)
{
    x = lower_bound(all(vals), x) - vals.begin();
}
// a 变为 {2, 0, 3, 0, 2, 4}
```

---

## 九、常见错误与注意事项

| 错误 | 说明 | 解决方案 |
|------|------|---------|
| `v[i]` 越界 | 未检查 `i < v.size()` | 使用 `at()` 或先检查 |
| 迭代器失效 | push_back后迭代器失效 | 重新获取迭代器 |
| erase + 循环 | O(N²) 复杂度导致 TLE | 使用 Erase-Remove 惯用法 |
| 使用 `vector<bool>` | 常数巨大，无法返回引用 | 使用 `vector<char>` |
| `size() - 1` 溢出 | 无符号减法溢出 | 使用 `(int)v.size() - 1` |
| 未 `reserve` 导致 TLE | 频繁扩容 | 预先 `reserve` |

---

## 十、C++11 完整竞赛模板

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;

    // C++11 极简读入
    vector<int> a(n);
    for (auto& x : a)
    {
        cin >> x;
    }

    // C++11 排序去重
    sort(all(a));
    a.erase(unique(all(a)), a.end());

    // C++11 二分查找
    int x;
    cin >> x;
    auto it = lower_bound(all(a), x);
    if (it != a.end() && *it == x)
    {
        // 找到x
    }

    // C++11 删除元素（O(N)）
    a.erase(remove_if(all(a), [](int v)
    {
        return v < 0;
    }), a.end());

    return 0;
}
```

---

## 总结：C++11 竞赛要点

1. **删除元素**：只用 Erase-Remove 惯用法 (O(N))，永远不要 erase + 循环
2. **布尔数组**：只用 `vector<char>` 或 `vector<uint8_t>`
3. **输入读入**：使用 `for (auto& x : v) cin >> x`
4. **排序二分**：使用 `sort(all(v))` 和 `lower_bound(all(v), x)`
5. **长度计算**：使用 `(int)v.size() - 1` 代替 `v.size() - 1`
6. **宏定义**：使用 `#define all(x) x.begin(), x.end()` 提高打字速度
7. **原地构造**：对于自定义类型，使用 `emplace_back` 减少开销
