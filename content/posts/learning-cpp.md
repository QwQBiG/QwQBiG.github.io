---
title: "C++ STL"
date: 2025-11-14T10:00:00+08:00
tags: ["C++", "STL","cpp", "编程语言", "C艹", "算法"]
categories: ["语言学习"]
series: ["C++的世界"]
---

我只是测试能不能写第二篇，随便找了一段哈。

```cpp
#include <bits/stdc++.h>
#define endl "\n"
#define int long long
using namespace std;

// 函数对象（仿函数）
class Print
{
public:
    void operator()(string s)  // 或者(char *s)
    {
        cout << s << endl;
    }
};

// 定义一个函数对象作为谓词
class FindNthEven
{
public:
    // 构造函数，传入要找的是第几个
    FindNthEven(int n) : target_n(n), current_count(0) {}
    // 重载 () 操作符，这是谓词的核心
    // find_if 会对每个元素调用这个函数
    bool operator()(int num)
    {
        if (num % 2 == 0)
        {
            current_count++; // 计数器加一
        }
        return current_count == target_n; // 如果计数器达到了目标，返回 true
    }

private:
    int target_n;      // 目标：第 n 个
    int current_count; // 状态：当前已经找到了几个
};

signed main()
{
    ios::sync_with_stdio(0);
    cin.tie(0);

    // 函数对象
    Print ob;
    ob("hello world");  // 对象和小括号结合就会触发这个类的调用
    Print()("fuck world!");  // 这是一个匿名对象

    // 实例
    vector<int> numbers = {1, 3, 2, 5, 4, 8, 10, 7}; // 偶数: 2, 4, 8, 10
    // 我们想找第 3 个偶数
    int n = 3;
    // 创建一个函数对象实例
    // 这个对象find_third_even是有状态的，它知道自己要找第3个，并且内部有个计数器
    auto it = find_if(numbers.begin(), numbers.end(), FindNthEven(n));
    if (it != numbers.end())
    {
        cout << "找到了第 " << n << " 个偶数: " << *it << endl; // 应该输出 8
    }
    else
    {
        cout << "未找到第 " << n << " 个偶数" << endl;
    }

    // 使用 Lambda 表达式作为谓词（竞赛主力）
    // [&] 表示以引用的方式捕获所有外部变量 (这里是 current_count 和 n)
    n = 3;
    int current_count = 0;
    auto it1 = find_if(numbers.begin(), numbers.end(), [&](int num)
    {
        if (num % 2 == 0)
        {
            current_count++;
        }
        return current_count == n;
    });

    if (it1 != numbers.end())
    {
        cout << "使用 Lambda 找到了第 " << n << " 个偶数: " << *it1 << endl;
    }
    else
    {
        cout << "未找到第 " << n << " 个偶数" << endl;
    }

    return 0;
}
```
