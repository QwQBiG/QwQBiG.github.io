---
title: "STL map/set - 有序容器"
date: 2026-03-05T10:00:00+08:00
tags: ["C++", "STL", "cpp", "编程语言", "算法竞赛", "C++11"]
categories: ["语言学习"]
series: ["C++的世界"]
weight: 2
---

## map/set - 有序关联容器

`std::map` 和 `std::set` 是基于**红黑树**实现的有序关联容器，提供**O(log n)** 的查找、插入和删除操作。在算法竞赛中，它们常用于需要**有序性**或**自动去重**的场景。

### 竞赛中的核心考点

| 操作 | 时间复杂度 | 竞赛要点 |
|------|-----------|----------|
| 查找 (find) | O(log n) | 快速判断元素是否存在 |
| 插入 (insert) | O(log n) | 自动维护有序性 |
| 删除 (erase) | O(log n) | 高效删除元素 |
| 范围查询 (lower_bound/upper_bound) | O(log n) | 二分查找有序序列 |
| 遍历 | O(n) | 按序访问所有元素 |

---

## 一、map - 键值对容器

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
    map<string, int> mp;
    
    // 插入元素
    mp["apple"] = 100;
    mp.insert({"banana", 80});
    mp.emplace("orange", 120);  // C++11
    
    // 查找元素
    auto it = mp.find("apple");
    if (it != mp.end())
    {
        cout << "apple: " << it->second << endl;
    }
    
    // 遍历
    for (const auto& pair : mp)  // C++11
    {
        cout << pair.first << ": " << pair.second << endl;
    }
    
    // 删除元素
    mp.erase("banana");
    
    // 大小
    cout << "size: " << mp.size() << endl;
    
    return 0;
}
```

### 1.2 竞赛常用技巧

```cpp
// 统计频率
map<int, int> freq;
for (int x : a)
{
    freq[x]++;
}

// 按频率排序（需要转换为 vector）
vector<pair<int, int>> vec(freq.begin(), freq.end());
sort(vec.begin(), vec.end(), [](const auto& a, const auto& b)
{
    return a.second > b.second;  // 按频率降序
});

// 查找第一个大于等于 x 的键
auto it = mp.lower_bound(x);
if (it != mp.end())
{
    cout << "第一个 >= " << x << " 的键: " << it->first << endl;
}

// 查找第一个大于 x 的键
auto it = mp.upper_bound(x);
if (it != mp.end())
{
    cout << "第一个 > " << x << " 的键: " << it->first << endl;
}
```

---

## 二、set - 有序集合

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
    set<int> s;
    
    // 插入元素（自动去重）
    s.insert(10);
    s.insert(20);
    s.insert(10);  // 重复元素，会被忽略
    
    // 查找元素
    auto it = s.find(10);
    if (it != s.end())
    {
        cout << "找到: " << *it << endl;
    }
    
    // 遍历（自动按升序）
    for (int x : s)
    {
        cout << x << " ";
    }
    cout << endl;
    
    // 删除元素
    s.erase(10);
    
    // 大小
    cout << "size: " << s.size() << endl;
    
    return 0;
}
```

### 2.2 竞赛常用技巧

```cpp
// 去重并排序
vector<int> a = {3, 1, 4, 1, 5, 9, 2, 6};
set<int> s(a.begin(), a.end());
vector<int> sorted_unique(s.begin(), s.end());

// 查找第一个大于等于 x 的元素
auto it = s.lower_bound(x);
if (it != s.end())
{
    cout << "第一个 >= " << x << " 的元素: " << *it << endl;
}

// 查找第一个大于 x 的元素
auto it = s.upper_bound(x);
if (it != s.end())
{
    cout << "第一个 > " << x << " 的元素: " << *it << endl;
}

// 反向遍历
for (auto it = s.rbegin(); it != s.rend(); ++it)
{
    cout << *it << " ";
}
```

---

## 三、multimap/multiset - 允许重复元素

### 3.1 基本用法

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // multimap: 允许重复键
    multimap<int, string> mmp;
    mmp.insert({1, "one"});
    mmp.insert({1, "uno"});
    mmp.insert({2, "two"});
    
    // 查找所有键为1的元素
    auto range = mmp.equal_range(1);
    for (auto it = range.first; it != range.second; ++it)
    {
        cout << it->first << ": " << it->second << endl;
    }
    
    // multiset: 允许重复元素
    multiset<int> ms;
    ms.insert(10);
    ms.insert(20);
    ms.insert(10);  // 允许重复
    
    // 统计元素出现次数
    cout << "10出现的次数: " << ms.count(10) << endl;
    
    return 0;
}
```

### 3.2 竞赛应用

```cpp
// 统计频率（multiset 版）
multiset<int> ms(a.begin(), a.end());
for (int x : set<int>(a.begin(), a.end()))
{
    cout << x << ": " << ms.count(x) << endl;
}

// 区间查询（multiset + lower_bound/upper_bound）
int L = 5, R = 15;
auto left = ms.lower_bound(L);
auto right = ms.upper_bound(R);
for (auto it = left; it != right; ++it)
{
    cout << *it << " ";
}
```

---

## 四、C++11 现代特性

### 4.1 自定义比较器

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // 自定义比较器：按字符串长度排序
    struct CompareByLength
    {
        bool operator()(const string& a, const string& b) const
        {
            if (a.size() != b.size())
            {
                return a.size() < b.size();
            }
            return a < b;
        }
    };

    // 使用自定义比较器
    set<string, CompareByLength> s;
    s.insert("apple");
    s.insert("banana");
    s.insert("pear");
    
    // 遍历（按长度排序）
    for (const string& str : s)
    {
        cout << str << " ";  // pear apple banana
    }
    cout << endl;
    
    return 0;
}
```

