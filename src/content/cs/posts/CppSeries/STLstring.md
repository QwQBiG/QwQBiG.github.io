---
title: "STL string - 字符串处理"
date: 2026-03-05T13:00:00+08:00
tags: ["C++", "STL", "cpp", "编程语言", "算法竞赛", "C++11"]
categories: ["语言学习"]
series: ["C++的世界"]
weight: 5
---

## string - 字符串处理

`std::string` 是 C++ 中最常用的字符串类，提供了丰富的字符串操作方法。在算法竞赛中，字符串处理是一个常见的考点，掌握 string 的使用技巧能大大提升解题效率。

### 竞赛中的核心考点

| 操作 | 时间复杂度 | 竞赛要点 |
|------|-----------|----------|
| 访问单个字符 | O(1) | 随机访问 |
| 字符串拼接 | O(n) | 注意内存分配 |
| 子串提取 | O(n) | 提取子字符串 |
| 查找 | O(n) | 查找子串或字符 |
| 替换 | O(n) | 替换子串 |
| 插入/删除 | O(n) | 注意性能影响 |
| 比较 | O(n) | 字典序比较 |

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
    string s1;
    
    // 字符串字面量构造
    string s2 = "hello";
    string s3("world");
    
    // 重复构造
    string s4(5, 'a');  // "aaaaa"
    
    // 从 C 风格字符串构造
    const char* c_str = "test";
    string s5(c_str);
    
    // 从其他 string 构造
    string s6(s2);
    string s7(s2, 1, 3);  // 从索引1开始，长度3: "ell"
    
    // 从迭代器构造
    string s8(s2.begin(), s2.end());
    
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

    string s = "hello";
    
    // 访问字符
    char c = s[0];  // 'h'
    char d = s.at(1);  // 'e'（带边界检查）
    
    // 修改字符
    s[0] = 'H';  // "Hello"
    
    // 长度
    int len = s.size();  // 5
    int length = s.length();  // 5
    
    // 判空
    bool is_empty = s.empty();  // false
    
    // 清空
    s.clear();
    
    // 容量
    int cap = s.capacity();
    s.reserve(100);  // 预分配空间
    
    return 0;
}
```

---

## 二、常用方法

### 2.1 字符串拼接

```cpp
string s = "hello";

// 方法1: 使用 +=
s += " world";

// 方法2: 使用 append
s.append("!");
s.append(3, '?');  // 添加3个问号

// 方法3: 使用 + 运算符
string s1 = "hello";
string s2 = "world";
string s3 = s1 + " " + s2;

// 方法4: 使用 insert
s.insert(s.end(), '!');
```

### 2.2 子串操作

```cpp
string s = "Hello, world!";

// substr(pos, length)
string sub1 = s.substr(7, 5);  // "world"
string sub2 = s.substr(7);     // "world!"

// 查找子串
size_t pos = s.find("world");  // 7
if (pos != string::npos)
{
    cout << "Found at position: " << pos << endl;
}

// 查找字符
pos = s.find('o');  // 4

// 从指定位置开始查找
pos = s.find('o', 5);  // 8

// 反向查找
pos = s.rfind('o');  // 8

// 查找第一个符合条件的字符
pos = s.find_first_of("aeiou");  // 1 ('e')

// 查找第一个不符合条件的字符
pos = s.find_first_not_of("Helo ");  // 5 (',')
```

### 2.3 替换操作

```cpp
string s = "Hello, world!";

// replace(pos, length, replacement)
s.replace(7, 5, "C++");  // "Hello, C++!"

// 使用迭代器范围替换
s.replace(s.begin() + 7, s.end() - 1, "programming");

// 替换所有匹配的子串
string s = "ababab";
size_t pos = 0;
while ((pos = s.find("ab", pos)) != string::npos)
{
    s.replace(pos, 2, "CD");
    pos += 2;
}
// s 变为 "CDCDCD"
```

### 2.4 插入和删除

```cpp
string s = "Hello";

// 插入字符串
s.insert(5, " world");  // "Hello world"

// 插入字符
s.insert(s.begin(), '!');  // "!Hello world"

