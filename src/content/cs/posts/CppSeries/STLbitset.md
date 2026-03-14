---
title: "STL bitset - 位运算优化"
date: 2026-03-05T17:00:00+08:00
tags: ["C++", "STL", "cpp", "编程语言", "算法竞赛", "C++11"]
categories: ["语言学习"]
series: ["C++的世界"]
weight: 9
---

## bitset - 位运算优化

`std::bitset` 是一个固定大小的位集合，提供了高效的位操作功能。在算法竞赛中，bitset 是进行**位运算优化**的强大工具，特别适合处理**状态压缩**和**位掩码**等问题。

### 竞赛中的核心考点

| 操作 | 时间复杂度 | 竞赛要点 |
|------|-----------|----------|
| 位设置 (set) | O(1) | 设置特定位为 1 |
| 位清除 (reset) | O(1) | 设置特定位为 0 |
| 位翻转 (flip) | O(1) | 翻转特定位 |
| 位测试 (test) | O(1) | 测试特定位是否为 1 |
| 位运算 (&, , ^, ~) | O(n/w) | 按位运算，n 是位数，w 是机器字长 |
| 计数 (count) | O(n/w) | 统计置位的位数 |
| 查找 (find_first, find_next) | O(n/w) | 查找置位的位 |

---

## 一、基本用法

### 1.1 初始化

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // 默认构造（全 0）
    bitset<8> b1;
    
    // 整数构造
    bitset<8> b2(42);  // 00101010
    
    // 字符串构造
    bitset<8> b3("10101010");
    
    // 拷贝构造
    bitset<8> b4(b2);
    
    // 移动构造
    bitset<8> b5(move(b4));
    
    return 0;
}
```

### 1.2 基本操作

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    bitset<8> b;
    
    // 设置位
    b.set(0);     // 第0位设为1
    b.set(2, 1);  // 第2位设为1
    b.set();      // 所有位设为1
    
    // 清除位
    b.reset(0);   // 第0位设为0
    b.reset();    // 所有位设为0
    
    // 翻转位
    b.flip(1);    // 翻转第1位
    b.flip();     // 翻转所有位
    
    // 测试位
    bool is_set = b.test(0);
    bool any_set = b.any();    // 是否有位为1
    bool all_set = b.all();    // 是否所有位为1
    bool none_set = b.none();  // 是否所有位为0
    
    // 计数
    int count = b.count();  // 置位的位数
    
    // 大小
    size_t size = b.size();  // 总位数
    
    // 转换
    unsigned long ul = b.to_ulong();
    unsigned long long ull = b.to_ullong();
    string s = b.to_string();
    
    return 0;
}
```

---

## 二、位运算

### 2.1 基本位运算

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    bitset<4> a("1010");  // 10
    bitset<4> b("1100");  // 12
    
    // 按位与
    bitset<4> c = a & b;  // 1000 (8)
    
    // 按位或
    bitset<4> d = a | b;  // 1110 (14)
    
    // 按位异或
    bitset<4> e = a ^ b;  // 0110 (6)
    
    // 按位取反
    bitset<4> f = ~a;     // 0101 (5)
    
    // 左移
    bitset<4> g = a << 1;  // 0100 (4)
    
    // 右移
    bitset<4> h = a >> 1;  // 0101 (5)
    
    cout << "a: " << a << endl;
    cout << "b: " << b << endl;
    cout << "a & b: " << c << endl;
    cout << "a | b: " << d << endl;
    cout << "a ^ b: " << e << endl;
    cout << "~a: " << f << endl;
    cout << "a << 1: " << g << endl;
    cout << "a >> 1: " << h << endl;
    
    return 0;
}
```

### 2.2 复合赋值运算

```cpp
bitset<8> a("10101010");
bitset<8> b("11001100");

