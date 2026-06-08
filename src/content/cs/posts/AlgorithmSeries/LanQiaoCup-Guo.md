---
title: "LanQiaoCup-Guo"
date: 2026-04-01T14:00:00+08:00
tags: ["算法", "暴力", "蓝桥杯", "C++11", "国赛"]
categories: ["算法学习"]
series: ["算法合集"]
weight: 2
---

一开始的操作：点开 `Dev-C++` ，新建一个文件，命名后要有 `.cpp` 哈；然后点开上方的工具(T)，点开编译选项(C)，“编译时添加以下命令”要打上对号，然后在框框中输入`-std=c++11` 。

---
5.24 的 码题杯：

1. 二维矩阵分块

### 题目描述

给定一个 $n \times m$ 的整数矩阵 $g$。现将其均匀分割为若干个大小为 $t_1 \times t_2$ 的小矩阵（共有 $\frac{n}{t_1} \times \frac{m}{t_2}$ 个）。保证 $n$ 能被 $t_1$ 整除，$m$ 能被 $t_2$ 整除。

定义每个小矩阵的**权值**为其内部所有元素的**按位异或和**。

请计算所有小矩阵权值的**普通加法和**。

---

### 输入格式

第一行包含四个整数 $n, m, t_1, t_2$ （满足 $1 \le n, m \le 1000$，$1 \le t_1 \le n$，$1 \le t_2 \le m$，且 $n$ 是 $t_1$ 的倍数，$m$ 是 $t_2$ 的倍数）。

接下来 $n$ 行，每行包含 $m$ 个整数，第 $i$ 行第 $j$ 个数表示矩阵元素 $g_{i,j}$ （$0 \le g_{i,j} \le 1000$）。

---

### 输出格式

输出一个整数，表示所有小矩阵权值的普通加法和。

---

### 样例输入

```text
6 4 3 2
1 1 2 2
3 3 4 2
6 6 5 1
3 3 7 8
5 5 6 6
6 6 5 3
```

### 样例输出

```text
11
```
**解：**
```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr); cout.tie(nullptr);

    int n, m, t1, t2;
    cin >> n >> m >> t1 >> t2;
    
    vector<vector<int>> g(n, vector<int> (m));
    for (int i = 0; i < n; i++)
    {
        for (int j = 0; j < m; j++)
        {
            cin >> g[i][j];
        }
    }

    int total_sum = 0;

    for (int x = 0; x < n; x += t1)  // 行
    {
        for (int y = 0; y < m; y += t2)  // 列 
        {
            int xor_sum = 0;  // 异或和初始为 0

            // 每一小块
            for (int dx = 0; dx < t1; dx++)
            {
                for (int dy = 0; dy < t2; dy++)
                {
                    xor_sum ^= g[x+dx][y+dy];
                }
            }

            total_sum += xor_sum;
        }
    }

    cout << total_sum << endl;

    return 0;
}
```

2. 最长严格上升子序列

### 题目描述

给定一个长度为 $n$ 的整数序列 $a_1, a_2, \dots, a_n$ 以及 $q$ 次询问。

每次询问给出区间左右端点 $[l, r]$，请判断子序列 $a_l, a_{l+1}, \dots, a_r$ 的**最长严格上升子序列（LIS）**的长度是否大于等于 $3$。如果是，输出 `Yes`；否则输出 `No`。

> **最长严格上升子序列**：从原序列中按顺序挑选若干元素（不要求连续）组成新序列，若新序列中每个后续元素都严格大于前一个元素，则称其为严格上升子序列。其中长度最长者的长度即为 LIS 长度。

---

### 输入格式

第一行包含两个整数 $n, q$（$1 \le n, q \le 10^4$）。

第二行包含 $n$ 个整数 $a_1, a_2, \dots, a_n$（$1 \le a_i \le 10^9$）。

接下来 $q$ 行，每行包含两个整数 $l, r$（$1 \le l \le r \le n$），表示一组询问。

---

### 输出格式

输出共 $q$ 行。对应每个询问，满足条件输出 `Yes`，否则输出 `No`。

---

### 样例输入

```text
10 5
3 1 3 1 3 9 10 8 2 4
1 3
1 4
1 5
2 6
2 9
```

### 样例输出

```text
No
No
No
Yes
Yes
```
使用单调栈的**解法**：（在后面我有详细地对单调栈的解析）
```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

const int INF = 1e18;  // 用来代表右侧无解

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr); cout.tie(nullptr);

    int n, q;
    cin >> n >> q;
    
    vector<int> a(n + 1);  // 直接就下标从 1 开始存
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
    }
    
    // 寻找左边第一个比自己小的数
    vector<int> L(n + 1, 0);
    stack<int> st_l;
    for (int i = 1; i <= n; i++)
    {
        while (!st_l.empty() && a[st_l.top()] >= a[i])
        {
            st_l.pop();
        }
        if (!st_l.empty())
        {
            L[i] = st_l.top();
        }
        else
        {
            L[i] = 0;
        }
        st_l.push(i);
    }
    
    // 寻找右边第一个比自己大的数
    vector<int> R(n + 1, INF);
    stack<int> st_r;
    for (int i = n; i >= 1; i--)
    {
        while (!st_r.empty() && a[st_r.top()] <= a[i])
        {
            st_r.pop();
        }
        if (!st_r.empty())
        {
            R[i] = st_r.top();
        }
        else
        {
            R[i] = INF;
        }
        st_r.push(i);
    }
    

    // 计算
    for (int i = 0; i < q; i++)
    {
        int l, r;
        cin >> l >> r;
        
        bool found = false;
        // 遍历 [l, r] 区间内的每一个元素
        for (int j = l; j <= r; j++)
        {
            // 如果存在一个 j，它左边更小的数和右边更大的数都在当前区间内
            if (L[j] >= l && R[j] <= r)
            {
                found = true;
                break;  // 找到了立刻退出
            }
        }
        
        if (found) cout << "Yes" << endl;
        else cout << "No" << endl;
    }

    return 0;
}
```