// 删除字符
s.erase(s.begin());  // "Hello world"

// 删除子串
s.erase(5, 6);  // "Hello"

// 删除迭代器范围
s.erase(s.begin() + 2, s.end());  // "He"
```

---

## 三、字符串比较

```cpp
string s1 = "apple";
string s2 = "banana";

// 运算符比较
if (s1 < s2)  // 字典序比较
{
    cout << "s1 comes before s2" << endl;
}

// compare 方法
int result = s1.compare(s2);
if (result < 0) cout << "s1 < s2" << endl;
else if (result == 0) cout << "s1 == s2" << endl;
else cout << "s1 > s2" << endl;

// 比较子串
result = s1.compare(0, 3, s2, 0, 3);  // 比较前3个字符
```

---

## 四、C++11 现代特性

### 4.1 字符串前缀和后缀检查

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

// C++11: 检查字符串前缀
bool starts_with(const string& s, const string& prefix)
{
    return s.size() >= prefix.size() && s.compare(0, prefix.size(), prefix) == 0;
}

// C++11: 检查字符前缀
bool starts_with(const string& s, char c)
{
    return !s.empty() && s[0] == c;
}

// C++11: 检查字符串后缀
bool ends_with(const string& s, const string& suffix)
{
    return s.size() >= suffix.size() && s.compare(s.size() - suffix.size(), suffix.size(), suffix) == 0;
}

// C++11: 检查字符后缀
bool ends_with(const string& s, char c)
{
    return !s.empty() && s.back() == c;
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string s = "Hello, world!";
    
    if (starts_with(s, "Hello"))
    {
        cout << "Starts with Hello" << endl;
    }
    
    if (starts_with(s, 'H'))
    {
        cout << "Starts with H" << endl;
    }
    
    if (ends_with(s, "!"))
    {
        cout << "Ends with !" << endl;
    }
    
    if (ends_with(s, "world!"))
    {
        cout << "Ends with world!" << endl;
    }
    
    return 0;
}
```

### 4.2 字符串包含检查

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

// C++11: 检查字符串包含
bool contains(const string& s, const string& substr)
{
    return s.find(substr) != string::npos;
}

// C++11: 检查字符包含
bool contains(const string& s, char c)
{
    return s.find(c) != string::npos;
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string s = "Hello, world!";
    
    if (contains(s, "world"))
    {
        cout << "Contains 'world'" << endl;
    }
    
    if (contains(s, 'o'))
    {
        cout << "Contains 'o'" << endl;
    }
    
    return 0;
}
```

---

## 五、字符串输入读取

### 核心要点

| 场景 | 方法 | 关键代码 |
|------|------|----------|
| 单个单词 | `cin >> s` | 遇空格停止 |
| 整行读取 | `getline(cin, s)` | 包含空格 |
| 数字+字符串 | 先 `cin >> n` 再 `getline` | **必须** `cin.ignore()` |

### 关键代码示例

```cpp
// 混合输入：数字 + 字符串（重点！）
int n;
cin >> n;
cin.ignore();        // 清除换行符，否则 getline 会读空行
string s;
getline(cin, s);     // 正确读取整行

// 读取多行
int n; cin >> n; cin.ignore();
while (n--)
{
    string line;
    getline(cin, line);
    // 处理 line
}

// 读取到文件结束
string line;
while (getline(cin, line))
{
    // 处理 line
}
```

---

## 六、竞赛实战技巧

### 5.1 字符串反转

```cpp
string reverse_string(string s)
{
    reverse(s.begin(), s.end());
    return s;
}

// 原地反转
void reverse_inplace(string& s)
{
    int n = s.size();
    for (int i = 0; i < n / 2; i++)
    {
        swap(s[i], s[n - 1 - i]);
    }
}
```

### 5.2 字符串分割

```cpp
vector<string> split(const string& s, char delimiter)
{
    vector<string> tokens;
    string token;
    istringstream tokenStream(s);
    while (getline(tokenStream, token, delimiter))
    {
        tokens.push_back(token);
    }
    return tokens;
}