// 复合赋值
a &= b;  // 等价于 a = a & b
a |= b;  // 等价于 a = a | b
a ^= b;  // 等价于 a = a ^ b
a <<= 2; // 等价于 a = a << 2
a >>= 2; // 等价于 a = a >> 2
```

---

## 三、竞赛实战应用

### 3.1 状态压缩

```cpp
// 子集枚举
void enumerate_subsets(int n)
{
    for (int mask = 0; mask < (1 << n); mask++)
    {
        bitset<32> bits(mask);
        cout << "Mask " << mask << ": ";
        for (int i = 0; i < n; i++)
        {
            if (bits.test(i))
            {
                cout << i << " ";
            }
        }
        cout << endl;
    }
}

// 集合操作
bitset<100> set_union(const bitset<100>& a, const bitset<100>& b)
{
    return a | b;
}

bitset<100> set_intersection(const bitset<100>& a, const bitset<100>& b)
{
    return a & b;
}

bitset<100> set_difference(const bitset<100>& a, const bitset<100>& b)
{
    return a & ~b;
}
```

### 3.2 位掩码优化

```cpp
// 位掩码表示方向
const int UP = 1 << 0;
const int DOWN = 1 << 1;
const int LEFT = 1 << 2;
const int RIGHT = 1 << 3;

// 检查是否可以移动
bool can_move(int directions, int dir)
{
    return (directions & dir) != 0;
}

// 添加方向
int add_direction(int directions, int dir)
{
    return directions | dir;
}

// 移除方向
int remove_direction(int directions, int dir)
{
    return directions & ~dir;
}
```

### 3.3 快速统计

```cpp
// 统计二进制中 1 的个数
int count_ones(int x)
{
    bitset<32> bits(x);
    return bits.count();
}

// 检查是否是 2 的幂
bool is_power_of_two(int x)
{
    if (x == 0)
    {
        return false;
    }
    bitset<32> bits(x);
    return bits.count() == 1;
}

// 查找最低位的 1
int find_lowest_set_bit(int x)
{
    bitset<32> bits(x);
    return bits._Find_first();
}

// 查找最高位的 1
int find_highest_set_bit(int x)
{
    bitset<32> bits(x);
    int pos = -1;
    for (int i = 31; i >= 0; i--)
    {
        if (bits.test(i))
        {
            pos = i;
            break;
        }
    }
    return pos;
}
```

### 3.4 动态规划优化

```cpp
// 旅行商问题 (TSP) 状态压缩 DP
int tsp(const vector<vector<int>>& dist)
{
    int n = dist.size();
    int full_mask = (1 << n) - 1;
    vector<vector<int>> dp(1 << n, vector<int>(n, INT_MAX));
    
    // 初始化：从各个城市出发
    for (int i = 0; i < n; i++)
    {
        dp[1 << i][i] = 0;
    }
    
    // 状态转移
    for (int mask = 0; mask < (1 << n); mask++)
    {
        for (int u = 0; u < n; u++)
        {
            if (!(mask & (1 << u)) || dp[mask][u] == INT_MAX)
            {
                continue;
            }
            for (int v = 0; v < n; v++)
            {
                if (!(mask & (1 << v)) && dist[u][v] != INT_MAX)
                {
                    int new_mask = mask | (1 << v);
                    if (dp[new_mask][v] > dp[mask][u] + dist[u][v])
                    {
                        dp[new_mask][v] = dp[mask][u] + dist[u][v];
                    }
                }
            }
        }
    }
    
    // 找最小路径
    int result = INT_MAX;
    for (int i = 0; i < n; i++)
    {
        if (dp[full_mask][i] != INT_MAX)
        {
            result = min(result, dp[full_mask][i] + dist[i][0]);
        }
    }
    
    return result;
}
```

### 3.5 位图

```cpp
// 位图实现
class BitMap
{
private:
    bitset<1000000> bits;
public:
    void set(int x)
    {
        bits.set(x);
    }
    
    void clear(int x)
    {
        bits.reset(x);
    }
    
    bool test(int x)
    {
        return bits.test(x);
    }
    
    int count()
    {
        return bits.count();
    }
};

