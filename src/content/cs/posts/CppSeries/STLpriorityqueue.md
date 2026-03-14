---
title: "STL priority_queue - 优先队列"
date: 2026-03-05T12:00:00+08:00
tags: ["C++", "STL", "cpp", "编程语言", "算法竞赛", "C++11"]
categories: ["语言学习"]
series: ["C++的世界"]
weight: 4
---

## priority_queue - 优先队列

`std::priority_queue` 是基于**堆**实现的优先队列，默认是**最大堆**，提供**O(log n)** 的插入和删除操作。在算法竞赛中，它是实现**贪心算法**和**最短路径算法**（如 Dijkstra）的核心工具。

### 竞赛中的核心考点

| 操作 | 时间复杂度 | 竞赛要点 |
|------|-----------|----------|
| 插入 (push) | O(log n) | 向堆中添加元素 |
| 删除 (pop) | O(log n) | 删除堆顶元素 |
| 访问堆顶 (top) | O(1) | 获取优先级最高的元素 |
| 判空 (empty) | O(1) | 检查队列是否为空 |
| 大小 (size) | O(1) | 获取队列大小 |

---

## 一、基本用法

### 1.1 最大堆（默认）

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // 默认是最大堆
    priority_queue<int> pq;
    
    // 插入元素
    pq.push(3);
    pq.push(1);
    pq.push(4);
    pq.push(1);
    pq.push(5);
    
    // 访问堆顶（最大元素）
    cout << "堆顶: " << pq.top() << endl;  // 5
    
    // 删除堆顶
    pq.pop();
    cout << "删除后堆顶: " << pq.top() << endl;  // 4
    
    // 遍历（会破坏堆结构）
    while (!pq.empty())
    {
        cout << pq.top() << " ";
        pq.pop();
    }
    // 输出: 4 3 1 1
    
    return 0;
}
```

### 1.2 最小堆

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // 最小堆
    priority_queue<int, vector<int>, greater<int>> pq;
    
    // 插入元素
    pq.push(3);
    pq.push(1);
    pq.push(4);
    pq.push(1);
    pq.push(5);
    
    // 访问堆顶（最小元素）
    cout << "堆顶: " << pq.top() << endl;  // 1
    
    // 遍历
    while (!pq.empty())
    {
        cout << pq.top() << " ";
        pq.pop();
    }
    // 输出: 1 1 3 4 5
    
    return 0;
}
```

---

## 二、自定义类型

### 2.1 结构体作为元素

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

struct Node
{
    int val, priority;
    Node(int v, int p) : val(v), priority(p) {}
    
    // 重载 < 运算符，用于最大堆
    bool operator<(const Node& other) const
    {
        return priority < other.priority;  // 大的优先级优先
    }
};

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    priority_queue<Node> pq;
    pq.emplace(1, 10);
    pq.emplace(2, 5);
    pq.emplace(3, 15);
    
    while (!pq.empty())
    {
        Node top = pq.top();
        cout << "val: " << top.val << ", priority: " << top.priority << endl;
        pq.pop();
    }
    // 输出:
    // val: 3, priority: 15
    // val: 1, priority: 10
    // val: 2, priority: 5
    
    return 0;
}
```

### 2.2 自定义比较器

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

struct Node
{
    int val, cost;
    Node(int v, int c) : val(v), cost(c) {}
};

// 自定义比较器（最小堆，按 cost 排序）
struct Compare
{
    bool operator()(const Node& a, const Node& b)
    {
        return a.cost > b.cost;  // 小的 cost 优先
    }
};

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    priority_queue<Node, vector<Node>, Compare> pq;
    pq.emplace(1, 100);
    pq.emplace(2, 50);
    pq.emplace(3, 150);
    
    while (!pq.empty())
    {
        Node top = pq.top();
        cout << "val: " << top.val << ", cost: " << top.cost << endl;
        pq.pop();
    }
    // 输出:
    // val: 2, cost: 50
    // val: 1, cost: 100
    // val: 3, cost: 150
    
    return 0;
}
```

---

## 三、竞赛实战应用

### 3.1 Dijkstra 算法（最短路径）

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

using ll = long long;
using pii = pair<ll, int>;  // (距离, 节点)

const ll INF = 1e18;