3.区间式转移 DP 方格染色

### 题目描述

有一个 $2 \times n$ 的网格，初始时所有格子均为白色。现在你可以选择若干个（也可以是 $0$ 个）格子染成黑色。

为了使染色方案合法，任意两个黑色格子之间的**曼哈顿距离**必须不小于 $d$。

请计算共有多少种合法的染色方案。由于答案可能很大，请将结果对 $10^9 + 7$ 取模。

> **曼哈顿距离定义**：设两个格子的坐标分别为 $(x_1, y_1)$ 和 $(x_2, y_2)$，则它们之间的曼哈顿距离为 $|x_1 - x_2| + |y_1 - y_2|$。其中行号 $x \in \{1, 2\}$，列号 $y \in \{1, 2, \dots, n\}$。

---

### 输入格式

一行包含两个整数 $n, d$（$1 \le n \le 10^6$，$1 \le d \le n$）。

---

### 输出格式

输出一个整数，表示合法的染色方案数对 $10^9 + 7$ 取模后的结果。

---

### 样例

#### 样例 1
* **输入**：
  ```text
  2 2
  ```
* **输出**：
  ```text
  7
  ```
* **说明**：
  * 选择 $0$ 个黑色格子的方案数：$1$ 种。
  * 选择 $1$ 个黑色格子的方案数：$4$ 种。
  * 选择 $2$ 个黑色格子的方案数：$2$ 种（即选择对角线上的两个格子，如 $(1,1)$ 和 $(2,2)$，其距离为 $|1-2| + |1-2| = 2 \ge 2$）。
  * 无法选择 $3$ 个及以上黑色格子。
  * 总方案数为 $1 + 4 + 2 = 7$。

#### 样例 2
* **输入**：
  ```text
  100 3
  ```
* **输出**：
  ```text
  713413448
  ```

**解：**

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

const int MOD = 1e9 + 7;

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr); cout.tie(nullptr);

    int n, d;
    cin >> n >> d;

    if (d == 1)
    {
        int ans = 1;
        for (int i = 0; i < 2 * n; i++)
            ans = ans * 2 % MOD;

        cout << ans << endl;
        return 0;
    }

    vector<int> a(n + 1), S(n + 1);

    for (int i = 1; i <= n; i++)
    {
        int x = 0, y = 0;

        if (i - d >= 0) x = S[i - d];
        if (i - d + 1 >= 0) y = S[i - d + 1];

        a[i] = (1 + x + y) % MOD;
        S[i] = (S[i - 1] + a[i]) % MOD;
    }

    cout << (1 + 2 * S[n]) % MOD << endl;

    return 0;
}
```

---
## 单调栈

### 一、 单调栈会用在什么题型上？

单调栈主要用于解决 **“在 $O(N)$ 时间内寻找边界或最近关系”** 的问题。其应用场景可以归纳为以下四大经典题型：

#### 1. 基础型：下一个更大/更小元素 
* **典型问题**：给出一个数组，求每个元素右边/左边第一个比它大/小的数。
* **例题**：*LeetCode 739. 每日温度*（寻找下一个更高温度的温度出现在几天后）、*LeetCode 496/503. 下一个更大元素*。

#### 2. 势力范围型：柱状图最大面积 / 子数组最值贡献
* **典型问题**：对于数组中的每个数 $a[i]$，寻找它作为“区间最大值”或“区间最小值”时，这个区间最远能向左和向右延伸到哪里。这也被称为求元素的**“贡献范围”/“势力范围”**。
* **例题**：*LeetCode 84. 柱状图中最大的矩形*（对于每个柱子，向左右延申直到遇到更矮的柱子）、*LeetCode 907. 子数组的最小值之和*（求出每个数作为最小值的子数组数量）。

#### 3. 凹凸槽蓄水型：接雨水
* **典型问题**：由条形图构成的起伏地形，在下雨后能存多少水。
* **例题**：*LeetCode 42. 接雨水*。当遇到一个比栈顶高的元素时，说明形成了一个“凹槽”，可以计算凹槽蓄水量。

#### 4. 贪心字典序型：移掉 K 位数
* **典型问题**：在保持相对顺序的前提下，通过删除一部分元素，使剩下的序列在字典序上最小/最大。
* **例题**：*LeetCode 402. 移掉 K 位数*、*LeetCode 316. 去除重复字母*。

---

### 二、 怎么识别单调栈题型？

在考场上，题目往往会被包装成实际场景（例如“看风景”、“挡阳光”、“排队”等），我们可以通过以下三个“信号”快速定位单调栈：

1. **“第一个” + “更大/更小”**：
   * 凡是出现 **“寻找最近一个比它大/小的数”** 的描述，直接锁定单调栈。
2. **“以我为最值能延伸到哪里”**：
   * 题目要求计算某种关于区间的最值属性。比如，“寻找一个区间，使得区间内最小值乘以区间长度最大”。这里的突破口往往是：**固定每一个元素作为最小值，看它左右两边最远能扩展到哪里**。找这个扩展边界，本质上就是找“左右两侧第一个比它小的元素”，这正是单调栈的拿手好戏。
3. **$O(N^2) \to O(N)$ 的时限压力**：
   * 如果你写出了一个两层循环的暴力解法（外层固定每个元素，内层向左/向右扫描寻找边界），且数据范围是 $10^5$ 级（要求 $O(N)$ 复杂度），这就提示你应当用单调栈来将内层扫描优化到 $O(1)$。

---

### 三、 好的模板是啥样？

好的单调栈模板应当具备两个特征：
1. **栈内只存下标，不存数值**：因为存了下标 $i$，你既可以通过 `a[i]` 拿到数值，又可以通过 `i` 计算元素之间的距离/跨度。如果只存数值，就会丢失位置信息。
2. **统一的控制结构**：无论求大、求小、求左、求右，核心控制结构完全一致，只有**循环方向**和**比较符号**微调。

#### 模板（以“左侧第一个比我小”为例，0-based 索引）

```cpp
vector<int> L(n);  // 记录每个位置的答案
stack<int> st;  // 栈内仅存下标

