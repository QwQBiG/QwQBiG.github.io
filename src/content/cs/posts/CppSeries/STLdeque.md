---
title: "STL deque - 双端队列与滑动窗口"
date: 2026-03-05T15:00:00+08:00
tags: ["C++", "STL", "cpp", "编程语言", "算法竞赛", "C++11"]
categories: ["语言学习"]
series: ["C++的世界"]
weight: 7
---

## deque - 双端队列

`std::deque` 是**双端队列**（double-ended queue）的缩写，支持在两端进行高效的插入和删除操作。在算法竞赛中，deque 是实现**滑动窗口**等高级算法的核心工具。

### 竞赛中的核心考点

| 操作 | 时间复杂度 | 竞赛要点 |
|------|-----------|----------|
| 两端插入/删除 | 均摊 O(1) | 高效的两端操作 |
| 随机访问 | O(1) | 支持索引访问 |
| 中间插入/删除 | O(n) | 避免在中间操作 |
| 大小操作 | O(1) | 快速获取大小和判空 |

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

    // 默认构造
    deque<int> dq;
    
    // 大小构造
    deque<int> dq1(5);      // 5个默认值（0）
    deque<int> dq2(5, 10);  // 5个值为10的元素
    
    // 迭代器构造
    vector<int> v = {1, 2, 3, 4, 5};
    deque<int> dq3(v.begin(), v.end());
    
    // 拷贝构造
    deque<int> dq4(dq3);
    
    // 移动构造
    deque<int> dq5(move(dq4));
    
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

    deque<int> dq;
    
    // 两端插入
    dq.push_back(10);  // 队尾插入
    dq.push_front(20); // 队首插入
    dq.emplace_back(30);  // 原地构造
    dq.emplace_front(40); // 原地构造
    // dq: [40, 20, 10, 30]
    
    // 两端删除
    dq.pop_back();   // 删除队尾
    dq.pop_front();  // 删除队首
    // dq: [20, 10]
    
    // 访问元素
    cout << "队首: " << dq.front() << endl;  // 20
    cout << "队尾: " << dq.back() << endl;   // 10
    cout << "索引1: " << dq[1] << endl;      // 10
    cout << "索引1: " << dq.at(1) << endl;   // 10（带边界检查）
    
    // 大小和判空
    cout << "大小: " << dq.size() << endl;  // 2
    cout << "是否为空: " << (dq.empty() ? "是" : "否") << endl;  // 否
    
    // 清空
    dq.clear();
    cout << "清空后大小: " << dq.size() << endl;  // 0
    
    return 0;
}
```

---

## 二、滑动窗口算法

### 2.1 滑动窗口最大值

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

vector<int> max_sliding_window(vector<int>& nums, int k)
{
    vector<int> result;
    deque<int> dq;  // 存储索引，维护单调递减队列
    
    for (int i = 0; i < nums.size(); i++)
    {
        // 移除窗口外的元素
        if (!dq.empty() && dq.front() == i - k)
        {
            dq.pop_front();
        }
        
        // 维护单调递减队列
        while (!dq.empty() && nums[dq.back()] <= nums[i])
        {
            dq.pop_back();
        }
        
        dq.push_back(i);
        
        // 窗口形成后开始记录结果
        if (i >= k - 1)
        {
            result.push_back(nums[dq.front()]);
        }
    }
    
    return result;
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    vector<int> nums = {1, 3, -1, -3, 5, 3, 6, 7};
    int k = 3;
    vector<int> result = max_sliding_window(nums, k);
    
    cout << "滑动窗口最大值: ";
    for (int x : result)
    {
        cout << x << " ";  // 3 3 5 5 6 7
    }
    cout << endl;
    
    return 0;
}
```

### 2.2 滑动窗口最小值

```cpp
vector<int> min_sliding_window(vector<int>& nums, int k)
{
    vector<int> result;
    deque<int> dq;  // 存储索引，维护单调递增队列
    
    for (int i = 0; i < nums.size(); i++)
    {
        // 移除窗口外的元素
        if (!dq.empty() && dq.front() == i - k)
        {
            dq.pop_front();
        }
        
        // 维护单调递增队列
        while (!dq.empty() && nums[dq.back()] >= nums[i])
        {
            dq.pop_back();
        }
        
        dq.push_back(i);
        
        // 窗口形成后开始记录结果
        if (i >= k - 1)
        {
            result.push_back(nums[dq.front()]);
        }
    }
    
    return result;
}
```

---

## 三、竞赛实战应用

### 3.1 双端队列实现栈和队列

