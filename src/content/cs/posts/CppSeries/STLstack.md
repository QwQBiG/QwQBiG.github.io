---
title: "STL stack - 栈与 DFS"
date: 2026-03-05T16:00:00+08:00
tags: ["C++", "STL", "cpp", "编程语言", "算法竞赛", "C++11"]
categories: ["语言学习"]
series: ["C++的世界"]
weight: 8
---

## stack - 栈

`std::stack` 是基于**后进先出 (LIFO)** 原则的容器适配器，默认底层使用 `deque` 实现。在算法竞赛中，栈是实现**深度优先搜索 (DFS)** 和**表达式求值**的核心工具。

### 竞赛中的核心考点

| 操作 | 时间复杂度 | 竞赛要点 |
|------|-----------|----------|
| 入栈 (push) | O(1) | 向栈顶添加元素 |
| 出栈 (pop) | O(1) | 从栈顶移除元素 |
| 访问栈顶 (top) | O(1) | 获取栈顶元素 |
| 判空 (empty) | O(1) | 检查栈是否为空 |
| 大小 (size) | O(1) | 获取栈大小 |

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
    stack<int> s;
    
    // 使用自定义容器（必须支持 back(), push_back(), pop_back()）
    stack<int, vector<int>> s_vec;
    stack<int, deque<int>> s_deque;
    stack<int, list<int>> s_list;
    
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

    stack<int> s;
    
    // 入栈
    s.push(10);
    s.push(20);
    s.push(30);
    
    // 访问栈顶
    cout << "栈顶: " << s.top() << endl;  // 30
    
    // 出栈
    s.pop();
    cout << "出栈后栈顶: " << s.top() << endl;  // 20
    
    // 大小和判空
    cout << "栈大小: " << s.size() << endl;  // 2
    cout << "栈是否为空: " << (s.empty() ? "是" : "否") << endl;  // 否
    
    // 清空栈
    while (!s.empty())
    {
        s.pop();
    }
    cout << "清空后栈是否为空: " << (s.empty() ? "是" : "否") << endl;  // 是
    
    return 0;
}
```

---

## 二、DFS 算法实现

### 2.1 基本 DFS

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

void dfs(int start, const vector<vector<int>>& adj)
{
    int n = adj.size();
    vector<bool> visited(n, false);
    stack<int> s;
    
    // 初始化
    s.push(start);
    visited[start] = true;
    
    while (!s.empty())
    {
        int u = s.top();
        s.pop();
        cout << u << " ";  // 处理节点
        
        // 访问邻接点（注意顺序，栈是后进先出，所以反序入栈）
        for (auto it = adj[u].rbegin(); it != adj[u].rend(); ++it)
        {
            int v = *it;
            if (!visited[v])
            {
                visited[v] = true;
                s.push(v);
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
    
    cout << "DFS 遍历结果: ";
    dfs(0, adj);  // 0 1 3 4 2 5
    cout << endl;
    
    return 0;
}
```

### 2.2 DFS 求路径

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

bool dfs_path(int start, int end, const vector<vector<int>>& adj, vector<bool>& visited, vector<int>& path)
{
    visited[start] = true;
    path.push_back(start);
    
    if (start == end)
    {
        return true;
    }
    
    for (int v : adj[start])
    {
        if (!visited[v])
        {
            if (dfs_path(v, end, adj, visited, path))
            {
                return true;
            }
        }
    }
    
    path.pop_back();  // 回溯
    return false;
}