for (int i = 0; i < n; ++i)
{
    // 【核心】当栈不空，且栈顶元素不符合“比我小”的条件时，弹栈
    // a[st.top()] >= a[i] 意味着：栈顶元素大于等于当前元素，它不是我们要找的“更小值”，必须弹掉
    while (!st.empty() && a[st.top()] >= a[i])
    {
        st.pop();
    }
    // 此时栈顶就是左边第一个比 a[i] 小的元素的下标
    if (!st.empty())
    {
        L[i] = st.top(); 
    }
    else
    {
        L[i] = -1;  // 栈空，说明左边没有比它小的（哨兵边界值）
    }
    
    st.push(i);  // 将当前下标入栈，作为后续元素的候选
}
```

---

### 四、 如何用这一套模板做到“一通百通”？

我们只需控制**两个变量**，就可以利用上面的模板解决所有四个方向的关系：
1. **循环方向**：从左往右（`0 -> n-1`）还是从右往左（`n-1 -> 0`）。
2. **`while` 中的比较符号**：寻找“更小”（弹掉 $\ge$ 自身的值）还是“更大”（弹掉 $\le$ 自身的值）。

以下为四个方向的微调矩阵，对照此表，无需死记硬背即可灵活变化：

| 目标关系 | 循环方向 (i) | 比较符号 (`while`) | 栈空时的默认边界值 | 物理含义说明 |
| :--- | :--- | :--- | :--- | :--- |
| **左侧**第一个**更小** | `0` 往 `n - 1` | `a[st.top()] >= a[i]` | `-1` | 弹掉比我大的，留下比我小的 |
| **左侧**第一个**更大** | `0` 往 `n - 1` | `a[st.top()] <= a[i]` | `-1` | 弹掉比我小的，留下比我大的 |
| **右侧**第一个**更小** | `n - 1` 往 `0` | `a[st.top()] >= a[i]` | `n` | 弹掉比我大的，留下比我小的 |
| **右侧**第一个**更大** | `n - 1` 往 `0` | `a[st.top()] <= a[i]` | `n` | 弹掉比我小的，留下比我大的 |

> **哨兵建议**：在处理边界值时，将左侧无解设为 `-1`，右侧无解设为 `n`。这样在计算区间宽度时（例如 $R[i] - L[i] - 1$），公式可以直接统一，不需额外处理 `if-else`。

例题：

1.LeetCode 739. 每日温度

### 题目描述

给定一个整数数组 `temperatures`，表示每日的气温。请计算并返回一个相同长度的数组，其中对应位置的输出为：要想观测到更高的气温，至少需要等待的天数。如果气温在这之后都不会升高，请在该位置用 `0` 代替。

---

### 示例

#### 示例 1
* **输入**：`temperatures = [73,74,75,71,69,72,76,73]`
* **输出**：`[1,1,4,2,1,1,0,0]`

---

### 提示

* $1 \le \text{temperatures.length} \le 10^5$
* $30 \le \text{temperatures}[i] \le 100$

**解：**

```cpp
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& t) {
        int n = t.size();
        vector<int> ans(n, 0);
        stack<int> st;  // 栈内只存下标

        // 从右往左循环
        for (int i = n - 1; i >= 0; i--)
        {
            // 弹栈：只要栈不空，且栈顶温度小于等于当前温度（不符合“严格大于”），就弹栈
            while (!st.empty() && t[st.top()] <= t[i])
            {
                st.pop();
            }
            // 记录答案
            if (!st.empty())
            {
                ans[i] = st.top() - i;  // 下一个更高温度出现的下标减去当前下标
            }
            else 
            {
                ans[i] = 0;  // 栈空说明之后都不会升高，填0
            }

            // 入栈：当前下标入栈，作为左侧其他天数寻找更大值时的候选
            st.push(i);
        }

        return ans;
    }
};
```

2.LeetCode 42. 接雨水

### 题目描述

给定 $n$ 个非负整数表示每个宽度为 $1$ 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

---

### 示例

#### 示例 1
* **输入**：`height = [0,1,0,2,1,0,1,3,2,1,2,1]`
* **输出**：`6`
* **解释**：上述输入对应的柱子排列，在下雨后可以接 $6$ 个单位的雨水。

---

### 提示

* $n == \text{height.length}$
* $1 \le n \le 2 \times 10^4$
* $0 \le \text{height}[i] \le 10^5$

**解：**
```cpp
class Solution {
public:
    int trap(vector<int>& h) {
        int n = h.size();
        int ans = 0;
        stack<int> st;  // 栈内只存柱子的下标

        // 从左往右
        for (int i = 0; i < n; i++)
        {
            // 出栈逻辑
            while (!st.empty() && h[st.top()] < h[i])
            {
                int bottom = st.top();  // 凹槽底部
                st.pop();  // 弹出

                // 栈空了
                if (st.empty())
                {
                    break;  // 弹出底部周栈空了，说明没有左墙，无法存水
                }
                // 栈没空，记录答案
                int left_wall = st.top();  // 新的栈顶就是左墙

                // 宽度 = 右墙下标 - 左墙下标 - 1
                int width = i - left_wall - 1; 
                    
                // 高度 = min(左墙高度, 右墙高度) - 槽底高度
                int height = min(h[left_wall], h[i]) - h[bottom];

                ans +=  width * height;  // 计算
            }

            st.push(i);
        }

        return ans;
    }
};
```

3.LeetCode 84. 柱状图中最大的矩形

### 题目描述

给定 $n$ 个非负整数，用来表示柱状图中各个柱子的高度。每个柱子彼此相邻，且宽度为 $1$。

求在该柱状图中，能够勾勒出来的矩形的最大面积。

---

### 示例

#### 示例 1
* **输入**：`heights = [2,1,5,6,2,3]`
* **输出**：`10`
* **解释**：在高度为 `[2,1,5,6,2,3]` 的柱状图中，由高度为 $5$ 和 $6$ 的相邻柱子（宽度均为 $1$）可以勾勒出的最大矩形面积为 $10$。

#### 示例 2
* **输入**：`heights = [2,4]`
* **输出**：`4`

---

### 提示

* $1 \le \text{heights.length} \le 10^5$
* $0 \le \text{heights}[i] \le 10^4$

#### 思考：
1. 我们希望算出以每一根柱子 `h[i]` 为**最高高度**时，矩形最宽能向左右延伸到哪里。
2. 只要左右两边的柱子不比当前柱子矮，矩形就可以一直延伸；一旦遇到比当前柱子矮的，延伸就停止了。
3. 因此：
   * 向左延伸的边界：**左侧第一个比它小的元素下标 $L[i]$**。
   * 向右延伸的边界：**右侧第一个比它小的元素下标 $R[i]$**。
4. 找到这两个边界后，这个矩形的宽度就是 $R[i] - L[i] - 1$，面积就是 $h[i] \times (R[i] - L[i] - 1)$。

这完全就是我们表格里的：
* **左侧第一个更小**（求 $L$ 数组）
* **右侧第一个更小**（求 $R$ 数组）

**解：**

```cpp
class Solution {
public:
    int largestRectangleArea(vector<int>& h) {
        int n = h.size();
        
        // 求左侧第一个更小
        vector<int> L(n, -1);
        stack<int> st_l;

        for (int i = 0; i < n; i++)
        {
            // 寻找更小，所以弹掉大于等于的
            while (!st_l.empty() && h[st_l.top()] >= h[i])
            {
                st_l.pop();
            }
            // 记录答案
            if (!st_l.empty()) 
            {
                L[i] = st_l.top();
            }
            // 不用对 else 做什么

            // 下标入栈
            st_l.push(i);
        }


        // 求右侧第一个更小
        vector<int> R(n, n);
        stack<int> st_r;

        for (int i = n - 1; i >= 0; i--)
        {
            // 寻找更小，所以弹掉大于等于的
            while (!st_r.empty() && h[st_r.top()] >= h[i])
            {
                st_r.pop();
            }
            // 记录答案
            if (!st_r.empty()) 
            {
                R[i] = st_r.top();
            }
            // 不用对 else 做什么

            // 下标入栈
            st_r.push(i);
        }


        // 计算答案
        int ans = 0;
        for (int i = 0; i < n; i++)
        {
            int width = R[i] - L[i] - 1;  // 两个边界之间的距离
            ans = max(ans, h[i] * width);
        }
        
        return ans;
    }
};
```

4.LanQiao (P12241) 最大区间

### 题目描述

给定一个长度为 $n$ 的正整数序列 $A_1, A_2, \dots, A_n$。

请选择两个索引 $L$ 和 $R$（满足 $1 \le L \le R \le n$），使得区间长度与该区间内元素最小值的乘积最大，即最大化：
$$ (R - L + 1) \cdot \min(A_L, A_{L+1}, \dots, A_R) $$

请输出这个乘积的最大值。

---

### 输入格式

第一行包含一个整数 $n$。  
第二行包含 $n$ 个整数，分别表示 $A_1, A_2, \dots, A_n$，相邻两数之间用空格分隔。

---

### 输出格式

输出一行一个整数，表示乘积的最大值。

---

### 样例

#### 样例输入 1
```text
5
1 1 3 3 1
```

#### 样例输出 1
```text
6
```

---

### 数据范围

* 对于 $40\%$ 的数据：$1 \le n \le 5000$，$1 \le A_i \le 5000$。
* 对于 $100\%$ 的数据：$1 \le n \le 3 \times 10^5$，$1 \le A_i \le 10^9$。

#### 为什么它是单调栈的经典应用？
这道国赛题本质上就是 **“柱状图中最大的矩形”（LeetCode 84）** 的换皮题。
* 如果采用暴力，我们需要枚举所有的区间 $[L, R]$，复杂度是 $O(n^2)$ 甚至是 $O(n^3)$，必然会超时。
* 如果运用**单调栈**：我们换个角度思考，**固定每一个数 $A[i]$ 作为区间的最小值**。
  * 为了让乘积最大，我们希望区间尽可能宽。所以我们要以 $i$ 为中心，向左和向右延伸。
  * 能延伸的极限，就是遇到**第一个比 $A[i]$ 小的数**。
  * 这就完美对应了单调栈的模板：
    * 用单调栈求出 $A[i]$ **左侧第一个比它小的数**的下标 $L[i]$。
    * 用单调栈求出 $A[i]$ **右侧第一个比它小的数**的下标 $R[i]$。
  * 那么以 $A[i]$ 为最小值的最宽区间长度就是 `R[i] - L[i] - 1`，贡献的乘积为 `A[i] * (R[i] - L[i] - 1)`。
  * 整体预处理只需 $O(n)$，最后遍历一遍数组取最大值即可，能在时限内通关。

**解：**

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr); cout.tie(nullptr);

    int n;
    cin >> n;
    
    vector<int> a(n);
    for (int i =0 ;i < n; i++)
    {
        cin >> a[i];
    }

    // 求左侧第一个更小
    vector<int> L(n, -1);  // 左侧无解设为 -1
    stack<int> st_l;  // 栈内只存下标

    for (int i = 0; i < n; i++)
    {
        while (!st_l.empty() && a[st_l.top()] >= a[i])  // 找更小，去掉 >= 的
        {
            st_l.pop();
        }
        if (!st_l.empty())  // 非空记录答案
        {
            L[i] = st_l.top();  // 为栈顶元素
        }
        // else 不需要

        st_l.push(i);  // 下标入栈
    }


    // 求右侧第一个更小
    vector<int> R(n, n);  // 右侧无解记为 n
    stack<int> st_r;

    for (int i = n - 1; i >= 0; i--)
    {
        while (!st_r.empty() && a[st_r.top()] >= a[i])
        {
            st_r.pop();
        }
        if (!st_r.empty())
        {
            R[i] = st_r.top();
        }

        st_r.push(i);
    }


    // 计算答案
    int ans = 0;
    for (int i = 0; i < n; i++)
    {
        int cal = ((R[i] - 1) - (L[i] + 1) + 1) * a[i];  // L、R 是开区间边界 
        ans = max(ans, cal);
    }

    cout << ans << endl;

    return 0;
}
```