```cpp
// 使用 deque 实现栈
class MyStack
{
private:
    deque<int> dq;
public:
    void push(int x)
    {
        dq.push_back(x);
    }
    
    int pop()
    {
        int x = dq.back();
        dq.pop_back();
        return x;
    }
    
    int top()
    {
        return dq.back();
    }
    
    bool empty()
    {
        return dq.empty();
    }
};

// 使用 deque 实现队列
class MyQueue
{
private:
    deque<int> dq;
public:
    void push(int x)
    {
        dq.push_back(x);
    }
    
    int pop()
    {
        int x = dq.front();
        dq.pop_front();
        return x;
    }
    
    int front()
    {
        return dq.front();
    }
    
    bool empty()
    {
        return dq.empty();
    }
};
```

### 3.2 0-1 BFS

```cpp
// 0-1 BFS 处理边权为 0 或 1 的图
vector<int> zero_one_bfs(int start, const vector<vector<pair<int, int>>>& adj)
{
    int n = adj.size();
    vector<int> dist(n, INT_MAX);
    deque<int> dq;
    
    dist[start] = 0;
    dq.push_front(start);
    
    while (!dq.empty())
    {
        int u = dq.front();
        dq.pop_front();
        
        for (const auto& edge : adj[u])
        {
            int v = edge.first;
            int w = edge.second;
            if (dist[v] > dist[u] + w)
            {
                dist[v] = dist[u] + w;
                if (w == 0)
                {
                    dq.push_front(v);  // 权值为 0 放在队首
                }
                else
                {
                    dq.push_back(v);   // 权值为 1 放在队尾
                }
            }
        }
    }
    
    return dist;
}
```

### 3.3 滑动窗口中位数

```cpp
// 滑动窗口中位数（使用双端队列辅助）
vector<double> median_sliding_window(vector<int>& nums, int k)
{
    vector<double> result;
    multiset<int> window(nums.begin(), nums.begin() + k);
    auto mid = next(window.begin(), k / 2);
    
    for (int i = k; ; i++)
    {
        // 计算中位数
        if (k % 2 == 0)
        {
            result.push_back((*mid + *prev(mid)) / 2.0);
        }
        else
        {
            result.push_back(*mid);
        }
        
        if (i == nums.size())
        {
            break;
        }
        
        // 移除窗口左端元素
        window.insert(nums[i]);
        if (nums[i] < *mid)
        {
            mid--;
        }
        
        // 插入新元素
        if (nums[i - k] <= *mid)
        {
            mid++;
        }
        window.erase(window.lower_bound(nums[i - k]));
    }
    
    return result;
}
```

---

## 四、C++11 现代特性

### 4.1 使用 pair 元素访问

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    deque<pair<int, string>> dq;
    dq.emplace_back(1, "apple");
    dq.emplace_back(2, "banana");
    
    for (const auto& p : dq)
    {
        int id = p.first;
        string name = p.second;
        cout << "id: " << id << ", name: " << name << endl;
    }
    
    return 0;
}
```

### 4.2 使用标准算法

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    deque<int> dq = {3, 1, 4, 1, 5, 9, 2, 6};
    
    // C++11: sort
    sort(dq.begin(), dq.end());
    
    // C++11: find
    auto it = find(dq.begin(), dq.end(), 5);
    if (it != dq.end())
    {
        cout << "找到 5 在位置: " << distance(dq.begin(), it) << endl;
    }
    
    // C++11: 过滤偶数
    cout << "偶数: ";
    for (int x : dq)
    {
        if (x % 2 == 0)
        {
            cout << x << " ";
        }
    }
    cout << endl;
    
    return 0;
}
```

---

## 五、性能优化

### 5.1 预分配空间

```cpp
// 预分配空间
int expected_size = 100000;
deque<int> dq;
dq.reserve(expected_size);  // 注意：deque 的 reserve 只是一个提示

// 更有效的方式：直接构造足够大的 deque
deque<int> dq(expected_size);
```

### 5.2 避免中间操作

```cpp
// 错误示范：在中间插入元素
deque<int> dq = {1, 2, 3, 4, 5};
dq.insert(dq.begin() + 2, 10);  // O(n) 操作

// 正确做法：优先在两端操作
dq.push_front(0);  // O(1)
dq.push_back(6);   // O(1)
```

### 5.3 合理选择容器

| 容器 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| deque | 两端操作高效，支持随机访问 | 内存碎片，中间操作慢 | 滑动窗口，双端操作 |
| vector | 缓存友好，随机访问快 | 两端操作慢 | 随机访问频繁，大小稳定 |
| list | 中间插入删除快 | 不支持随机访问，缓存不友好 | 频繁中间操作 |

---

## 六、常见错误与注意事项

| 错误 | 说明 | 解决方案 |
|------|------|----------|
| 越界访问 | 访问超出范围的索引 | 使用 `at()` 或先检查大小 |
| 中间插入删除 | 导致性能下降 | 优先在两端操作 |
| 内存使用过高 | deque 内存碎片 | 考虑使用 vector 或 list |
| 迭代器失效 | 插入删除操作后迭代器失效 | 注意保存有效的迭代器 |
| 滑动窗口逻辑错误 | 窗口边界处理不当 | 仔细检查窗口大小和边界条件 |

