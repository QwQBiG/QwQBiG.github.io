---
title: "LanQiaoCup"
date: 2026-04-01T14:00:00+08:00
tags: ["算法", "暴力", "蓝桥杯", "C++11"]
categories: ["算法学习"]
series: ["算法合集"]
weight: 1
---

一开始的操作：点开 `Dev-C++` ，新建一个文件，命名后要有 `.cpp` 哈；然后点开上方的工具(T)，点开编译选项(C)，“编译时添加以下命令”要打上对号，然后在框框中输入`-std=c++11` 。

### 一、 暴力枚举与模拟（必须全拿的分数）

---

#### 1. 全排列枚举（填空题/前两题神器）

**考点说明：** 给定几个数字或字符，求所有排列方式。
**必背模板：**

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

vector<int> a = {1,2,3,4,5,6,7,8,9};
// int a[10] = {1, 2, 3, 4, 5, 6, 7, 8, 9};

signed main()
{
	sort(a.begin(), a.end());  // 前提要有序 
    // sort(a, a+n);
	do
	{
        // 在这里处理当前的排列 a
        // 比如 a[0] 到 a[8] 此时就是一个新的排列
	} while (next_permutation(a.begin(), a.end()));
    // } while (next_permutation(a, a + 9));
	
	return 0;
} 
```

> **🔥 蓝桥真题：【凑算式】**
> **题目：** $A + \frac{B}{C} + \frac{DEF}{GHI} = 10$，其中 $A \sim I$ 分别代表 $1 \sim 9$ 的数字，不能重复，求有多少种解法？
> **秒杀思路：** 典型的 1-9 全排列。把 1-9 放到数组里，直接用 `next_permutation` 遍历。
> **防坑技巧：** 题目中有除法，为了防止整除带来的精度问题（如 `5/2=2`），一定要**转化为乘法**！即：$A \times C \times GHI + B \times GHI + DEF \times C == 10 \times C \times GHI$。

**姐：**

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

vector<int> a = {1,2,3,4,5,6,7,8,9};  // 初始化数组，必须是升序的
int ans = 0;

signed main()
{
    ios::sync_with_stdio(false); cin.tie(0); cout.tie(0);  // 关流别忘了

	// sort(a.begin(), a.end());  // 升序
	do
	{
        // 提取字母代表的数字
        // 注意数组下标从 0 开始，所以 a[0] 是 A，a[8] 是 I
		int A = a[0];
		int B = a[1];
		int C = a[2];
		int DEF = a[3] * 100 + a[4] * 10 + a[5];
		int GHI = a[6] * 100 + a[7] * 10 + a[8];
		
        // 除法转乘法验证！
        // 原式: A + B/C + DEF/GHI == 10
        // 通分后: A * C * GHI + B * GHI + DEF * C == 10 * C * GHI
		if (A * C * GHI + B * GHI + DEF * C == 10 * C * GHI)
		{
            ans++;
        }
        
	} while (next_permutation(a.begin(), a.end()));  // 生成下一个排列
	
	cout << ans << endl;  // 本题答案是 29
	return 0;
} 
```

***

#### 2. 二进制枚举子集

**考点说明：** 假设有 $N$ 个物品（$N \le 20$），每个物品选或不选，穷举所有情况。
当你在考场上看到一道题，要求 **“从 $N$ 个物品里选出几个，满足某种条件”**，并且你敏锐地发现 **$N \le 20$** 时，不要犹豫，直接把二进制枚举拍上去！它比写 DFS（深度优先搜索）更简单、代码更短、而且绝对不会出现死循环或栈溢出的Bug。

**为什么用二进制？**
假设有 3 个物品。每个物品只有两种状态：**选（1）** 或 **不选（0）**。
那么所有的选择方案，刚好对应 3 位二进制数：

- `000`（十进制 0）：全都不选
- `001`（十进制 1）：只选第 1 个
- `010`（十进制 2）：只选第 2 个
- ...
- `111`（十进制 7）：全选

**结论：** 对于 $N$ 个物品，一共有 $2^N$ 种选法，刚好对应十进制数字 $0$ 到 $2^N - 1$。

**必背模板：**

```cpp
#include <bits/stdc++.h>
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

signed main()
{
	// 假设 n 是物品总数 (n <= 20)
	// (1 << n) 等价于 2 的 n 次方
	for (int i = 0; i < (1 << n); i++)  // i 代表一种具体的选择方案
	{
	    // 遍历这 n 个物品，看看当前方案 i 里面，选中了哪些物品
	    for (int j = 0; j < n; j++)
		{ 
	        // 核心位运算：检查数字 i 的二进制第 j 位是否为 1
	        // (1 << j) 意思是把 1 左移 j 位。例如 j=2 时，就是 00100
	        if (i & (1 << j))
			{
	            // 如果结果不为 0，说明第 j 个物品被选中了！(注意 j 是从 0 开始的)
	            
	            // 在这里写选中后的处理逻辑...
	        }
	    }
	}
	return 0; 
} 
```

