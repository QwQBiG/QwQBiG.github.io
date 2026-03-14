---
title: "双指针算法"
date: 2026-03-10T19:00:00+08:00
tags: ["算法", "双指针", "蓝桥杯", "C++11"]
categories: ["算法学习"]
series: ["算法合集"]
weight: 1
---

# 双指针算法

双指针是一种常用的算法技巧，通过使用两个指针在数组或链表上进行遍历，从而达到降低时间复杂度的目的。在蓝桥杯等算法竞赛中，双指针算法是解决许多问题的有效方法。

## 一、基本概念

双指针算法通常使用两个指针（索引）来遍历数据结构，根据问题的不同，指针的移动方向和规则也不同。

### 1.1 常见类型

| 类型 | 指针移动方向 | 适用场景 |
|------|------------|----------|
| 对撞指针 | 相向移动 | 有序数组的查找问题 |
| 快慢指针 | 同向移动，速度不同 | 链表环检测、找中点 |
| 滑动窗口 | 同向移动，维护窗口 | 子数组/子串问题 |
| 双指针遍历 | 同向移动，同步处理 | 合并两个有序数组 |

## 二、经典应用

### 2.1 对撞指针

**适用场景**：有序数组的查找问题，如两数之和、三数之和等。

**核心思想**：左指针从起点开始，右指针从终点开始，根据条件向中间移动。

**示例：两数之和**

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    vector<int> nums = {1, 2, 3, 4, 5, 6};
    int target = 7;
    
    int left = 0, right = nums.size() - 1;
    while (left < right) {
        int sum = nums[left] + nums[right];
        if (sum == target) {
            cout << left << " " << right << endl;
            return 0;
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    cout << "Not found" << endl;
    return 0;
}
```

**示例：三数之和**

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;
signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    vector<int> nums = {-1, 0, 1, 2, -1, -4};
    sort(nums.begin(), nums.end());
    int n = nums.size();
    
    for (int i = 0; i < n - 2; i++) {
        if (i > 0 && nums[i] == nums[i-1]) continue; // 去重
        
        int left = i + 1, right = n - 1;
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            if (sum == 0) {
                cout << nums[i] << " " << nums[left] << " " << nums[right] << endl;
                // 去重
                while (left < right && nums[left] == nums[left+1]) left++;
                while (left < right && nums[right] == nums[right-1]) right--;
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return 0;
}
```

### 2.2 快慢指针

**适用场景**：链表环检测、找链表中点、删除倒数第 N 个节点等。

**核心思想**：快指针每次移动两步，慢指针每次移动一步。

**示例：链表环检测**

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(NULL) {}
};

bool hasCycle(ListNode *head) {
    if (!head || !head->next) return false;
    
    ListNode *slow = head;
    ListNode *fast = head->next;
    
    while (slow != fast) {
        if (!fast || !fast->next) return false;
        slow = slow->next;
        fast = fast->next->next;
    }
    
    return true;
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // 测试代码
    ListNode *head = new ListNode(3);
    ListNode *node1 = new ListNode(2);
    ListNode *node2 = new ListNode(0);
    ListNode *node3 = new ListNode(-4);
    
    head->next = node1;
    node1->next = node2;
    node2->next = node3;
    node3->next = node1; // 形成环
    
    cout << (hasCycle(head) ? "Has cycle" : "No cycle") << endl;
    
    return 0;
}
```

**示例：找链表中点**

```cpp
ListNode* middleNode(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}
```

### 2.3 滑动窗口

**适用场景**：子数组和、最长无重复子串、最小覆盖子串等。

**核心思想**：维护一个窗口，根据条件调整窗口的左右边界。

**示例：最长无重复子串**

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

int lengthOfLongestSubstring(string s) {
    unordered_set<char> st;
    int left = 0, max_len = 0;
    
    for (int right = 0; right < s.size(); right++) {
        while (st.count(s[right])) {
            st.erase(s[left]);
            left++;
        }
        st.insert(s[right]);
        max_len = max(max_len, right - left + 1);
    }
    
    return max_len;
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    string s = "abcabcbb";
    cout << lengthOfLongestSubstring(s) << endl; // 3
    
    return 0;
}
```

**示例：最小覆盖子串**

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