// 用于快速去重和存在性检查
void deduplicate(vector<int>& nums)
{
    bitset<1000000> seen;
    vector<int> result;
    
    for (int x : nums)
    {
        if (!seen.test(x))
        {
            seen.set(x);
            result.push_back(x);
        }
    }
    
    nums.swap(result);
}
```

---

## 四、C++11 现代特性

### 4.1 位操作函数

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    bitset<8> b("10101010");
    
    // 查找第一个置位的位
    size_t first = b._Find_first();
    cout << "第一个置位的位: " << first << endl;
    
    // 查找下一个置位的位
    size_t next = b._Find_next(first);
    cout << "下一个置位的位: " << next << endl;
    
    return 0;
}
```

### 4.2 位掩码与枚举

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

// C++11 强类型枚举
enum class Direction : int
{
    UP = 1 << 0,
    DOWN = 1 << 1,
    LEFT = 1 << 2,
    RIGHT = 1 << 3
};

// 重载位运算符
Direction operator|(Direction a, Direction b)
{
    return static_cast<Direction>(static_cast<int>(a) | static_cast<int>(b));
}

Direction operator&(Direction a, Direction b)
{
    return static_cast<Direction>(static_cast<int>(a) & static_cast<int>(b));
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    Direction dir = Direction::UP | Direction::RIGHT;
    bool can_go_up = (dir & Direction::UP) != static_cast<Direction>(0);
    cout << "Can go up: " << can_go_up << endl;
    
    return 0;
}
```

---

## 五、性能优化

### 5.1 位操作优化

```cpp
// 错误示范：使用循环进行位操作
int count_ones_slow(int x)
{
    int count = 0;
    while (x)
    {
        count += x & 1;
        x >>= 1;
    }
    return count;
}

// 正确做法：使用 bitset
int count_ones_fast(int x)
{
    return bitset<32>(x).count();
}

// 更高效：使用内置函数
int count_ones_builtin(int x)
{
    return __builtin_popcount(x);
}
```

### 5.2 内存优化

```cpp
// 错误示范：使用 vector<bool>
vector<bool> flags(1000000);  // 虽然节省空间，但访问慢

// 正确做法：使用 bitset
bitset<1000000> flags;  // 更高效的位操作

// 或者使用 bitset 数组处理更大的范围
const int MAX_SIZE = 10000000;
const int BITSET_SIZE = 1000000;
vector<bitset<BITSET_SIZE>> flags(MAX_SIZE / BITSET_SIZE + 1);

void set_bit(int x)
{
    int idx = x / BITSET_SIZE;
    int offset = x % BITSET_SIZE;
    flags[idx].set(offset);
}

bool test_bit(int x)
{
    int idx = x / BITSET_SIZE;
    int offset = x % BITSET_SIZE;
    return flags[idx].test(offset);
}
```

### 5.3 运算优化

```cpp
// 利用位运算的短路特性
bool is_subset(bitset<32> a, bitset<32> b)
{
    // 检查 a 是否是 b 的子集
    return (a & b) == a;
}

// 快速计算交集大小
int intersection_size(bitset<100> a, bitset<100> b)
{
    return (a & b).count();
}