> **🔥 蓝桥经典真题：【选数求和 / 凑金额】**
> **题目描述：** 给定 $N$ 个正整数 $A_1, A_2, ..., A_N$，以及一个目标值 $S$。请你求出：从这 $N$ 个数中任选若干个数，使得它们的和恰好等于 $S$ 的方案数有多少种？
> **数据范围：** $1 \le N \le 20$，$1 \le A_i \le 10^9$，$1 \le S \le 10^{18}$
> **秒杀思路：** 看到 $N \le 20$，果断放弃 DP 背包算法（因为 $S$ 太大了开不下数组），直接使用 **二进制枚举子集**！$2^{20} \approx 1,000,000$（一百万），在 C++ 里跑完只需 0.01 秒，完美满分！

**姐：**

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

int n;
int S;
int a[25];  // 存放数字的数组 

signed main()
{
	ios::sync_with_stdio(false); cin.tie(0); cout.tie(0);  // 关流 
	
	cin >> n >> S;
	for (int i = 0; i < n; i++)
	{
	 	cin >> a[i];
	} 
	
	int ans = 0;  // 记录合法的方案数
	
	// 第一层循环：枚举所有可能的选择方案（0 到 2^n - 1）
    for (int i = 0; i < (1 << n); i++)
	{
        int cur_sum = 0;  // 记录当前这种方案选中的数字总和
        
        // 第二层循环：解析当前方案 i 到底选中了哪些数字
        for (int j = 0; j < n; j++)
		{  
            // 如果方案 i 的第 j 位是 1，说明选中了第 j 个数 a[j]
            if (i & (1 << j))
			{
                cur_sum += a[j];
            }
        } 
        
		// 检查当前方案的总和是否等于目标值 S
        if (cur_sum == S)
		{
            ans++;
        }
    }
    
    cout << ans << endl;
	return 0; 
} 
/*
输入：
5 6
1 2 3 4 5
输出：
3
*/
```

***

#### 3. 日期模拟（蓝桥祖传考点）

**考点说明：** 求两个日期相差几天、求回文日期等。
**必背模板（三个组件）：**

```cpp
// 1. 闰年判断（口诀：四年一闰，百年不闰，四百年再闰）
bool isLeap(int y)
{
    return (y % 4 == 0 && y % 100 != 0) || (y % 400 == 0);
}

// 2. 月份天数数组（务必开 13 的大小，从 1 开始用）
int days[13] = {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};

// 3. 提取某年某月的天数
int getDays(int y, int m)
{
    if (m == 2 && isLeap(y)) return 29;
    return days[m];
}

// 4.可以直接从电脑看见星期几就看日历吧！！！

// 5.暴力算星期
int y = 2000, m = 1, d = 1, w = 6; // 已知 2000年1月1日是星期六(w=6)

