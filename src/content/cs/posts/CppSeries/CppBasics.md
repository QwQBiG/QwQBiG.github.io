---
title: "C++ 基础知识与常用库函数"
date: 2026-03-05T19:00:00+08:00
tags: ["C++", "蓝桥杯", "算法竞赛", "C++11", "基础"]
categories: ["语言学习"]
series: ["C++的世界"]
weight: 1
---

# C++ 基础知识与常用库函数

## 一、输入输出

### 1.1 cin 与 cout

`cin` 和 `cout` 是 C++ 标准库提供的输入输出流对象。

**cin 读取字符串**：遇到空格或回车停止，只读取一个单词。

```cpp
string s;
cin >> s;  // 输入 "hello world"，s = "hello"
```

**读取整行字符串**：使用 `getline(cin, s)`。

```cpp
string s;
getline(cin, s);  // 输入 "hello world"，s = "hello world"
```

**混合输入**：`cin >> n` 后使用 `getline` 需要清除缓冲区。

```cpp
int n;
cin >> n;
cin.ignore();    // 清除换行符
string s;
getline(cin, s);
```

### 1.2 输出精度控制

使用 `<iomanip>` 库的 `fixed` 和 `setprecision` 控制浮点数输出精度。

```cpp
#include <iomanip>
double res = 3.1415926;
cout << fixed << setprecision(2) << res << endl;  // 3.14（四舍五入）
```

---

## 二、常见基础知识

### 2.1 ASCII 码

| 字符 | ASCII 值 |
|------|----------|
| '0' | 48 |
| 'A' | 65 |
| 'a' | 97 |

**大小写转换**：大小写字母 ASCII 值相差 32。

```cpp
char upper = 'A';
char lower = upper + 32;  // 'a'

char lower2 = 'z';
char upper2 = lower2 - 32;  // 'Z'
```

**判断与转换函数**：

```cpp
islower('a');   // true，判断是否小写
isupper('A');   // true，判断是否大写
tolower('A');   // 'a'，转小写
toupper('a');   // 'A'，转大写
```

### 2.2 类型转换

**字符串转数字**：

```cpp
string s = "12345";
int i = stoi(s);           // 12345
long long ll = stoll(s);   // 12345
double d = stod("3.14");   // 3.14
```

**数字转字符串**：

```cpp
int n = 123;
string s = to_string(n);     // "123"
double d = 3.14;
string s2 = to_string(d);    // "3.140000"
```

### 2.3 进制转换

```cpp
// 十进制转其他进制
int n = 255;
cout << oct << n << endl;   // 377（八进制）
cout << dec << n << endl;   // 255（十进制）
cout << hex << n << endl;   // ff（十六进制）

// 其他进制转十进制
string bin = "1111";
int val = stoi(bin, nullptr, 2);   // 15（二进制转十进制）
string hex_str = "ff";
int val2 = stoi(hex_str, nullptr, 16);  // 255（十六进制转十进制）
```

### 2.4 位运算

| 运算符 | 含义 | 示例 |
|--------|------|------|
| `&` | 按位与 | `a & b` |
| `\|` | 按位或 | `a \| b` |
| `^` | 按位异或 | `a ^ b` |
| `~` | 按位取反 | `~a` |
| `<<` | 左移 | `a << n` |
| `>>` | 右移 | `a >> n` |

**常用技巧**：

```cpp
// 判断奇偶
bool is_odd = n & 1;

// 交换两数
a ^= b; b ^= a; a ^= b;

// 取最低位 1
int lowbit = n & (-n);

// 判断是否是 2 的幂
bool is_power = n > 0 && (n & (n - 1)) == 0;
```

---

## 三、常用库函数

### 3.1 二分查找

`lower_bound` 和 `upper_bound` 用于有序序列的二分查找，返回迭代器，区间为左闭右开 `[lower, upper)`。

```cpp
vector<int> v = {1, 2, 2, 2, 3, 4, 5};

// lower_bound: 第一个 >= target 的位置
auto lb = lower_bound(v.begin(), v.end(), 2);  // 指向第1个2

// upper_bound: 第一个 > target 的位置
auto ub = upper_bound(v.begin(), v.end(), 2);  // 指向3

// 计算 target 出现的次数
int cnt = ub - lb;  // 3
```

### 3.2 排序 sort