---

## 七、C++11 完整竞赛模板

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

// 滑动窗口最大值
vector<int> max_sliding_window(vector<int>& nums, int k)
{
    vector<int> result;
    deque<int> dq;
    
    for (int i = 0; i < nums.size(); i++)
    {
        // 移除窗口外的元素
        if (!dq.empty() && dq.front() == i - k)
        {
            dq.pop_front();
        }
        
        // 维护单调递减队列
        while (!dq.empty() && nums[dq.back()] <= nums[i])
        {
            dq.pop_back();
        }
        
        dq.push_back(i);
        
        // 窗口形成后开始记录结果
        if (i >= k - 1)
        {
            result.push_back(nums[dq.front()]);
        }
    }
    
    return result;
}

// 0-1 BFS
vector<int> zero_one_bfs(int start, const vector<vector<pair<int, int>>>& adj)
{
    int n = adj.size();
    vector<int> dist(n, INT_MAX);
    deque<int> dq;
    
    dist[start] = 0;
    dq.push_front(start);
    
    while (!dq.empty())
    {
        int u = dq.front();
        dq.pop_front();
        
        for (const auto& edge : adj[u])
        {
            int v = edge.first;
            int w = edge.second;
            if (dist[v] > dist[u] + w)
            {
                dist[v] = dist[u] + w;
                if (w == 0)
                {
                    dq.push_front(v);
                }
                else
                {
                    dq.push_back(v);
                }
            }
        }
    }
    
    return dist;
}

// 双端队列实现栈
class MyStack
{
private:
    deque<int> dq;
public:
    void push(int x)
    {
        dq.push_back(x);
    }
    
    int pop()
    {
        int x = dq.back();
        dq.pop_back();
        return x;
    }
    
    int top()
    {
        return dq.back();
    }
    
    bool empty()
    {
        return dq.empty();
    }
};

// 双端队列实现队列
class MyQueue
{
private:
    deque<int> dq;
public:
    void push(int x)
    {
        dq.push_back(x);
    }
    
    int pop()
    {
        int x = dq.front();
        dq.pop_front();
        return x;
    }
    
    int front()
    {
        return dq.front();
    }
    
    bool empty()
    {
        return dq.empty();
    }
};

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // 测试滑动窗口最大值
    vector<int> nums = {1, 3, -1, -3, 5, 3, 6, 7};
    int k = 3;
    vector<int> result = max_sliding_window(nums, k);
    
    cout << "滑动窗口最大值: ";
    for (int x : result)
    {
        cout << x << " ";
    }
    cout << endl;
    
    // 测试 0-1 BFS
    int n = 4;
    vector<vector<pair<int, int>>> adj(n);
    adj[0] = {{1, 0}, {2, 1}};
    adj[1] = {{0, 0}, {3, 1}};
    adj[2] = {{0, 1}, {3, 0}};
    adj[3] = {{1, 1}, {2, 0}};
    
    vector<int> dist = zero_one_bfs(0, adj);
    cout << "0-1 BFS 距离: ";
    for (int d : dist)
    {
        cout << d << " ";
    }
    cout << endl;
    
    // 测试栈实现
    MyStack stack;
    stack.push(1);
    stack.push(2);
    stack.push(3);
    cout << "栈顶: " << stack.top() << endl;  // 3
    cout << "弹出: " << stack.pop() << endl;  // 3
    cout << "栈顶: " << stack.top() << endl;  // 2
    
    // 测试队列实现
    MyQueue queue;
    queue.push(1);
    queue.push(2);
    queue.push(3);
    cout << "队首: " << queue.front() << endl;  // 1
    cout << "弹出: " << queue.pop() << endl;  // 1
    cout << "队首: " << queue.front() << endl;  // 2
    
    return 0;
}
```

---

## 总结：竞赛要点

1. **双端操作**：deque 支持在两端进行高效的插入和删除操作
2. **滑动窗口**：deque 是实现滑动窗口算法的最佳选择
3. **随机访问**：支持 O(1) 的随机访问，比 list 更灵活
4. **0-1 BFS**：利用双端队列优化边权为 0 或 1 的图的最短路径
5. **数据结构实现**：可以用 deque 实现栈和队列
6. **性能优化**：优先在两端操作，避免中间插入删除
7. **现代 C++11**：使用 auto 类型推导、范围 for 循环和 emplace 原地构造
8. **边界处理**：注意迭代器失效和越界访问
9. **实战应用**：滑动窗口最大值、最小值、中位数等

deque 是算法竞赛中处理需要双端操作场景的强大工具，掌握它的使用技巧能让你在解决滑动窗口等问题时更加得心应手。