while (true)
{
    // 1. 在这里处理当天的逻辑（比如判断是否是周一，是否是1号等）

    // 2. 如果到达了目标日期，退出循环
    // 目标年：target_y
    // 目标月：target_m
    // 目标日：target_d
    if (y == target_y && m == target_m && d == target_d) break;
    
    // 3. 日期推演
    d++;  // 天数+1
    w++;  // 星期+1
    if (w == 8) w = 1; // 星期循环 (1代表周一，7代表周日)
    
    // 4. 检查天数是否超出当前月份的最大天数
    if (d > getDays(y, m))
    {
        d = 1;  // 天数变成下个月1号
        m++;    // 月份+1
        if (m == 13)
        { // 检查是否跨年
            m = 1;  // 月份变成1月
            y++;    // 年份+1
        }
    }
}
```

> **🔥 蓝桥真题：【回文日期】**
> **题目：** 输入一个8位日期（如 20200202），输出下一个回文日期。
> **秒杀思路：** 绝对不要一天一天往上加去模拟（容易写错且麻烦）。直接**枚举年份**（从输入的年份遍历到 9999 年），将年份反转拼成回文串，然后检查这个构造出的 8 位日期是否合法！
> **验证合法性：** 截取出月份和日期，看月份是否在 1-12，日期是否在 `1 ~ getDays(y, m)` 之间。

**姐：**

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

// 月份天数打表（2月平年28天，闰年在代码里单独判断）
int days[13] = {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};

// 检查某个 8 位数日期是否合法
bool check(int date)
{
    int y = date / 10000;        // 提取前 4 位年份
    int m = date % 10000 / 100;  // 提取中间 2 位月份
    int d = date % 100;          // 提取最后 2 位天数
    
    if (m < 1 || m > 12) return false;
    if (d < 1) return false;
    
    // 判断闰年
    if (m == 2 && ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0))
    {
        if (d > 29) return false;
    }
    else
    {
        if (d > days[m]) return false;
    }
    return true;
}

signed main()
{
    int start_date;
    cin >> start_date;
    int start_year = start_date / 10000;
    
    // 骗分核心：不要一天一天加！直接枚举年份（假设最多到 9999 年）
    for (int y = start_year; y <= 9999; y++)
    {
        // C++11：用字符串拼接构造回文日期
        string s_y = to_string(y);  // 例如 "2021"
        string s_m_d = s_y;  // 复制一份
        reverse(s_m_d.begin(), s_m_d.end());  // 翻转变成 "1202"
        
        string s_date = s_y + s_m_d;  // 拼凑成 "20211202"
        int date = stoi(s_date);  // 字符串转回整数
        
        // 如果构造出的日期 > 输入的日期，且日期是合法的
        if (date > start_date && check(date))
        {
            cout << date << endl;
            break; // 找到第一个就结束
        }
    }
    return 0;
}
```

> **🔥 蓝桥真题：【跑步锻炼】（蓝桥省赛超级经典题）**
> **题目：** 小蓝每天都要跑步锻炼。正常情况下，小蓝每天跑 $1$ 千米。如果这一天是 **周一** 或者 **每个月的第一天（1号）**，小蓝就会多跑 $1$ 千米（也就是跑 $2$ 千米）。小蓝从 `2000年1月1日`（**星期六**）开始一直跑步，跑到 `2020年10月1日`（星期四）结束。请问这期间小蓝一共跑了多少千米？
> **秒杀思路：** 这就是上面那个模板量身定制的题！直接套入模板，判断 `w == 1`（周一）或者 `d == 1`（每月一号），满足条件就加 2 千米，否则加 1 千米。

**姐：**

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

