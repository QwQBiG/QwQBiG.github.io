---
title: "蓝桥杯 C++ 基础与常用内容"
date: 2026-03-05T18:00:00+08:00
tags: ["C++", "蓝桥杯", "算法竞赛", "C++11", "STL"]
categories: ["语言学习"]
series: ["C++的世界"]
weight: 10
---

# 蓝桥杯 C++ 基础与常用内容

## 一、竞赛环境与要求

### 1.1 官方编译环境
- **IDE**: Dev-C++ 5.11
- **编译器**: GCC 4.9.2
- **C++ 标准**: C++11

### 1.2 代码模板
```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // 代码内容

    return 0;
}
```

## 二、C++11 核心特性

### 2.1 auto 类型推导
- **用途**: 自动推导变量类型，简化代码
- **示例**:
  ```cpp
  auto a = 10;         // int
  auto b = 3.14;       // double
  auto c = "hello";    // const char*
  auto& d = a;         // int&
  const auto& e = b;   // const double&
  ```

### 2.2 范围 for 循环
- **用途**: 简化容器遍历
- **示例**:
  ```cpp
  vector<int> nums = {1, 2, 3, 4, 5};
  for (const auto& num : nums) {
      cout << num << " ";
  }
  ```

### 2.3 结构化绑定 (C++17)
- **用途**: 方便地解包 pair、tuple 等复合类型
- **示例**:
  ```cpp
  map<string, int> scores = {{"Alice", 95}, {"Bob", 88}};
  for (const auto& [name, score] : scores) {
      cout << name << ": " << score << endl;
  }
  ```

### 2.4 智能指针
- **用途**: 自动管理内存，避免内存泄漏
- **示例**:
  ```cpp
  unique_ptr<int> p1(new int(10));
  shared_ptr<int> p2 = make_shared<int>(20);
  ```

## 三、常用 STL 容器

### 3.1 vector
- **特点**: 动态数组，支持随机访问
- **常用操作**:
  ```cpp
  vector<int> v;
  v.push_back(1);
  v.pop_back();
  v.size();
  v.empty();
  v.clear();
  ```

### 3.2 map / set
- **特点**: 有序，基于红黑树实现
- **常用操作**:
  ```cpp
  map<string, int> m;
  m["key"] = value;
  m.find("key");
  m.count("key");
  
  set<int> s;
  s.insert(1);
  s.erase(1);
  s.find(1);
  ```

### 3.3 unordered_map / unordered_set
- **特点**: 无序，基于哈希表实现，查找速度快
- **常用操作**:
  ```cpp
  unordered_map<string, int> um;
  um["key"] = value;
  um.find("key");
  ```

### 3.4 queue / priority_queue
- **特点**: 队列 (FIFO) / 优先队列 (最大堆)
- **常用操作**:
  ```cpp
  queue<int> q;
  q.push(1);
  q.pop();
  q.front();
  
  priority_queue<int> pq;
  pq.push(1);
  pq.pop();
  pq.top();
  ```

### 3.5 stack
- **特点**: 栈 (LIFO)
- **常用操作**:
  ```cpp
  stack<int> s;
  s.push(1);
  s.pop();
  s.top();
  ```

### 3.6 deque
- **特点**: 双端队列，支持两端操作
- **常用操作**:
  ```cpp
  deque<int> dq;
  dq.push_back(1);
  dq.push_front(0);
  dq.pop_back();
  dq.pop_front();
  ```

### 3.7 bitset
- **特点**: 位集合，高效的位操作
- **常用操作**:
  ```cpp
  bitset<32> b;
  b.set(0);
  b.reset(0);
  b.flip();
  b.count();
  ```

## 四、常用算法

### 4.1 排序与查找
- **sort**: 排序
  ```cpp
  sort(v.begin(), v.end());
  sort(v.begin(), v.end(), greater<int>());
  ```
- **lower_bound / upper_bound**: 二分查找
  ```cpp
  auto it = lower_bound(v.begin(), v.end(), x);
  ```

### 4.2 数值算法
- **max_element / min_element**: 找最大/最小值
- **accumulate**: 累加
  ```cpp
  int sum = accumulate(v.begin(), v.end(), 0);
  ```

### 4.3 其他常用算法
- **reverse**: 反转
- **unique**: 去重
- **fill**: 填充
- **copy**: 复制

## 五、竞赛常用技巧

### 5.1 输入输出优化
```cpp
ios::sync_with_stdio(false);
cin.tie(nullptr);
// 对于大数据量输入，考虑使用 scanf/printf
```

### 5.2 数据类型
- **int**: 通常为 32 位，范围约 ±2e9
- **long long**: 64 位，范围约 ±9e18
- **注意**: 蓝桥杯题目中，很多情况下需要使用 long long 避免溢出

### 5.3 常用宏定义
```cpp
#define endl '\n'
#define int long long
#define INF 0x3f3f3f3f
#define MOD 1000000007
```

### 5.4 常见问题处理
- **数组越界**: 确保索引在有效范围内
- **内存溢出**: 合理使用容器，避免栈溢出
- **时间超限**: 优化算法，使用合适的数据结构
- **精度问题**: 浮点数比较时使用误差范围

## 六、经典算法模板

### 6.1 二分查找
```cpp
int binary_search(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```

### 6.2 深度优先搜索 (DFS)
```cpp
void dfs(int u, vector<vector<int>>& adj, vector<bool>& visited) {
    visited[u] = true;
    for (int v : adj[u]) {
        if (!visited[v]) {
            dfs(v, adj, visited);
        }
    }
}
```

### 6.3 广度优先搜索 (BFS)
```cpp
void bfs(int start, vector<vector<int>>& adj, vector<bool>& visited) {
    queue<int> q;
    q.push(start);
    visited[start] = true;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}
```

### 6.4 快速排序
```cpp
void quick_sort(vector<int>& nums, int left, int right) {
    if (left >= right) return;
    int pivot = nums[left + (right - left) / 2];
    int i = left, j = right;
    while (i <= j) {
        while (nums[i] < pivot) i++;
        while (nums[j] > pivot) j--;
        if (i <= j) {
            swap(nums[i], nums[j]);
            i++;
            j--;
        }
    }
    quick_sort(nums, left, j);
    quick_sort(nums, i, right);
}
```

### 6.5 动态规划
- **最长递增子序列**:
  ```cpp
  int lengthOfLIS(vector<int>& nums) {
      int n = nums.size();
      vector<int> dp(n, 1);
      for (int i = 1; i < n; i++) {
          for (int j = 0; j < i; j++) {
              if (nums[i] > nums[j]) {
                  dp[i] = max(dp[i], dp[j] + 1);
              }
          }
      }
      return *max_element(dp.begin(), dp.end());
  }
  ```

## 七、蓝桥杯常见题型

### 7.1 暴力枚举
- **特点**: 直接枚举所有可能的情况
- **适用场景**: 数据规模较小的题目

### 7.2 模拟
- **特点**: 按照题目要求模拟整个过程
- **适用场景**: 流程明确的题目

### 7.3 动态规划
- **特点**: 利用子问题的解来解决原问题
- **适用场景**: 具有最优子结构和重叠子问题的题目

### 7.4 贪心
- **特点**: 每一步都做出局部最优选择
- **适用场景**: 具有贪心选择性质的题目

### 7.5 图论
- **特点**: 处理与图相关的问题
- **适用场景**: 路径、连通性等问题

### 7.6 数学
- **特点**: 利用数学知识解决问题
- **适用场景**: 数论、组合数学等问题