---

一些板子：

### 1. 二分答案
*   **什么时候使用**：求“最大值的最小值”或“最小值的最大值”；或者直接求解非常困难，但判定一个具体的解是否合法（即写出 `check` 函数）非常容易。
*   **限制条件**：答案区间必须具有**单调性**（即：如果 $x$ 满足条件，那么所有 $<x$ 或 $>x$ 的数也必然满足/不满足条件）。
*   **时间复杂度**：$O(\log(\text{区间长度}) \times \text{check的时间复杂度})$。

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

// 判定函数：判断当前值 mid 是否合法
bool check(int mid)
{
    // 在此编写判定逻辑（通常使用贪心或简单模拟）
    return true; 
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr); cout.tie(nullptr);

    int l = 0, r = 1e18;  // 确立合法的初始答案区间范围
    int ans = -1;
    while (l <= r)
    {
        int mid = l + (r - l) / 2;  // 防止溢出
        if (check(mid))
        {
            ans = mid;
            l = mid + 1;  // 极大化答案（求满足条件的最大值）
            // r = mid - 1; // 极小化答案（求满足条件的最小值）
        }
        else
        {
            r = mid - 1;
            // l = mid + 1;
        }
    }
    return 0;
}
```

---

### 2. 网格图 BFS 搜索
*   **什么时候使用**：在网格图（地图）中求起点到终点的**最少步数**（最短距离）；或者各边权重全部为 1 的无权图最短路。
*   **限制条件**：状态数不能过大（通常网格大小 $N \times M \le 10^6$），且移动的步权必须完全相等。
*   **时间复杂度**：$O(N \times M)$。

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

int n, m;
int dx[] = {-1, 1, 0, 0};  // 常用上下左右方向数组
int dy[] = {0, 0, -1, 1};

void bfs(int sx, int sy, vector<vector<char>>& grid)
{
    // dist 数组同时起到“记录最短步数”和“标记是否访问（-1为未访问）”的作用
    vector<vector<int>> dist(n, vector<int>(m, -1));
    queue<pair<int, int>> q;
    
    q.push({sx, sy});
    dist[sx][sy] = 0;
    
    while (!q.empty())
    {
        auto [x, y] = q.front();
        q.pop();
        
        for (int i = 0; i < 4; i++)
        {
            int nx = x + dx[i];
            int ny = y + dy[i];
            
            // 1. 判断是否越界 2. 判断是否为障碍物 '#' 3. 判断是否已访问
            if (nx >= 0 && nx < n && ny >= 0 && ny < m && grid[nx][ny] != '#' && dist[nx][ny] == -1)
            {
                dist[nx][ny] = dist[x][y] + 1;
                q.push({nx, ny});
            }
        }
    }
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr); cout.tie(nullptr);

    return 0;
}
```

