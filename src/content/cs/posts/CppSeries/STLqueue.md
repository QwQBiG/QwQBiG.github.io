---
title: "STL queue - 队列与 BFS"
date: 2026-03-05T14:00:00+08:00
tags: ["C++", "STL", "cpp", "编程语言", "算法竞赛", "C++11"]
categories: ["语言学习"]
series: ["C++的世界"]
weight: 6
---

## queue - 队列

`std::queue` 是基于**先进先出 (FIFO)** 原则的容器适配器，默认底层使用 `deque` 实现。在算法竞赛中，队列是实现**广度优先搜索 (BFS)** 的核心工具。

### 竞赛中的核心考点

| 操作 | 时间复杂度 | 竞赛要点 |
|------|-----------|----------|
| 入队 (push) | O(1) | 向队尾添加元素 |
| 出队 (pop) | O(1) | 从队首移除元素 |
| 访问队首 (front) | O(1) | 获取队首元素 |
| 访问队尾 (back) | O(1) | 获取队尾元素 |
| 判空 (empty) | O(1) | 检查队列是否为空 |
| 大小 (size) | O(1) | 获取队列大小 |

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
    queue<int> q;
    
    // 使用自定义容器（必须支持 front(), back(), push_back(), pop_front()）
    queue<int, list<int>> q_list;
    queue<int, deque<int>> q_deque;
    
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

    queue<int> q;
    
    // 入队
    q.push(10);
    q.push(20);
    q.push(30);
    
    // 访问队首和队尾
    cout << "队首: " << q.front() << endl;  // 10
    cout << "队尾: " << q.back() << endl;   // 30
    
    // 出队
    q.pop();
    cout << "出队后队首: " << q.front() << endl;  // 20
    
    // 大小和判空
    cout << "队列大小: " << q.size() << endl;  // 2
    cout << "队列是否为空: " << (q.empty() ? "是" : "否") << endl;  // 否
    
    // 清空队列
    while (!q.empty())
    {
        q.pop();
    }
    cout << "清空后队列是否为空: " << (q.empty() ? "是" : "否") << endl;  // 是
    
    return 0;
}
```

---

## 二、BFS 算法实现

### 2.1 基本 BFS

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

void bfs(int start, const vector<vector<int>>& adj)
{
    int n = adj.size();
    vector<bool> visited(n, false);
    queue<int> q;
    
    // 初始化
    q.push(start);
    visited[start] = true;
    
    while (!q.empty())
    {
        int u = q.front();
        q.pop();
        cout << u << " ";  // 处理节点
        
        // 访问邻接点
        for (int v : adj[u])
        {
            if (!visited[v])
            {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // 构建邻接表
    int n = 6;
    vector<vector<int>> adj(n);
    adj[0] = {1, 2};
    adj[1] = {0, 3, 4};
    adj[2] = {0, 5};
    adj[3] = {1};
    adj[4] = {1};
    adj[5] = {2};
    
    cout << "BFS 遍历结果: ";
    bfs(0, adj);  // 0 1 2 3 4 5
    cout << endl;
    
    return 0;
}
```

### 2.2 BFS 求最短路径

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