// 快速计算并集大小
int union_size(bitset<100> a, bitset<100> b)
{
    return (a | b).count();
}
```

---

## 六、常见错误与注意事项

| 错误 | 说明 | 解决方案 |
|------|------|----------|
| 越界访问 | 访问超出 bitset 大小的位 | 确保位索引在有效范围内 |
| 位序理解错误 | 低位在前还是高位在前 | 注意 bitset 的位序（从右到左） |
| 性能瓶颈 | 对于大位数的 bitset 操作 | 考虑分块处理或使用其他数据结构 |
| 内存使用 | 过大的 bitset 导致栈溢出 | 使用动态分配或分块处理 |
| 类型转换错误 | 转换为整数时溢出 | 确保 bitset 大小不超过目标类型 |
| 位运算优先级 | 位运算优先级低于比较运算符 | 使用括号确保运算顺序 |

---

## 七、C++11 完整竞赛模板

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

// 子集枚举
void enumerate_subsets(int n)
{
    for (int mask = 0; mask < (1 << n); mask++)
    {
        bitset<32> bits(mask);
        cout << "Mask " << mask << ": ";
        for (int i = 0; i < n; i++)
        {
            if (bits.test(i))
            {
                cout << i << " ";
            }
        }
        cout << endl;
    }
}

// 快速统计二进制中 1 的个数
int count_ones(int x)
{
    return bitset<32>(x).count();
}

// 检查是否是 2 的幂
bool is_power_of_two(int x)
{
    if (x == 0)
    {
        return false;
    }
    return bitset<32>(x).count() == 1;
}

// 查找最低位的 1
int find_lowest_set_bit(int x)
{
    if (x == 0)
    {
        return -1;
    }
    bitset<32> bits(x);
    return bits._Find_first();
}

// 位图类
class BitMap
{
private:
    bitset<1000000> bits;
public:
    void set(int x)
    {
        bits.set(x);
    }
    
    void clear(int x)
    {
        bits.reset(x);
    }
    
    bool test(int x)
    {
        return bits.test(x);
    }
    
    int count()
    {
        return bits.count();
    }
};

// 旅行商问题 (TSP) 状态压缩 DP
int tsp(const vector<vector<int>>& dist)
{
    int n = dist.size();
    int full_mask = (1 << n) - 1;
    vector<vector<int>> dp(1 << n, vector<int>(n, INT_MAX));
    
    for (int i = 0; i < n; i++)
    {
        dp[1 << i][i] = 0;
    }
    
    for (int mask = 0; mask < (1 << n); mask++)
    {
        for (int u = 0; u < n; u++)
        {
            if (!(mask & (1 << u)) || dp[mask][u] == INT_MAX)
            {
                continue;
            }
            for (int v = 0; v < n; v++)
            {
                if (!(mask & (1 << v)) && dist[u][v] != INT_MAX)
                {
                    int new_mask = mask | (1 << v);
                    if (dp[new_mask][v] > dp[mask][u] + dist[u][v])
                    {
                        dp[new_mask][v] = dp[mask][u] + dist[u][v];
                    }
                }
            }
        }
    }
    
    int result = INT_MAX;
    for (int i = 0; i < n; i++)
    {
        if (dp[full_mask][i] != INT_MAX)
        {
            result = min(result, dp[full_mask][i] + dist[i][0]);
        }
    }
    
    return result;
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // 测试子集枚举
    cout << "子集枚举 (n=3): " << endl;
    enumerate_subsets(3);
    
    // 测试位统计
    int x = 42;  // 101010
    cout << "\n二进制 " << bitset<8>(x) << " 中 1 的个数: " << count_ones(x) << endl;
    cout << "是否是 2 的幂: " << is_power_of_two(x) << endl;
    cout << "最低位的 1 的位置: " << find_lowest_set_bit(x) << endl;
    
    // 测试位图
    BitMap bm;
    bm.set(10);
    bm.set(20);
    bm.set(30);
    cout << "\n位图中 1 的个数: " << bm.count() << endl;
    cout << "测试位 10: " << bm.test(10) << endl;
    cout << "测试位 15: " << bm.test(15) << endl;
    
    // 测试 TSP
    vector<vector<int>> dist = {
        {0, 10, 15, 20},
        {10, 0, 35, 25},
        {15, 35, 0, 30},
        {20, 25, 30, 0}
    };
    int tsp_result = tsp(dist);
    cout << "\nTSP 最短路径: " << tsp_result << endl;
    
    return 0;
}
```

---

## 总结：竞赛要点

1. **位操作效率**：bitset 提供高效的位操作，比手动位运算更简洁
2. **状态压缩**：适用于处理子集、掩码等状态压缩问题
3. **内存节省**：bitset 比 bool 数组更节省内存
4. **位运算优化**：利用位运算的并行性提高计算效率
5. **集合操作**：快速进行集合的并、交、差运算
6. **动态规划**：在 TSP 等问题中用于状态表示
7. **位图应用**：用于快速去重和存在性检查
8. **现代 C++**：使用 C++11 强类型枚举和位运算符重载
9. **性能优化**：结合内置函数和分块处理提高性能
10. **实战应用**：子集枚举、位掩码、状态压缩 DP 等

bitset 是算法竞赛中进行位运算优化的强大工具，掌握它的使用技巧能让你在处理状态压缩和位操作问题时更加得心应手。