vector<int> find_path(int start, int end, const vector<vector<int>>& adj)
{
    vector<int> path;
    vector<bool> visited(adj.size(), false);
    dfs_path(start, end, adj, visited, path);
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
    
    vector<int> path = find_path(0, 5, adj);
    cout << "DFS 路径: ";
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

### 3.1 表达式求值

```cpp
// 计算后缀表达式
int evaluate_postfix(const vector<string>& tokens)
{
    stack<int> s;
    
    for (const string& token : tokens)
    {
        if (token == "+" || token == "-" || token == "*" || token == "/")
        {
            int b = s.top();
            s.pop();
            int a = s.top();
            s.pop();
            
            if (token == "+") s.push(a + b);
            else if (token == "-") s.push(a - b);
            else if (token == "*") s.push(a * b);
            else if (token == "/") s.push(a / b);
        }
        else
        {
            s.push(stoi(token));
        }
    }
    
    return s.top();
}

// 中缀表达式转后缀表达式
vector<string> infix_to_postfix(const string& expr)
{
    vector<string> postfix;
    stack<char> op_stack;
    unordered_map<char, int> precedence = {{'+', 1}, {'-', 1}, {'*', 2}, {'/', 2}, {'^', 3}};
    
    for (int i = 0; i < expr.size(); i++)
    {
        char c = expr[i];
        if (isdigit(c))
        {
            string num;
            while (i < expr.size() && isdigit(expr[i]))
            {
                num += expr[i++];
            }
            i--;
            postfix.push_back(num);
        }
        else if (c == '(')
        {
            op_stack.push(c);
        }
        else if (c == ')')
        {
            while (!op_stack.empty() && op_stack.top() != '(')
            {
                postfix.push_back(string(1, op_stack.top()));
                op_stack.pop();
            }
            op_stack.pop();  // 弹出 '('
        }
        else if (precedence.count(c))
        {
            while (!op_stack.empty() && precedence.count(op_stack.top()) && 
                   precedence[op_stack.top()] >= precedence[c])
            {
                postfix.push_back(string(1, op_stack.top()));
                op_stack.pop();
            }
            op_stack.push(c);
        }
    }
    
    while (!op_stack.empty())
    {
        postfix.push_back(string(1, op_stack.top()));
        op_stack.pop();
    }
    
    return postfix;
}
```

### 3.2 括号匹配

```cpp
bool is_valid_parentheses(const string& s)
{
    stack<char> stk;
    unordered_map<char, char> mapping = {{')', '('}, {']', '['}, {'}', '{'}};
    
    for (char c : s)
    {
        if (mapping.count(c))
        {
            char top_element = stk.empty() ? '#' : stk.top();
            stk.pop();
            if (top_element != mapping[c])
            {
                return false;
            }
        }
        else
        {
            stk.push(c);
        }
    }
    
    return stk.empty();
}
```

### 3.3 单调栈

```cpp
// 每日温度
vector<int> daily_temperatures(vector<int>& temperatures)
{
    int n = temperatures.size();
    vector<int> result(n, 0);
    stack<int> stk;  // 存储索引
    
    for (int i = n - 1; i >= 0; i--)
    {
        while (!stk.empty() && temperatures[stk.top()] <= temperatures[i])
        {
            stk.pop();
        }
        result[i] = stk.empty() ? 0 : stk.top() - i;
        stk.push(i);
    }
    
    return result;
}

// 下一个更大元素
vector<int> next_greater_element(vector<int>& nums)
{
    int n = nums.size();
    vector<int> result(n, -1);
    stack<int> stk;
    
    for (int i = n - 1; i >= 0; i--)
    {
        while (!stk.empty() && stk.top() <= nums[i])
        {
            stk.pop();
        }
        result[i] = stk.empty() ? -1 : stk.top();
        stk.push(nums[i]);
    }
    
    return result;
}
```

### 3.4 二叉树遍历

```cpp
// 二叉树结构
struct TreeNode
{
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

// 前序遍历（非递归）
vector<int> preorder_traversal(TreeNode* root)
{
    vector<int> result;
    if (!root)
    {
        return result;
    }
    
    stack<TreeNode*> stk;
    stk.push(root);
    
    while (!stk.empty())
    {
        TreeNode* node = stk.top();
        stk.pop();
        result.push_back(node->val);
        
        // 先压右子树，再压左子树
        if (node->right)
        {
            stk.push(node->right);
        }
        if (node->left)
        {
            stk.push(node->left);
        }
    }
    
    return result;
}

// 中序遍历（非递归）
vector<int> inorder_traversal(TreeNode* root)
{
    vector<int> result;
    stack<TreeNode*> stk;
    TreeNode* current = root;
    
    while (current || !stk.empty())
    {
        while (current)
        {
            stk.push(current);
            current = current->left;
        }
        
        current = stk.top();
        stk.pop();
        result.push_back(current->val);
        current = current->right;
    }
    
    return result;
}

// 后序遍历（非递归）
vector<int> postorder_traversal(TreeNode* root)
{
    vector<int> result;
    if (!root)
    {
        return result;
    }
    
    stack<TreeNode*> stk1, stk2;
    stk1.push(root);
    
    while (!stk1.empty())
    {
        TreeNode* node = stk1.top();
        stk1.pop();
        stk2.push(node);
        
        if (node->left)
        {
            stk1.push(node->left);
        }
        if (node->right)
        {
            stk1.push(node->right);
        }
    }
    
    while (!stk2.empty())
    {
        result.push_back(stk2.top()->val);
        stk2.pop();
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

    stack<pair<int, string>> stk;
    stk.emplace(1, "apple");
    stk.emplace(2, "banana");
    
    while (!stk.empty())
    {
        pair<int, string> top = stk.top();
        int id = top.first;
        string name = top.second;
        cout << "id: " << id << ", name: " << name << endl;
        stk.pop();
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

    // 可以通过 deque 初始化 stack
    deque<int> d = {1, 2, 3, 4, 5};
    stack<int> stk(d);
    
    while (!stk.empty())
    {
        cout << stk.top() << " ";
        stk.pop();
    }
    // 输出: 5 4 3 2 1
    
    return 0;
}
```

---

## 五、性能优化

### 5.1 预分配空间

```cpp
// 对于底层容器为 vector 的情况
stack<int, vector<int>> stk;
// 可以通过 vector 预分配空间
vector<int> vec;
vec.reserve(100000);
stack<int, vector<int>> stk2(vec);

// 对于底层容器为 deque 的情况
stack<int> stk3;
// 无法直接 reserve，但可以通过 deque 预分配
deque<int> dq;
dq.reserve(100000);
stack<int> stk4(dq);
```

### 5.2 避免不必要的拷贝

```cpp
// 错误示范：值传递
void process_stack(stack<int> stk)  // 会拷贝整个栈
{
    // 处理 stk
}

// 正确做法：使用引用
void process_stack(stack<int>& stk)  // 引用传递，无拷贝
{
    // 处理 stk
}

// 使用移动语义
stack<int> create_stack()
{
    stack<int> stk;
    // 填充 stk
    return stk;  // 移动语义，无拷贝
}
```

### 5.3 合理选择底层容器

| 底层容器 | 优点 | 缺点 | 适用场景 |
|---------|------|------|----------|
| deque（默认） | 两端操作高效 | 内存碎片 | 一般使用 |
| vector | 缓存友好 | 扩容开销 | 大小稳定 |
| list | 内存分配灵活 | 缓存不友好 | 频繁插入删除 |

---

## 六、常见错误与注意事项

| 错误 | 说明 | 解决方案 |
|------|------|----------|
| 访问空栈 | 未定义行为 | 先检查 empty() |
| DFS 中栈溢出 | 递归深度过大 | 使用非递归 DFS |
| 单调栈逻辑错误 | 顺序处理不当 | 仔细检查入栈出栈条件 |
| 表达式求值错误 | 运算符优先级处理错误 | 正确实现中缀转后缀 |
| 内存使用过高 | 栈存储过多元素 | 考虑剪枝或优化算法 |

---

## 七、C++11 完整竞赛模板

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

// 基本 DFS
void dfs(int start, const vector<vector<int>>& adj)
{
    int n = adj.size();
    vector<bool> visited(n, false);
    stack<int> s;
    
    s.push(start);
    visited[start] = true;
    
    while (!s.empty())
    {
        int u = s.top();
        s.pop();
        cout << u << " ";
        
        for (auto it = adj[u].rbegin(); it != adj[u].rend(); ++it)
        {
            int v = *it;
            if (!visited[v])
            {
                visited[v] = true;
                s.push(v);
            }
        }
    }
    cout << endl;
}

// 括号匹配
bool is_valid_parentheses(const string& s)
{
    stack<char> stk;
    unordered_map<char, char> mapping = {{')', '('}, {']', '['}, {'}', '{'}};
    
    for (char c : s)
    {
        if (mapping.count(c))
        {
            char top_element = stk.empty() ? '#' : stk.top();
            stk.pop();
            if (top_element != mapping[c])
            {
                return false;
            }
        }
        else
        {
            stk.push(c);
        }
    }
    
    return stk.empty();
}

// 每日温度
vector<int> daily_temperatures(vector<int>& temperatures)
{
    int n = temperatures.size();
    vector<int> result(n, 0);
    stack<int> stk;
    
    for (int i = n - 1; i >= 0; i--)
    {
        while (!stk.empty() && temperatures[stk.top()] <= temperatures[i])
        {
            stk.pop();
        }
        result[i] = stk.empty() ? 0 : stk.top() - i;
        stk.push(i);
    }
    
    return result;
}

// 表达式求值
int evaluate_postfix(const vector<string>& tokens)
{
    stack<int> s;
    
    for (const string& token : tokens)
    {
        if (token == "+" || token == "-" || token == "*" || token == "/")
        {
            int b = s.top();
            s.pop();
            int a = s.top();
            s.pop();
            
            if (token == "+" || token == "-") s.push(token == "+" ? a + b : a - b);
            else s.push(token == "*" ? a * b : a / b);
        }
        else
        {
            s.push(stoi(token));
        }
    }
    
    return s.top();
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // 测试 DFS
    int n = 6;
    vector<vector<int>> adj(n);
    adj[0] = {1, 2};
    adj[1] = {0, 3, 4};
    adj[2] = {0, 5};
    adj[3] = {1};
    adj[4] = {1};
    adj[5] = {2};
    
    cout << "DFS 遍历: ";
    dfs(0, adj);
    
    // 测试括号匹配
    string s = "{[]()}";
    cout << "括号匹配: " << (is_valid_parentheses(s) ? "有效" : "无效") << endl;
    
    // 测试每日温度
    vector<int> temperatures = {73, 74, 75, 71, 69, 72, 76, 73};
    vector<int> result = daily_temperatures(temperatures);
    cout << "每日温度: ";
    for (int x : result)
    {
        cout << x << " ";
    }
    cout << endl;
    
    // 测试表达式求值
    vector<string> tokens = {"2", "1", "+", "3", "*"};
    cout << "表达式求值: " << evaluate_postfix(tokens) << endl;  // (2+1)*3=9
    
    return 0;
}
```

---

## 总结：竞赛要点

1. **LIFO 特性**：栈的后进先出特性是 DFS 的基础
2. **DFS 算法**：栈是实现非递归 DFS 的标准工具
3. **表达式求值**：栈用于处理中缀、后缀表达式
4. **括号匹配**：栈是解决括号匹配问题的最佳选择
5. **单调栈**：用于解决下一个更大元素、每日温度等问题
6. **二叉树遍历**：栈用于实现非递归的树遍历
7. **性能优化**：选择合适的底层容器，避免不必要的拷贝
8. **现代 C++11**：使用 auto 类型推导、范围 for 循环和 emplace 原地构造
9. **边界处理**：注意栈判空，避免访问空栈
10. **实战应用**：图遍历、表达式处理、单调栈问题等

stack 是算法竞赛中解决后进先出问题的核心工具，掌握它的使用技巧能让你在处理深度优先搜索和表达式求值等问题时更加得心应手。