vector<ll> dijkstra(int start, const vector<vector<pii>>& g)
{
    int n = g.size();
    vector<ll> dist(n, INF);
    dist[start] = 0;
    
    // 最小堆，按距离排序
    priority_queue<pii, vector<pii>, greater<pii>> pq;
    pq.emplace(0, start);
    
    while (!pq.empty())
    {
        pair<ll, int> top = pq.top();
        ll d = top.first;
        int u = top.second;
        pq.pop();
        
        if (d > dist[u])
        {
            continue;  // 旧的路径，跳过
        }
        
        for (const auto& edge : g[u])
        {
            int v = edge.first;
            ll w = edge.second;
            if (dist[v] > dist[u] + w)
            {
                dist[v] = dist[u] + w;
                pq.emplace(dist[v], v);
            }
        }
    }
    
    return dist;
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m, start;
    cin >> n >> m >> start;
    
    vector<vector<pii>> g(n);
    for (int i = 0; i < m; i++)
    {
        int u, v, w;
        cin >> u >> v >> w;
        g[u].emplace_back(v, w);
    }
    
    vector<ll> dist = dijkstra(start, g);
    for (int i = 0; i < n; i++)
    {
        if (dist[i] == INF)
        {
            cout << "INF ";
        }
        else
        {
            cout << dist[i] << " ";
        }
    }
    
    return 0;
}
```

### 3.2 贪心算法

```cpp
// 活动选择问题（最大不重叠区间）
struct Interval
{
    int start, end;
    bool operator<(const Interval& other) const
    {
        return end > other.end;  // 按结束时间排序（最小堆）
    }
};

int max_non_overlapping(vector<Interval>& intervals)
{
    sort(intervals.begin(), intervals.end(), [](const Interval& a, const Interval& b)
    {
        return a.start < b.start;
    });
    
    priority_queue<Interval> pq;
    int count = 0;
    
    for (const auto& interval : intervals)
    {
        while (!pq.empty() && pq.top().end <= interval.start)
        {
            pq.pop();
        }
        pq.push(interval);
        count = max(count, (int)pq.size());
    }
    
    return count;
}

// 合并 k 个有序链表
struct ListNode
{
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

struct CompareNode
{
    bool operator()(ListNode* a, ListNode* b)
    {
        return a->val > b->val;  // 最小堆
    }
};

ListNode* merge_k_lists(vector<ListNode*>& lists)
{
    priority_queue<ListNode*, vector<ListNode*>, CompareNode> pq;
    
    for (ListNode* node : lists)
    {
        if (node)
        {
            pq.push(node);
        }
    }
    
    ListNode dummy(0);
    ListNode* tail = &dummy;
    
    while (!pq.empty())
    {
        ListNode* node = pq.top();
        pq.pop();
        
        tail->next = node;
        tail = tail->next;
        
        if (node->next)
        {
            pq.push(node->next);
        }
    }
    
    return dummy.next;
}
```

### 3.3 滑动窗口最大值

```cpp
vector<int> max_sliding_window(vector<int>& nums, int k)
{
    vector<int> res;
    // 最大堆，存储 (值, 索引)
    priority_queue<pair<int, int>> pq;
    
    for (int i = 0; i < nums.size(); i++)
    {
        pq.emplace(nums[i], i);
        
        // 移除窗口外的元素
        while (pq.top().second <= i - k)
        {
            pq.pop();
        }
        
        if (i >= k - 1)
        {
            res.push_back(pq.top().first);
        }
    }
    
    return res;
}
```

---

## 四、C++11 现代特性

### 4.1 高效访问优先队列元素

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    priority_queue<pair<int, string>> pq;
    pq.emplace(10, "apple");
    pq.emplace(5, "banana");
    pq.emplace(15, "orange");
    
    while (!pq.empty())
    {
        pair<int, string> top = pq.top();
        int priority = top.first;
        string name = top.second;
        cout << "priority: " << priority << ", name: " << name << endl;
        pq.pop();
    }
    
    return 0;
}
```

### 4.2 使用函数对象作为比较器

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

// 自定义比较器（最小堆）
struct Compare
{
    bool operator()(int a, int b)
    {
        return a > b;  // 小的优先
    }
};

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // C++11: 使用函数对象作为比较器
    priority_queue<int, vector<int>, Compare> pq;
    pq.push(3);
    pq.push(1);
    pq.push(4);
    
    while (!pq.empty())
    {
        cout << pq.top() << " ";
        pq.pop();
    }
    // 输出: 1 3 4
    
    return 0;
}
```

---

## 五、性能优化

### 5.1 预分配空间

```cpp
// 预分配堆的底层容器空间
priority_queue<int> pq;
// 无法直接 reserve，但可以通过构造函数传入预分配的 vector
vector<int> data;
data.reserve(100000);
priority_queue<int> pq2(data.begin(), data.end());
```

### 5.2 避免不必要的拷贝

```cpp
// 使用 emplace 避免拷贝
priority_queue<Node> pq;
pq.emplace(1, 10);  // 原地构造，比 push(Node(1, 10)) 更高效