```cpp
sort(v.begin(), v.end());                      // 升序
sort(v.begin(), v.end(), greater<int>());      // 降序

// 自定义比较函数
bool cmp(int a, int b) { return a > b; }
sort(v.begin(), v.end(), cmp);

// Lambda 表达式
sort(v.begin(), v.end(), [](int a, int b) {
    return a > b;
});
```

### 3.3 数组初始化 memset

`memset` 按字节填充，**只能用于初始化 0 或 -1**。

```cpp
int arr[100];
memset(arr, 0, sizeof(arr));   // 初始化为 0
memset(arr, -1, sizeof(arr));  // 初始化为 -1
```

### 3.4 交换 swap

```cpp
int a = 1, b = 2;
swap(a, b);  // a = 2, b = 1

vector<int> v1 = {1, 2}, v2 = {3, 4};
swap(v1, v2);  // 交换容器内容
```

### 3.5 反转 reverse

反转指定区间 `[first, last)`。

```cpp
vector<int> v = {1, 2, 3, 4, 5};
reverse(v.begin(), v.end());  // {5, 4, 3, 2, 1}

string s = "hello";
reverse(s.begin(), s.end());  // "olleh"
```

### 3.6 删除元素 erase

```cpp
vector<int> v = {1, 2, 3, 4, 5};

// 删除单个元素
v.erase(v.begin() + 2);  // 删除第3个元素，{1, 2, 4, 5}

// 删除区间
v.erase(v.begin(), v.begin() + 2);  // 删除前两个，{4, 5}
```

### 3.7 去重 unique

`unique` 将相邻重复元素移到末尾，返回去重后的末尾迭代器。**需要先排序**。

```cpp
vector<int> v = {1, 2, 2, 3, 3, 3, 4};
sort(v.begin(), v.end());
auto last = unique(v.begin(), v.end());
v.erase(last, v.end());  // {1, 2, 3, 4}
```

### 3.8 全排列 next_permutation

生成下一个字典序排列，返回 `bool` 表示是否成功。

```cpp
vector<int> v = {1, 2, 3};
do {
    for (int x : v) cout << x << " ";
    cout << endl;
} while (next_permutation(v.begin(), v.end()));
// 输出所有 6 种排列
```

`prev_permutation` 生成上一个排列。

### 3.9 最值 min / max

```cpp
int a = min(3, 5);      // 3
int b = max(3, 5);      // 5

// 初始化列表（C++11）
int c = min({1, 2, 3, 4, 5});  // 1
int d = max({1, 2, 3, 4, 5});  // 5
```

### 3.10 最值迭代器 min_element / max_element

返回区间 `[first, last)` 中最小/最大元素的迭代器。

```cpp
vector<int> v = {3, 1, 4, 1, 5, 9, 2, 6};

auto min_it = min_element(v.begin(), v.end());
auto max_it = max_element(v.begin(), v.end());

cout << *min_it << endl;  // 1
cout << *max_it << endl;  // 9

// 获取索引
int min_idx = min_it - v.begin();  // 1
int max_idx = max_it - v.begin();  // 5
```

### 3.11 第 n 小元素 nth_element

将第 n 小的元素放到正确位置，左边都比它小，右边都比它大。

```cpp
vector<int> v = {5, 3, 1, 4, 2};
nth_element(v.begin(), v.begin() + 2, v.end());
// v[2] = 3（第3小的元素）
// v[0..1] <= 3, v[3..4] >= 3
```

---

## 四、常用技巧速查

| 需求 | 方法 |
|------|------|
| 读取整行 | `getline(cin, s)` |
| 数字+字符串混合输入 | `cin >> n; cin.ignore(); getline(cin, s);` |
| 保留小数 | `cout << fixed << setprecision(2) << x;` |
| 字符串转数字 | `stoi()`, `stoll()`, `stod()` |
| 数字转字符串 | `to_string()` |
| 二分查找边界 | `lower_bound()`, `upper_bound()` |
| 排序 | `sort()` |
| 数组初始化 | `memset(arr, 0, sizeof(arr))` |
| 反转 | `reverse()` |
| 去重 | `sort()` + `unique()` + `erase()` |
| 全排列 | `next_permutation()` |
| 最值 | `min()`, `max()`, `min_element()`, `max_element()` |

---

## 总结

本文总结了蓝桥杯竞赛中常用的 C++ 基础知识和库函数。掌握这些内容能够显著提高编码效率和正确率。建议在刷题中反复练习，形成肌肉记忆。