---

### 3. DFS 回溯
*   **什么时候使用**：求全排列、子集生成、组合问题；或者在数据范围极小时，进行暴力穷举搜索。
*   **限制条件**：由于是指数级或阶乘级复杂度，数据规模 $N$ 通常不能超过 15~20。需要根据题目特征及时剪枝，否则极易超时。
*   **时间复杂度**：$O(2^N)$ 或 $O(N!)$。

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

int n;
vector<int> path;  // 记录当前搜索路径
vector<bool> visited;  // 标记节点是否被选用

void dfs(int step)
{
    // 递归边界：搜索完所有位置
    if (step > n)
    {
        // 记录或输出当前排列/组合
        return;
    }
    for (int i = 1; i <= n; i++)
    {
        if (!visited[i])
        {
            visited[i] = true;
            path.push_back(i);  // 保护现场
            
            dfs(step + 1);  // 递归进入下一层
            
            path.pop_back();  // 恢复现场
            visited[i] = false;
        }
    }
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr); cout.tie(nullptr);

    return 0;
}
```

---

### 4. 并查集 (DSU)
*   **什么时候使用**：动态维护和查询集合的合并、判断元素是否在同一个集合内、图的连通块计数、Kruskal 最小生成树。
*   **限制条件**：标准的并查集不支持（或极难支持）拆分已合并集合的操作。
*   **时间复杂度**：单次操作接近 $O(1)$，效率极高。

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

struct DSU
{
    vector<int> parent;
    DSU(int n)
    {
        parent.resize(n + 1);
        iota(parent.begin(), parent.end(), 0);  // 初始时每个节点的父亲是它自己
    }
    int find(int i)
    {
        if (parent[i] == i)
        {
            return i;
        }
        return parent[i] = find(parent[i]);  // 路径压缩，使后续查询变为 O(1)
    }
    bool unite(int i, int j)
    {
        int root_i = find(i);
        int root_j = find(j);
        if (root_i != root_j)
        {
            parent[root_i] = root_j;  // 合并两个集合
            return true;  // 成功合并返回 true
        }
        return false;  // 原本已在一个集合返回 false
    }
    bool same(int i, int j)
    {
        return find(i) == find(j);  // 判断连通性
    }
};

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr); cout.tie(nullptr);

    return 0;
}
```