// 使用移动语义
priority_queue<vector<int>> pq;
vector<int> v = {1, 2, 3};
pq.push(move(v));  // 移动而非拷贝
```

### 5.3 合理选择堆类型

| 场景 | 推荐堆类型 | 原因 |
|------|-----------|------|
| 找最大值 | 最大堆（默认） | 直接取堆顶 |
| 找最小值 | 最小堆（greater<>） | 直接取堆顶 |
| 自定义优先级 | 自定义比较器 | 灵活控制排序规则 |
| 频繁插入删除 | priority_queue | O(log n) 时间复杂度 |
| 静态数据 | 一次性建堆 | 使用 make_heap + pop_heap |

---

## 六、常见错误与注意事项

| 错误 | 说明 | 解决方案 |
|------|------|----------|
| 访问空队列的 top | 未定义行为 | 先检查 empty() |
| 比较器方向错误 | 得到错误的堆类型 | 仔细检查比较器逻辑 |
| 自定义类型未重载比较运算符 | 编译错误 | 为自定义类型重载 operator< 或提供比较器 |
| 性能瓶颈 | 频繁的插入删除 | 考虑批量操作或使用其他数据结构 |
| 内存使用过高 | 堆存储所有元素 | 权衡时间和空间，考虑是否需要全部存储 |
| Dijkstra 算法中的重复节点 | 影响性能 | 检查当前距离是否大于已记录的距离 |

---

## 七、C++11 完整竞赛模板

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

using ll = long long;
using pii = pair<ll, int>;

const ll INF = 1e18;

// Dijkstra 算法模板
vector<ll> dijkstra(int start, const vector<vector<pii>>& g)
{
    int n = g.size();
    vector<ll> dist(n, INF);
    dist[start] = 0;
    
    priority_queue<pii, vector<pii>, greater<pii>> pq;
    pq.emplace(0, start);
    
    while (!pq.empty())
    {
        pii top = pq.top();
        ll d = top.first;
        int u = top.second;
        pq.pop();
        
        if (d > dist[u])
        {
            continue;
        }
        
        for (const auto& edge : g[u])
        {
            int v = edge.first;
            ll w = edge.second;
            if (dist[v] > dist[u] + w)
            {
                dist[v] = dist[u] + w;
                pq.emplace(dist[v], v);
            }
        }
    }
    
    return dist;
}

// 贪心算法：最大不重叠区间
struct Interval
{
    int start, end;
};

int max_non_overlapping(vector<Interval>& intervals)
{
    sort(intervals.begin(), intervals.end(), [](const Interval& a, const Interval& b)
    {
        return a.start < b.start;
    });
    
    priority_queue<int, vector<int>, greater<int>> pq;  // 存储结束时间
    int count = 0;
    
    for (const auto& interval : intervals)
    {
        while (!pq.empty() && pq.top() <= interval.start)
        {
            pq.pop();
        }
        pq.push(interval.end);
        count = max(count, (int)pq.size());
    }
    
    return count;
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // 测试 Dijkstra
    int n, m, start;
    cin >> n >> m >> start;
    
    vector<vector<pii>> g(n);
    for (int i = 0; i < m; i++)
    {
        int u, v, w;
        cin >> u >> v >> w;
        g[u].emplace_back(v, w);
    }
    
    vector<ll> dist = dijkstra(start, g);
    for (ll d : dist)
    {
        cout << (d == INF ? "INF" : to_string(d)) << " ";
    }
    cout << endl;
    
    return 0;
}
```

---

## 总结：竞赛要点

1. **默认最大堆**：priority_queue 默认是最大堆，需要最小堆时使用 greater<> 比较器
2. **Dijkstra 算法**：优先队列是实现 Dijkstra 算法的标准工具
3. **贪心算法**：优先队列常用于贪心策略，如活动选择、任务调度等
4. **自定义比较器**：通过重载 operator< 或提供自定义比较器来控制优先级
5. **性能优化**：使用 emplace 避免拷贝，合理预分配空间
6. **现代 C++11**：使用 auto 类型推导、范围 for 循环、lambda 表达式和函数对象比较器
7. **注意事项**：检查队列是否为空，避免重复节点，合理处理比较器逻辑
8. **实战应用**：最短路径、最小生成树、滑动窗口、合并有序序列等

priority_queue 是算法竞赛中解决优先级问题的强大工具，掌握它的使用技巧能让你在处理贪心和图论问题时更加得心应手。