string minWindow(string s, string t) {
    unordered_map<char, int> need, window;
    for (char c : t) need[c]++;
    
    int left = 0, right = 0;
    int valid = 0;
    int start = 0, len = INT_MAX;
    
    while (right < s.size()) {
        char c = s[right];
        right++;
        
        if (need.count(c)) {
            window[c]++;
            if (window[c] == need[c]) {
                valid++;
            }
        }
        
        while (valid == need.size()) {
            if (right - left < len) {
                start = left;
                len = right - left;
            }
            
            char d = s[left];
            left++;
            
            if (need.count(d)) {
                if (window[d] == need[d]) {
                    valid--;
                }
                window[d]--;
            }
        }
    }
    
    return len == INT_MAX ? "" : s.substr(start, len);
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    string s = "ADOBECODEBANC", t = "ABC";
    cout << minWindow(s, t) << endl; // "BANC"
    
    return 0;
}
```

### 2.4 双指针遍历

**适用场景**：合并两个有序数组、归并排序等。

**核心思想**：两个指针分别指向两个数组，根据条件移动指针。

**示例：合并两个有序数组**

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
    int p1 = m - 1, p2 = n - 1;
    int p = m + n - 1;
    
    while (p1 >= 0 && p2 >= 0) {
        if (nums1[p1] > nums2[p2]) {
            nums1[p] = nums1[p1];
            p1--;
        } else {
            nums1[p] = nums2[p2];
            p2--;
        }
        p--;
    }
    
    while (p2 >= 0) {
        nums1[p] = nums2[p2];
        p2--;
        p--;
    }
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    vector<int> nums1 = {1, 2, 3, 0, 0, 0};
    vector<int> nums2 = {2, 5, 6};
    merge(nums1, 3, nums2, 3);
    
    for (int x : nums1) cout << x << " ";
    cout << endl;
    
    return 0;
}
```

## 三、实战技巧

### 3.1 常见问题与解决方案

| 问题 | 解决方案 |
|------|----------|
| 如何判断使用哪种双指针？ | 根据问题类型：有序查找用对撞指针，链表问题用快慢指针，子串问题用滑动窗口 |
| 如何处理重复元素？ | 跳过相同元素，如 `while (left < right && nums[left] == nums[left+1]) left++;` |
| 如何优化时间复杂度？ | 合理设计指针移动规则，避免不必要的计算 |
| 如何处理边界情况？ | 注意数组越界、空数组等特殊情况 |

### 3.2 时间复杂度分析

| 双指针类型 | 时间复杂度 | 空间复杂度 |
|------------|------------|------------|
| 对撞指针 | O(n) | O(1) |
| 快慢指针 | O(n) | O(1) |
| 滑动窗口 | O(n) | O(k)，k为窗口大小 |
| 双指针遍历 | O(m+n) | O(1) |

## 四、蓝桥杯真题示例

### 4.1 题目：寻找两个有序数组的中位数

**题目描述**：给定两个大小分别为 m 和 n 的正序（从小到大）数组 nums1 和 nums2。请你找出并返回这两个正序数组的中位数。

**解法**：使用对撞指针或二分查找。

**代码**：

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    int m = nums1.size(), n = nums2.size();
    int total = m + n;
    int left = 0, right = 0;
    int prev = 0, curr = 0;
    
    for (int i = 0; i <= total / 2; i++) {
        prev = curr;
        if (left < m && (right >= n || nums1[left] < nums2[right])) {
            curr = nums1[left++];
        } else {
            curr = nums2[right++];
        }
    }
    
    if (total % 2 == 0) {
        return (prev + curr) / 2.0;
    } else {
        return curr;
    }
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    vector<int> nums1 = {1, 3};
    vector<int> nums2 = {2};
    cout << findMedianSortedArrays(nums1, nums2) << endl; // 2.0
    
    return 0;
}
```

### 4.2 题目：最长回文子串

**题目描述**：给定一个字符串 s，找到 s 中最长的回文子串。

**解法**：中心扩展法（双指针的变种）。

**代码**：

```cpp
#include <bits/stdc++.h>
#define endl '\n'
#define int long long
using namespace std;

string longestPalindrome(string s) {
    if (s.empty()) return "";
    
    int start = 0, max_len = 1;
    
    auto expandAroundCenter = [&](int left, int right) {
        while (left >= 0 && right < s.size() && s[left] == s[right]) {
            left--;
            right++;
        }
        int len = right - left - 1;
        if (len > max_len) {
            max_len = len;
            start = left + 1;
        }
    };
    
    for (int i = 0; i < s.size(); i++) {
        expandAroundCenter(i, i);     // 奇数长度
        expandAroundCenter(i, i + 1); // 偶数长度
    }
    
    return s.substr(start, max_len);
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    string s = "babad";
    cout << longestPalindrome(s) << endl; // "bab" 或 "aba"
    
    return 0;
}
```

## 五、总结

双指针算法是一种高效的解题技巧，能够将许多 O(n²) 时间复杂度的问题优化到 O(n)。在蓝桥杯竞赛中，掌握双指针算法对于解决数组、链表和字符串相关的问题至关重要。

### 核心要点

1. **选择合适的双指针类型**：根据问题类型选择对撞指针、快慢指针、滑动窗口或双指针遍历。
2. **注意指针移动的条件**：确保指针移动的逻辑正确，避免死循环或错误的结果。
3. **处理边界情况**：考虑数组为空、长度为1等特殊情况。
4. **优化时间复杂度**：利用双指针的特性，避免不必要的计算。

通过大量的练习和实战，你会逐渐掌握双指针算法的精髓，在竞赛中灵活运用。