---

### 5. Dijkstra 单源最短路
*   **什么时候使用**：求单源（某一个特定起点）到图中其他所有点的最短路径长度。
*   **限制条件**：图中**不能存在负权边**。如果存在负权边，必须改用 SPFA 算法。
*   **时间复杂度**：$O(M \log N)$（其中 $N$ 为点数，$M$ 为边数）。适用于点数在 $10^5$ 级别的稀疏图。

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

const int INF = 1e18;  // 使用足够大的数表示不可达
struct Edge
{
    int to, weight;
};
vector<vector<Edge>> adj;  // 邻接表建图
vector<int> dist;  // 存储起点到各点的最短距离

void dijkstra(int start)
{
    int n = adj.size() - 1;
    dist.assign(n + 1, INF);
    // 优先队列：小根堆，维护 {距离, 节点编号}
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    
    dist[start] = 0;
    pq.push({0, start});
    
    while (!pq.empty())
    {
        auto [d, u] = pq.top();
        pq.pop();
        
        if (d > dist[u])  // 懒惰删除，若当前出的距离已经不是最短，则跳过
        {
            continue;
        }
        
        for (auto& edge : adj[u])
        {
            int v = edge.to;
            int w = edge.weight;
            if (dist[u] + w < dist[v])  // 松弛操作
            {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr); cout.tie(nullptr);

    return 0;
}
```

---

### 6. 树状数组 (Fenwick Tree)
*   **什么时候使用**：频繁进行“单点修改”与“区间求和”操作，或配合差分进行“区间修改”与“单点查询”。
*   **限制条件**：维护的信息必须满足**结合律**且**可逆**（如加法、乘法。不适合求区间最值，最值不可逆，不可逆信息建议使用线段树）。下标必须从 1 开始。
*   **时间复杂度**：修改和查询均稳定为 $O(\log N)$。代码极短，不易写错。

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

struct FenwickTree
{
    int n;
    vector<int> tree;
    FenwickTree(int n) : n(n), tree(n + 1, 0) {}
    
    // 单点修改：在位置 i 加上 delta
    void add(int i, int delta)
    {
        while (i <= n)
        {
            tree[i] += delta;
            i += i & -i;  // 加上二进制最低位的 1 (lowbit)
        }
    }
    
    // 前缀和查询：求区间 [1, i] 的元素和
    int query(int i)
    {
        int sum = 0;
        while (i > 0)
        {
            sum += tree[i];
            i -= i & -i;  // 减去二进制最低位的 1 (lowbit)
        }
        return sum;
    }
    
    // 区间和查询：求区间 [l, r] 的元素和
    int rangeQuery(int l, int r)
    {
        return query(r) - query(l - 1);
    }
};

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr); cout.tie(nullptr);

    return 0;
}
```

---

## 其他模板整理

### 1. 二维前缀和与二维差分
*   **什么时候使用**：
    *   **二维前缀和**：多次查询一个网格（矩阵）中任意子矩形区域的数值总和。
    *   **二维差分**：多次对一个网格中的任意子矩形区域的所有元素同时加上一个值，最终只需要求一次修改后的网格状态。
*   **限制条件**：网格大小通常需满足 $N \times M \le 10^6$（例如 $1000 \times 1000$）。数组下标需从 $1$ 开始。
*   **时间复杂度**：
    *   二维前缀和：$O(N \times M)$ 预处理，单次查询 $O(1)$。
    *   二维差分：单次修改 $O(1)$，最终 $O(N \times M)$ 还原。

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

// 二维前缀和
struct PreSum2D
{
    int n, m;
    vector<vector<int>> sum;
    PreSum2D(int n, int m, const vector<vector<int>>& grid) : n(n), m(m)
    {
        sum.assign(n + 1, vector<int>(m + 1, 0));
        for (int i = 1; i <= n; i++)
        {
            for (int j = 1; j <= m; j++)
            {
                // 经典容斥原理更新前缀和
                sum[i][j] = grid[i][j] + sum[i - 1][j] + sum[i][j - 1] - sum[i - 1][j - 1];
            }
        }
    }
    // 查询左上角 (x1, y1) 到右下角 (x2, y2) 的子矩阵和
    int query(int x1, int y1, int x2, int y2)
    {
        return sum[x2][y2] - sum[x1 - 1][y2] - sum[x2][y1 - 1] + sum[x1 - 1][y1 - 1];
    }
};

// 二维差分
struct Diff2D
{
    int n, m;
    vector<vector<int>> diff;
    Diff2D(int n, int m) : n(n), m(m)
    {
        diff.assign(n + 2, vector<int>(m + 2, 0));
    }
    // 对左上角 (x1, y1) 到右下角 (x2, y2) 的子矩阵加上 val
    void add(int x1, int y1, int x2, int y2, int val)
    {
        diff[x1][y1] += val;
        diff[x1][y2 + 1] -= val;
        diff[x2 + 1][y1] -= val;
        diff[x2 + 1][y2 + 1] += val;
    }
    // 还原得到原数组
    vector<vector<int>> build()
    {
        vector<vector<int>> grid(n + 1, vector<int>(m + 1, 0));
        for (int i = 1; i <= n; i++)
        {
            for (int j = 1; j <= m; j++)
            {
                grid[i][j] = diff[i][j] + grid[i - 1][j] + grid[i][j - 1] - grid[i - 1][j - 1];
            }
        }
        return grid;
    }
};

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr); cout.tie(nullptr);

    return 0;
}
```

---

### 2. 快速幂与乘法逆元
*   **什么时候使用**：
    *   **快速幂**：快速计算 $a^b \pmod p$，特别是当 $b$ 达到 $10^{18}$ 级别时。
    *   **乘法逆元**：在有模数的算术下做除法时（即求 $\frac{a}{b} \pmod p$），需要转换为 $a \times \text{inv}(b) \pmod p$。
*   **限制条件**：使用费马小定理求逆元时，模数 $MOD$ **必须为质数**，且底数 $a$ 不能是 $MOD$ 的倍数。
*   **时间复杂度**：$O(\log b)$。

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

const int MOD = 1e9 + 7; // 通常为 1e9 + 7 或 998244353

// 快速幂 a^b % MOD
int qpow(int a, int b)
{
    int res = 1;
    a %= MOD;
    while (b > 0)
    {
        if (b & 1)
        {
            res = (res * a) % MOD;
        }
        a = (a * a) % MOD;
        b >>= 1;
    }
    return res;
}

// 费马小定理求乘法逆元 (MOD 必须是质数)
int inv(int a)
{
    return qpow(a, MOD - 2);
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr); cout.tie(nullptr);

    return 0;
}
```