vector<int> shortest_path(int start, int end, const vector<vector<int>>& adj)
{
    int n = adj.size();
    vector<int> dist(n, -1);
    vector<int> parent(n, -1);
    queue<int> q;
    
    q.push(start);
    dist[start] = 0;
    
    while (!q.empty())
    {
        int u = q.front();
        q.pop();
        
        if (u == end)
        {
            break;  // 找到终点
        }
        
        for (int v : adj[u])
        {
            if (dist[v] == -1)
            {
                dist[v] = dist[u] + 1;
                parent[v] = u;
                q.push(v);
            }
        }
    }
    
    // 重建路径
    vector<int> path;
    if (dist[end] == -1)
    {
        return path;  // 无路径
    }
    
    for (int v = end; v != -1; v = parent[v])
    {
        path.push_back(v);
    }
    reverse(path.begin(), path.end());
    return path;
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 6;
    vector<vector<int>> adj(n);
    adj[0] = {1, 2};
    adj[1] = {0, 3, 4};
    adj[2] = {0, 5};
    adj[3] = {1};
    adj[4] = {1};
    adj[5] = {2};
    
    vector<int> path = shortest_path(0, 5, adj);
    cout << "最短路径: ";
    for (int v : path)
    {
        cout << v << " ";  // 0 2 5
    }
    cout << endl;
    
    return 0;
}
```

---

## 三、竞赛实战应用

### 3.1 层序遍历

```cpp
// 二叉树层序遍历
struct TreeNode
{
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

vector<vector<int>> level_order(TreeNode* root)
{
    vector<vector<int>> result;
    if (!root)
    {
        return result;
    }
    
    queue<TreeNode*> q;
    q.push(root);
    
    while (!q.empty())
    {
        int level_size = q.size();
        vector<int> level;
        
        for (int i = 0; i < level_size; i++)
        {
            TreeNode* node = q.front();
            q.pop();
            level.push_back(node->val);
            
            if (node->left)
            {
                q.push(node->left);
            }
            if (node->right)
            {
                q.push(node->right);
            }
        }
        
        result.push_back(level);
    }
    
    return result;
}
```

### 3.2 多源 BFS

```cpp
// 多源 BFS 求最短距离
vector<vector<int>> multi_source_bfs(int n, int m, const vector<pair<int, int>>& sources)
{
    vector<vector<int>> dist(n, vector<int>(m, -1));
    queue<pair<int, int>> q;
    
    // 初始化多个源点
    for (const auto& source : sources)
    {
        int x = source.first;
        int y = source.second;
        dist[x][y] = 0;
        q.emplace(x, y);
    }
    
    // 四个方向
    int dx[] = {-1, 1, 0, 0};
    int dy[] = {0, 0, -1, 1};
    
    while (!q.empty())
    {
        pair<int, int> front = q.front();
        int x = front.first;
        int y = front.second;
        q.pop();
        
        for (int i = 0; i < 4; i++)
        {
            int nx = x + dx[i];
            int ny = y + dy[i];
            if (nx >= 0 && nx < n && ny >= 0 && ny < m && dist[nx][ny] == -1)
            {
                dist[nx][ny] = dist[x][y] + 1;
                q.emplace(nx, ny);
            }
        }
    }
    
    return dist;
}
```

### 3.3 0-1 BFS

```cpp
// 0-1 BFS 处理边权为 0 或 1 的图
vector<int> zero_one_bfs(int start, const vector<vector<pair<int, int>>>& adj)
{
    int n = adj.size();
    vector<int> dist(n, INT_MAX);
    deque<int> dq;  // 使用双端队列
    
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

    queue<pair<int, int>> q;
    q.emplace(1, 2);
    q.emplace(3, 4);
    
    while (!q.empty())
    {
        pair<int, int> front = q.front();
        int x = front.first;
        int y = front.second;
        cout << "x: " << x << ", y: " << y << endl;
        q.pop();
    }
    
    return 0;
}
```

### 4.2 使用列表初始化

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // 可以通过 deque 初始化 queue
    deque<int> d = {1, 2, 3, 4, 5};
    queue<int> q(d);
    
    while (!q.empty())
    {
        cout << q.front() << " ";
        q.pop();
    }
    // 输出: 1 2 3 4 5
    
    return 0;
}
```

---

## 五、性能优化

### 5.1 预分配空间

```cpp
// 对于底层容器为 deque 的情况
queue<int> q;
// 无法直接 reserve，但可以通过 deque 预分配

// 更好的做法：如果知道大致大小，使用 deque 预分配
int expected_size = 100000;
deque<int> d;
d.reserve(expected_size);
queue<int> q(d);
```

### 5.2 避免不必要的拷贝

```cpp
// 错误示范：值传递
void process_queue(queue<int> q)  // 会拷贝整个队列
{
    // 处理 q
}

// 正确做法：使用引用
void process_queue(queue<int>& q)  // 引用传递，无拷贝
{
    // 处理 q
}

// 使用移动语义
queue<int> create_queue()
{
    queue<int> q;
    // 填充 q
    return q;  // 移动语义，无拷贝
}
```

### 5.3 合理选择底层容器

| 底层容器 | 优点 | 缺点 | 适用场景 |
|---------|------|------|----------|
| deque（默认） | 两端操作高效 | 内存碎片 | 一般 BFS |
| list | 内存分配灵活 | 缓存不友好 | 频繁插入删除 |
| vector | 缓存友好 | 需要手动管理大小 | 固定大小的队列 |

---

## 六、常见错误与注意事项

| 错误 | 说明 | 解决方案 |
|------|------|----------|
| 访问空队列 | 未定义行为 | 先检查 empty() |
| BFS 中重复访问 | 导致无限循环 | 使用 visited 数组标记 |
| 内存使用过高 | 队列过大 | 考虑剪枝或优化算法 |
| 效率问题 | 频繁的 push/pop | 选择合适的底层容器 |
| 路径重建错误 | 父节点指针未正确设置 | 确保每个节点都记录父节点 |

---

## 七、C++11 完整竞赛模板

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

// 基本 BFS
void bfs(int start, const vector<vector<int>>& adj)
{
    int n = adj.size();
    vector<bool> visited(n, false);
    queue<int> q;
    
    q.push(start);
    visited[start] = true;
    
    while (!q.empty())
    {
        int u = q.front();
        q.pop();
        cout << u << " ";
        
        for (int v : adj[u])
        {
            if (!visited[v])
            {
                visited[v] = true;
                q.push(v);
            }
        }
    }
    cout << endl;
}

// BFS 求最短路径
vector<int> shortest_path(int start, int end, const vector<vector<int>>& adj)
{
    int n = adj.size();
    vector<int> dist(n, -1);
    vector<int> parent(n, -1);
    queue<int> q;
    
    q.push(start);
    dist[start] = 0;
    
    while (!q.empty())
    {
        int u = q.front();
        q.pop();
        
        if (u == end)
        {
            break;
        }
        
        for (int v : adj[u])
        {
            if (dist[v] == -1)
            {
                dist[v] = dist[u] + 1;
                parent[v] = u;
                q.push(v);
            }
        }
    }
    
    vector<int> path;
    if (dist[end] == -1)
    {
        return path;
    }
    
    for (int v = end; v != -1; v = parent[v])
    {
        path.push_back(v);
    }
    reverse(path.begin(), path.end());
    return path;
}

// 多源 BFS
vector<vector<int>> multi_source_bfs(int n, int m, const vector<pair<int, int>>& sources)
{
    vector<vector<int>> dist(n, vector<int>(m, -1));
    queue<pair<int, int>> q;
    
    for (const auto& source : sources)
    {
        int x = source.first;
        int y = source.second;
        dist[x][y] = 0;
        q.emplace(x, y);
    }
    
    int dx[] = {-1, 1, 0, 0};
    int dy[] = {0, 0, -1, 1};
    
    while (!q.empty())
    {
        pair<int, int> front = q.front();
        int x = front.first;
        int y = front.second;
        q.pop();
        
        for (int i = 0; i < 4; i++)
        {
            int nx = x + dx[i];
            int ny = y + dy[i];
            if (nx >= 0 && nx < n && ny >= 0 && ny < m && dist[nx][ny] == -1)
            {
                dist[nx][ny] = dist[x][y] + 1;
                q.emplace(nx, ny);
            }
        }
    }
    
    return dist;
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

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // 测试基本 BFS
    int n = 6;
    vector<vector<int>> adj(n);
    adj[0] = {1, 2};
    adj[1] = {0, 3, 4};
    adj[2] = {0, 5};
    adj[3] = {1};
    adj[4] = {1};
    adj[5] = {2};
    
    cout << "BFS 遍历: ";
    bfs(0, adj);
    
    // 测试最短路径
    vector<int> path = shortest_path(0, 5, adj);
    cout << "最短路径: ";
    for (int v : path)
    {
        cout << v << " ";
    }
    cout << endl;
    
    // 测试多源 BFS
    int rows = 3, cols = 3;
    vector<pair<int, int>> sources = {{0, 0}, {2, 2}};
    vector<vector<int>> dist = multi_source_bfs(rows, cols, sources);
    cout << "多源 BFS 距离矩阵: " << endl;
    for (int i = 0; i < rows; i++)
    {
        for (int j = 0; j < cols; j++)
        {
            cout << dist[i][j] << " ";
        }
        cout << endl;
    }
    
    return 0;
}
```

---

## 总结：竞赛要点

1. **FIFO 特性**：队列的先进先出特性是 BFS 的基础
2. **BFS 算法**：队列是实现 BFS 的标准工具
3. **层序遍历**：适用于树和图的层序访问
4. **最短路径**：在无权图中求最短路径
5. **多源 BFS**：处理多个起点的情况
6. **0-1 BFS**：处理边权为 0 或 1 的图
7. **性能优化**：选择合适的底层容器，避免不必要的拷贝
8. **现代 C++11**：使用 auto 类型推导、范围 for 循环和 emplace 原地构造
9. **边界处理**：注意队列判空，避免访问空队列
10. **实战应用**：图遍历、迷宫求解、网络流等

queue 是算法竞赛中解决广度优先搜索问题的核心工具，掌握它的使用技巧能让你在处理图论和搜索问题时更加得心应手。