// 分割多个空格
vector<string> split_whitespace(const string& s)
{
    vector<string> tokens;
    string token;
    istringstream tokenStream(s);
    while (tokenStream >> token)
    {
        tokens.push_back(token);
    }
    return tokens;
}
```

### 5.3 字符串转数字

```cpp
// 字符串转整数
int str_to_int(const string& s)
{
    return stoi(s);
}

// 字符串转长整型
long long str_to_ll(const string& s)
{
    return stoll(s);
}

// 字符串转浮点数
double str_to_double(const string& s)
{
    return stod(s);
}

// 数字转字符串
string int_to_str(int n)
{
    return to_string(n);
}

string ll_to_str(long long n)
{
    return to_string(n);
}
```

### 5.4 回文串判断

```cpp
bool is_palindrome(const string& s)
{
    int n = s.size();
    for (int i = 0; i < n / 2; i++)
    {
        if (s[i] != s[n - 1 - i])
        {
            return false;
        }
    }
    return true;
}

// 使用双指针
bool is_palindrome2(const string& s)
{
    int left = 0, right = s.size() - 1;
    while (left < right)
    {
        if (s[left] != s[right])
        {
            return false;
        }
        left++;
        right--;
    }
    return true;
}
```

### 5.5 子串查找

```cpp
// KMP 算法（高效查找子串）
vector<int> compute_lps(const string& pattern)
{
    int n = pattern.size();
    vector<int> lps(n, 0);
    for (int i = 1, len = 0; i < n; )
    {
        if (pattern[i] == pattern[len])
        {
            lps[i++] = ++len;
        }
        else if (len > 0)
        {
            len = lps[len - 1];
        }
        else
        {
            lps[i++] = 0;
        }
    }
    return lps;
}

vector<int> kmp_search(const string& text, const string& pattern)
{
    vector<int> result;
    int n = text.size(), m = pattern.size();
    if (m == 0) return result;
    
    vector<int> lps = compute_lps(pattern);
    for (int i = 0, j = 0; i < n; )
    {
        if (pattern[j] == text[i])
        {
            i++;
            j++;
            if (j == m)
            {
                result.push_back(i - j);
                j = lps[j - 1];
            }
        }
        else if (j > 0)
        {
            j = lps[j - 1];
        }
        else
        {
            i++;
        }
    }
    return result;
}
```

---

## 六、性能优化

### 6.1 预分配空间

```cpp
// 错误示范：频繁扩容
string s;
for (int i = 0; i < 1e5; i++)
{
    s += 'a';
}

// 正确做法：预分配空间
string s;
s.reserve(1e5);
for (int i = 0; i < 1e5; i++)
{
    s += 'a';
}
```

### 6.2 避免不必要的拷贝

```cpp
// 错误示范：不必要的拷贝
string process_string(string s)  // 值传递，会拷贝
{
    // 处理 s
    return s;
}

// 正确做法：使用引用
string process_string(const string& s)  // 常量引用，无拷贝
{
    string result = s;
    // 处理 result
    return result;
}

// 使用移动语义
string create_large_string()
{
    string s(1e5, 'a');
    return s;  // 移动语义，无拷贝
}
```

### 6.3 字符串拼接优化

```cpp
// 错误示范：多次拼接导致多次拷贝
string s;
for (int i = 0; i < 1000; i++)
{
    s += to_string(i);
}

// 正确做法：使用 ostringstream
ostringstream oss;
for (int i = 0; i < 1000; i++)
{
    oss << i;
}
string s = oss.str();