---

### 3. 双哈希字符串匹配
*   **什么时候使用**：判断一个长字符串中各子串是否相等、求公共子串、判断回文子串等。常作为 KMP 或 AC 自动机的暴力替代品（用哈希表存哈希值可做到几乎 $O(1)$ 判定）。
*   **限制条件**：单哈希容易发生哈希冲突从而被特定数据卡住，**双哈希**（即用两个不同的底数和模数计算）可基本保证不冲突。
*   **时间复杂度**：预处理 $O(N)$，每次查询任意区间子串哈希值 $O(1)$。

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

struct StringHash
{
    int n;
    string s;
    const int BASE1 = 131, MOD1 = 1e9 + 7;
    const int BASE2 = 13331, MOD2 = 1e9 + 9;
    vector<int> h1, p1, h2, p2;

    StringHash(const string& str) : s(str), n(str.size())
    {
        h1.resize(n + 1, 0); p1.resize(n + 1, 1);
        h2.resize(n + 1, 0); p2.resize(n + 1, 1);
        for (int i = 0; i < n; i++)
        {
            h1[i + 1] = (h1[i] * BASE1 + s[i]) % MOD1;
            p1[i + 1] = (p1[i] * BASE1) % MOD1;
            
            h2[i + 1] = (h2[i] * BASE2 + s[i]) % MOD2;
            p2[i + 1] = (p2[i] * BASE2) % MOD2;
        }
    }
    // 获取子串 s[l..r] 的双哈希值 (下标 0-based，闭区间)
    pair<int, int> get(int l, int r)
    {
        l++; r++; // 转为 1-based 下标计算
        int hash1 = (h1[r] - h1[l - 1] * p1[r - l + 1] % MOD1 + MOD1) % MOD1;
        int hash2 = (h2[r] - h2[l - 1] * p2[r - l + 1] % MOD2 + MOD2) % MOD2;
        return {hash1, hash2};
    }
};

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr); cout.tie(nullptr);

    return 0;
}
```

---

### 4. 单调队列 (滑动窗口最值)
*   **什么时候使用**：在一个固定大小为 $k$ 的滑动窗口内，随着窗口向右移动，频繁查询窗口内的最大值或最小值；或用于优化 1D 动态规划转移（单调队列优化DP）。
*   **限制条件**：滑动窗口的边界必须是单调向右移动的，且查询的范围大小固定。
*   **时间复杂度**：每个元素最多进队一次、出队一次，均摊复杂度 $O(N)$。

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

// 滑动窗口最值：求大小为 k 的窗口内最小值
vector<int> minSlidingWindow(vector<int>& nums, int k)
{
    int n = nums.size();
    deque<int> dq; // 存储元素下标
    vector<int> res;
    
    for (int i = 0; i < n; i++)
    {
        // 1. 移除超出当前滑动窗口左边界的下标
        if (!dq.empty() && dq.front() < i - k + 1)
        {
            dq.pop_front();
        }
        // 2. 保持队列中下标对应的值单调递增（求最小值用 >，求最大值用 <）
        while (!dq.empty() && nums[dq.back()] > nums[i])
        {
            dq.pop_back();
        }
        dq.push_back(i);
        
        // 3. 当窗口大小达到 k 时，队头元素对应的就是当前窗口的最值
        if (i >= k - 1)
        {
            res.push_back(nums[dq.front()]);
        }
    }
    return res;
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr); cout.tie(nullptr);

    return 0;
}
```