// 1. 月份天数数组
signed days[13] = {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
// 2. 闰年判断
bool isLeap(int y)
{
    return (y % 4 == 0 && y % 100 != 0) || (y % 400 == 0);
}
// 3. 提取当月天数
signed getDays(int y, int m)
{
    if (m == 2 && isLeap(y)) return 29;
    return days[m];
}

signed main()
{
    ios::sync_with_stdio(false); cin.tie(0); cout.tie(0);  // 关流

    // 初始状态设置
    int y = 2000, m = 1, d = 1, w = 6;  // 题目给了 2000年1月1日是周六
    int end_y = 2020, end_m = 10, end_d = 1;  // 结束日期
    int total_km = 0;  // 记录总公里数
    
    while (true)
    {
        // 处理当天
        if (w == 1 || d == 1)
        {
            // 如果是周一，或者是每个月的1号
            total_km += 2;
        }
        else
        {
            // 正常情况
            total_km += 1;
        }
        
        // 判断是否到达最后一天，到了就跳出循环
        if (y == end_y && m == end_m && d == end_d)
        {
            break; 
        }
        
        // 进入下一天
        d++;
        w++;
        if (w == 8) w = 1; // 保证星期在 1~7 之间循环
        
        if (d > getDays(y, m))
        {
            // 如果这天超过了当月的最大天数
            d = 1;  // 变成下个月 1号
            m++;
            if (m == 13)  // 如果超出了 12月
            {
                m = 1;  // 变成明年的 1月
                y++;
            }
        }
    }
    
    cout << total_km << endl;  // 本题正确答案是 8879
    return 0;
}
```

***

### 二、 前缀和与差分（降低复杂度的核心）

---

**核心思想：** 把 $O(N)$ 的区间求和/区间加法，变成 $O(1)$ 的操作。**数组下标一定要从 1 开始！**

#### 1. 一维前缀和 & 差分

**模板：**
```cpp
// 前缀和（求区间 [L, R] 的和）
for (int i = 1; i <= n; i++) sum[i] = sum[i-1] + a[i]; // 预处理
int ans = sum[R] - sum[L-1];                     // O(1) 查询

// 差分（给区间 [L, R] 所有数加上 x）
d[L] += x; 
d[R+1] -= x; 
// 最后求一遍差分数组的前缀和，就还原了修改后的原数组 a
for (int i = 1; i <= n; i++) a[i] = a[i-1] + d[i];
```

#### 2. 二维前缀和（图像/矩阵）

**模板：**
```cpp
// 预处理：求出左上角(1,1)到(i,j)的矩阵和 (注意加上 a[i][j])
s[i][j] = s[i-1][j] + s[i][j-1] - s[i-1][j-1] + a[i][j];

// 查询：求左上角(x1, y1)到右下角(x2, y2)的子矩阵和 (背熟这个公式)
int ans = s[x2][y2] - s[x1-1][y2] - s[x2][y1-1] + s[x1-1][y1-1];
```

> **🔥 蓝桥真题：【K倍区间】**
> **题目：** 给定一个序列，求有多少个连续子区间，其和是 K 的倍数。
> **秒杀思路：** `区间和 = sum[R] - sum[L-1]`。要使其是 K 的倍数，即 `(sum[R] - sum[L-1]) % K == 0`，推导出 `sum[R] % K == sum[L-1] % K`。
> **具体做法：** 求前缀和的时候直接对 K 取模。用一个数组 `cnt` 记录每个余数出现的次数。遍历一次，遇到相同的余数组合一下即可（不要用暴力 $O(N^2)$ 双重循环，会超时！）。

**姐：**
```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

const int MAXN = 100005;
int cnt[MAXN]; // 记录每种余数出现的次数
int ans = 0;   

signed main()
{
    ios::sync_with_stdio(false); cin.tie(0); cout.tie(0);  // 关流
    
    int n, k;
    cin >> n >> k;
    
    int sum = 0; 
    cnt[0] = 1;  // 余数为 0 本身就是一个合法的 k 倍区间！必须初始化为 1
    
    for (int i = 1; i <= n; i++)
    {
        int x;
        cin >> x;
        sum = (sum + x) % k;  // 边读入，边求前缀和，边取模
        
        // 如果之前也出现过余数为 sum 的前缀和，它们之间的区间和就是 k 的倍数
        // 可以直接把之前出现的次数累加到答案里
        ans += cnt[sum];
        
        // 当前余数出现的次数 + 1
        cnt[sum]++; 
    }
    
    cout << ans << "\n";
    return 0;
}
/*
输入：
4 2
1 1 2 1
输出：
4
*/
```

---

### 三、 二分法（专治“最大值最小”、“最小值最大”）

**核心判断标准：** 如果题目问“最多能分多少”、“最少需要多长”，且这个答案具有**单调性**（比如：切得越长，切出的块数越少），直接上二分！

**必背模板（二分答案，防止死循环的黄金法则）：**

```cpp
// 情况1：尽量往左找 (求最小的满足条件的答案)
int l = 0, r = 1e9;
while (l < r)
{
    int mid = l + (r - l) / 2;  // 不加1
    if (check(mid)) r = mid;  // 满足条件，答案在 mid 或 mid 左边
    else l = mid + 1;  // 不满足条件，答案在 mid 右边
}
cout << l;

// 情况2：尽量往右找 (求最大的满足条件的答案)
int l = 1, r = 1e9;
while (l < r)
{
    int mid = l + (r - l + 1) / 2;  // 往右找，mid 计算必须 +1，否则 l=r-1 时死循环
    if (check(mid)) l = mid;  // 满足条件，答案在 mid 或 mid 右边
    else r = mid - 1;  // 不满足条件，答案在 mid 左边
}
cout << l;
```

> **🔥 蓝桥真题：【分巧克力】**
> **题目：** 有 $N$ 块长方形巧克力（长宽已知），要切出 $K$ 块形状相同的正方形巧克力。求正方形的**最大边长**。
> **秒杀思路：** “最大边长” -> 二分答案（情况2）。边长可以二分，假设当前二分的边长为 `mid`，如何 `check` 够不够 $K$ 块？
> 对于长为 $H$ 宽为 $W$ 的巧克力，能切出的 `mid * mid` 块数为：`(H / mid) * (W / mid)`。把所有巧克力切出的块数加起来，看是否大于等于 $K$ 即可。
> 复杂度从暴力的 $O(10^5)$ 瞬间降为 $O(N \log (\text{最大边长}))$。

**姐：**、
```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

const int MAXN = 100005;
int h[MAXN], w[MAXN];
int n, k;

// check 函数：判断假设边长为 mid 时，能不能切出至少 k 块
bool check(int mid)
{
    int res = 0;  // 切出的总块数，可能很大，用 long long
    for (int i = 1; i <= n; i++)
    {
        res += (h[i] / mid) * (w[i] / mid); 
        if (res >= k) return true;  // 一旦够了提前返回，加速！
    }
    return false;  // 全切完了都不够 k 块
}

signed main()
{
    ios::sync_with_stdio(false); cin.tie(0); cout.tie(0);  // 关流

    cin >> n >> k;
    for (int i = 1; i <= n; i++)
    {
        cin >> h[i] >> w[i];
    }
    
    // 开始二分答案（边长范围：1 到 100000）
    int l = 1, r = 100000; 
    while (l < r)
    {
        // 核心：求“最大值”，即尽量往右找，mid 计算必须 +1！
        int mid = l + (r - l) / 2 + 1; 
        
        if (check(mid))
        {
            // 如果 mid 边长能切够，说明答案可能就是 mid，或者还能更大
            l = mid; 
        }
        else 
        {
            // 如果切不够，说明 mid 太大了，答案一定在 mid 左边
            r = mid - 1;
        }
    }
    
    cout << l << endl; // 最终 l 和 r 会相遇，输出 l 即可
    return 0;
}
/*
输入：
2 10
6 5
5 6
输出：
2
*/
```

---

### 四、 基础数论与数学（C++自带外挂）

---

#### 1. 最大公约数 (GCD) 与最小公倍数 (LCM)

不要手写辗转相除法了，直接用 C++11 内置函数！
**代码：**
```cpp
// #include <algorithm>  // __gcd 在 algorithm 里
int a = 12, b = 18;
int gcd_val = std::__gcd(a, b); 
int lcm_val = a / gcd_val * b; // 一定要先除后乘，防溢出！
```

> **🔥 蓝桥真题：【等差数列】**
> **题目：** 给定 $N$ 个整数，它们是一个等差数列的子序列，求这个等差数列的最少项数。
> **秒杀思路：** 将数组排序，求出相邻两项的差值。所有差值的**最大公约数 (GCD)** 就是这个等差数列的公差 $d$！如果 $d == 0$，答案就是 $N$；否则答案是 `(最大值 - 最小值) / d + 1`。

**姐：**
```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

const int MAXN = 100005;
int a[MAXN];

signed main()
{
    ios::sync_with_stdio(false); cin.tie(0); cout.tie(0);  // 关流

    int n;
    cin >> n;
    for (int i = 0; i < n; i++)
    {
        cin >> a[i];
    }
    
    // 先把数组排序
    sort(a, a + n);
    
    // 找相邻数字之差的最大公约数 (就是公差 d)
    int d = a[1] - a[0];
    for (int i = 2; i < n; i++)
    {
        d = __gcd(d, a[i] - a[i-1]);  // 直接用 C++ 自带的求最大公约数函数！
    }
    
    // 如果所有数都一样，公差 d = 0！
    // 此时不能用除法，否则报除以 0 的错误直接 0 分。
    if (d == 0)
    {
        cout << n << endl; // 几个数就是几项
    }
    else
    {
        // 公式：(最大值 - 最小值) / 公差 + 1
        int ans = (a[n-1] - a[0]) / d + 1;
        cout << ans << endl;
    }
    
    return 0;
}
/*
输入：
4
1 4 7 10
输出：
5
*/
```

---

#### 2. 素数判断（两种级别）

**模板：**
```cpp
// 级别1：单个数判断（O(√N)）- 填空题常用
bool isPrime(int n)
{
    if (n < 2) return false;
    for (int i = 2; i * i <= n; i++)  // 必须写 i*i <= n
    {
        if (n % i == 0) return false;
    }
    return true;
}

// 级别2：埃氏筛法（求 1~N 以内的所有素数）- 编程题提速用
const int MAX = 100005;
bool st[MAX];  // false 表示是素数
void sieve()
{
    st[0] = st[1] = true;
    for (int i = 2; i * i < MAX; i++)
    {
        if (!st[i])
        {
            for (int j = i * i; j < MAX; j += i)
            {
                st[j] = true; // 把素数的倍数筛掉
            }
        }
    }
}
```

---

#### 3. 快速幂（求 $a^b \pmod p$）

**考点说明：** 当 $b$ 达到 $10^9$ 级别时，普通 `for` 循环必超时，快速幂能把时间降到 $O(\log b)$。
**模板：**
```cpp
int qpow(int a, int b, int p)
{
    int res = 1;
    a %= p; // 防治 a 初始就比 p 大
    while (b > 0)
    {
        if (b & 1) res = (res * a) % p;  // 如果二进制最低位是 1
        a = (a * a) % p;  // 底数平方
        b >>= 1;  // 指数右移一位
    }
    return res;
}
```

---