// 或者使用 reserve
string s;
s.reserve(10000);
for (int i = 0; i < 1000; i++)
{
    s += to_string(i);
}
```

---

## 七、常见错误与注意事项

| 错误 | 说明 | 解决方案 |
|------|------|----------|
| 越界访问 | 访问超出字符串长度的索引 | 使用 `at()` 或先检查长度 |
| 字符串拼接性能 | 频繁拼接导致多次内存分配 | 使用 `reserve()` 或 `ostringstream` |
| 比较字符串和字面量 | 直接比较可能导致意外结果 | 确保类型匹配 |
| 字符编码问题 | 处理非 ASCII 字符时出错 | 注意编码格式，使用 wstring 处理宽字符 |
| 内存使用过高 | 存储过长的字符串 | 考虑使用 string_view 或流式处理 |
| 查找返回值处理 | 未检查 `string::npos` | 总是检查查找结果 |

---

## 八、C++11 完整竞赛模板

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

// 字符串分割
vector<string> split(const string& s, char delimiter)
{
    vector<string> tokens;
    string token;
    istringstream tokenStream(s);
    while (getline(tokenStream, token, delimiter))
    {
        tokens.push_back(token);
    }
    return tokens;
}

// 检查字符串前缀
bool starts_with(const string& s, const string& prefix)
{
    return s.size() >= prefix.size() && s.compare(0, prefix.size(), prefix) == 0;
}

// 检查字符串后缀
bool ends_with(const string& s, const string& suffix)
{
    return s.size() >= suffix.size() && s.compare(s.size() - suffix.size(), suffix.size(), suffix) == 0;
}

// 检查字符串包含
bool contains(const string& s, const string& substr)
{
    return s.find(substr) != string::npos;
}

// 回文串判断
bool is_palindrome(const string& s)
{
    int left = 0, right = s.size() - 1;
    while (left < right)
    {
        if (s[left] != s[right])
        {
            return false;
        }
        left++;
        right--;
    }
    return true;
}

// KMP 算法
vector<int> kmp_search(const string& text, const string& pattern)
{
    vector<int> result;
    int n = text.size(), m = pattern.size();
    if (m == 0) return result;
    
    vector<int> lps(m, 0);
    for (int i = 1, len = 0; i < m; )
    {
        if (pattern[i] == pattern[len])
        {
            lps[i++] = ++len;
        }
        else if (len > 0)
        {
            len = lps[len - 1];
        }
        else
        {
            lps[i++] = 0;
        }
    }
    
    for (int i = 0, j = 0; i < n; )
    {
        if (pattern[j] == text[i])
        {
            i++;
            j++;
            if (j == m)
            {
                result.push_back(i - j);
                j = lps[j - 1];
            }
        }
        else if (j > 0)
        {
            j = lps[j - 1];
        }
        else
        {
            i++;
        }
    }
    return result;
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // 读取字符串
    string s;
    getline(cin, s);
    
    // 分割
    vector<string> tokens = split(s, ' ');
    for (const string& token : tokens)
    {
        cout << token << endl;
    }
    
    // 检查回文
    string palindrome_candidate = "racecar";
    if (is_palindrome(palindrome_candidate))
    {
        cout << palindrome_candidate << " is a palindrome" << endl;
    }
    
    // KMP 查找
    string text = "ABABDABACDABABCABAB";
    string pattern = "ABABCABAB";
    vector<int> positions = kmp_search(text, pattern);
    cout << "Pattern found at positions: ";
    for (int pos : positions)
    {
        cout << pos << " ";
    }
    cout << endl;
    
    // C++11 字符串检查
    string test = "Hello, C++11!";
    if (starts_with(test, "Hello"))
    {
        cout << "Starts with Hello" << endl;
    }
    if (ends_with(test, "!"))
    {
        cout << "Ends with !" << endl;
    }
    if (contains(test, "C++"))
    {
        cout << "Contains 'C++'" << endl;
    }
    
    return 0;
}
```

---

## 总结：竞赛要点

1. **基本操作**：掌握字符串的基本操作，如访问、修改、拼接、查找等
2. **性能优化**：使用 `reserve()` 预分配空间，避免频繁拼接
3. **现代 C++11**：使用 auto 类型推导、范围 for 循环、lambda 表达式和自定义字符串检查函数
4. **实战技巧**：字符串分割、反转、回文判断、KMP 算法等
5. **类型转换**：字符串与数字之间的转换
6. **内存管理**：避免不必要的拷贝，使用引用和移动语义
7. **边界处理**：注意字符串索引的边界检查
8. **编码问题**：处理特殊字符和编码格式

string 是算法竞赛中最基础的工具之一，掌握它的使用技巧能让你在处理字符串相关问题时更加得心应手。