---

### 5. Kruskal 最小生成树 (MST)
*   **什么时候使用**：给定一个无向带权图，求一个连接所有节点的树，且该树的边权总和最小。
*   **限制条件**：不能直接用于有权有向图的最小生成树（那是朱-刘算法）。
*   **时间复杂度**：$O(M \log M)$（其中 $M$ 为边数），性能瓶颈在于边权排序，极易编写。

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

struct Edge
{
    int u, v, w;
    bool operator<(const Edge& other) const
    {
        return w < other.w;
    }
};

struct DSU
{
    vector<int> parent;
    DSU(int n)
    {
        parent.resize(n + 1);
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int i)
    {
        if (parent[i] == i)
        {
            return i;
        }
        return parent[i] = find(parent[i]);
    }
    bool unite(int i, int j)
    {
        int root_i = find(i);
        int root_j = find(j);
        if (root_i != root_j)
        {
            parent[root_i] = root_j;
            return true;
        }
        return false;
    }
};

// 返回：{最小生成树权值和, 实际加入的边数}。若 边数 != n - 1 则代表图不连通
pair<int, int> kruskal(int n, vector<Edge>& edges)
{
    sort(edges.begin(), edges.end());
    DSU dsu(n);
    int mst_weight = 0;
    int edge_count = 0;
    
    for (auto& edge : edges)
    {
        if (dsu.unite(edge.u, edge.v))
        {
            mst_weight += edge.w;
            edge_count++;
            if (edge_count == n - 1)
            {
                break;
            }
        }
    }
    return {mst_weight, edge_count};
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr); cout.tie(nullptr);

    return 0;
}
```