### 4.2 Lambda 表达式排序

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    set<int> s = {3, 1, 4, 1, 5, 9, 2, 6};
    
    // 转换为 vector 后排序
    vector<int> vec(s.begin(), s.end());
    sort(vec.begin(), vec.end(), greater<int>());
    
    // 遍历排序后的结果
    for (int x : vec)
    {
        cout << x << " ";  // 9 6 5 4 3 2 1
    }
    cout << endl;
    
    return 0;
}
```

---

## 五、竞赛实战技巧

### 5.1 离散化 + map

```cpp
// 离散化
vector<int> a = {100000, 50000, 200000, 50000, 100000, 300000};
map<int, int> rank_map;
set<int> unique_vals(a.begin(), a.end());
int r = 0;
for (int x : unique_vals)
{
    rank_map[x] = r++;
}

// 映射
for (int& x : a)
{
    x = rank_map[x];
}
// a 变为 {2, 0, 3, 0, 2, 4}
```

### 5.2 区间维护

```cpp
// 维护区间的活跃状态（例如，会议室预约）
map<int, int> intervals;  // start -> end

// 添加区间 [start, end)
void add_interval(int start, int end)
{
    // 查找重叠区间
    auto it = intervals.lower_bound(start);
    while (it != intervals.end() && it->first < end)
    {
        start = min(start, it->first);
        end = max(end, it->second);
        intervals.erase(it++);
    }
    intervals[start] = end;
}

// 检查区间是否空闲
bool is_free(int start, int end)
{
    auto it = intervals.lower_bound(start);
    if (it != intervals.begin())
    {
        auto prev = prev(it);
        if (prev->second > start)
        {
            return false;
        }
    }
    return it == intervals.end() || it->first >= end;
}
```

### 5.3 滑动窗口 + set

```cpp
// 滑动窗口找最大值（使用 multiset）
vector<int> max_sliding_window(vector<int>& nums, int k)
{
    vector<int> res;
    multiset<int, greater<int>> ms;
    
    for (int i = 0; i < nums.size(); i++)
    {
        ms.insert(nums[i]);
        if (i >= k - 1)
        {
            res.push_back(*ms.begin());
            ms.erase(ms.find(nums[i - k + 1]));
        }
    }
    
    return res;
}
```

---

## 六、性能优化

### 6.1 避免频繁插入删除

```cpp
// 错误示范：频繁修改导致红黑树频繁重构
map<int, int> mp;
for (int i = 0; i < 1e5; i++)
{
    mp[i] = i;
    mp.erase(i);
}

// 正确做法：批量操作
vector<pair<int, int>> data;
for (int i = 0; i < 1e5; i++)
{
    data.emplace_back(i, i);
}
map<int, int> mp(data.begin(), data.end());
```

### 6.2 合理选择容器

| 场景 | 推荐容器 | 原因 |
|------|---------|------|
| 需要键值对且有序 | `map` | O(log n) 操作，自动排序 |
| 需要自动去重且有序 | `set` | O(log n) 操作，自动排序去重 |
| 需要允许重复元素 | `multimap`/`multiset` | 保留重复元素，仍有序 |
| 只需要哈希表（无序） | `unordered_map`/`unordered_set` | O(1) 平均操作时间 |
| 需要频繁修改元素 | `map`/`set` | 红黑树结构支持高效修改 |

---

## 七、常见错误与注意事项

| 错误 | 说明 | 解决方案 |
|------|------|----------|
| 直接修改 map 的键 | map 的键是 const 的，不能修改 | 先删除旧键，再插入新键 |
| 使用 `operator[]` 查找不存在的键 | 会自动插入该键，值为默认构造 | 使用 `find()` 或 `count()` 查找 |
| 遍历中修改容器 | 可能导致迭代器失效 | 使用 `erase()` 的返回值更新迭代器 |
| 比较自定义类型时未定义 `operator<` | map/set 需要比较器 | 定义 `operator<` 或提供自定义比较器 |
| 性能瓶颈 | 对于不需要有序的场景，map/set 不如 unordered 容器 | 评估是否需要有序性，选择合适的容器 |

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
    
    // map 统计频率
    int n;
    cin >> n;
    vector<int> a(n);
    for (auto& x : a)
    {
        cin >> x;
    }
    
    map<int, int> freq;
    for (int x : a)
    {
        freq[x]++;
    }
    
    // 按频率排序
    vector<pair<int, int>> vec(freq.begin(), freq.end());
    sort(all(vec), [](const pair<int, int>& a, const pair<int, int>& b)
    {
        return a.second > b.second;
    });
    
    // set 去重排序
    set<int> s(a.begin(), a.end());
    
    // 查找操作
    int x;
    cin >> x;
    auto it = s.lower_bound(x);
    if (it != s.end())
    {
        cout << "第一个 >= " << x << " 的元素: " << *it << endl;
    }
    
    return 0;
}
```

---

## 总结：竞赛要点

1. **有序性**：map/set 自动维护有序性，适合需要排序的场景
2. **去重**：set 自动去重，multiset 允许重复
3. **范围查询**：lower_bound/upper_bound 是竞赛中的常用操作
4. **时间复杂度**：所有操作都是 O(log n)，稳定可靠
5. **现代 C++**：使用 C++11 auto 类型推导和 Lambda 表达式
6. **性能考量**：对于不需要有序的场景，考虑使用 unordered 容器
7. **实战技巧**：离散化、区间维护、滑动窗口等高级应用

map/set 是算法竞赛中处理有序数据的强大工具，掌握它们的使用技巧能大大提升解题效率。