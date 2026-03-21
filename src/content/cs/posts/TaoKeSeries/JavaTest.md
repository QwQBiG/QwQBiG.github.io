---

title: "速通Java算法竞赛"
date: 2026-03-19T12:00:00+08:00
tags: ["java", "编程语言", "竞赛", "算法", "模板", "Java"]
categories: ["语言学习"]
series: ["逃课-速通"]
---

```java
mport java.util.*;
import java.io.*;
import java.math.*;  

public class Main {
    // 定义全局快读工具st
    static StreamTokenizer st = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));  // 其实是很好记的，如果出来代码补全Tab就一下的事
    // 封装4个最常用的读取函数
    static int ni() throws Exception { st.nextToken(); return (int) st.nval; }
    static long nl() throws Exception { st.nextToken(); return (long) st.nval; }
    static double nd() throws Exception { st.nextToken(); return st.nval; }
    static String ns() throws Exception { st.nextToken(); return st.sval;}

    // 题目：输入n个学生的姓名和成绩，按成绩从高到低排序，成绩相同按姓名升序。

    // 创建名为Node的结构体
    static class Node
    {
        String name;
        int score;
        Node(String n, int s) { name = n; score = s; }
    }

    public static void main(String[] args) throws Exception  // 一点过要有抛出异常（throws Exception）一直向上抛出异常，最终交给JVM处理，就不用自己写try了
    {
        int n = ni();  // 读取n
        Node[] nodes = new Node[n];  // 创建数组，只有引用，没有对象
        for (int i = 0; i < n; i++)
        {
            nodes[i] = new Node(ns(), ni());  // 创建对象并赋值给数组元素
        }

        // 排序，使用Lamada函数
        Arrays.sort(nodes, (a, b) ->
        {
            if (a.score != b.score) return b.score - a.score;  // 注意：a-b就是从小到大了
            else return a.name.compareTo(b.name);
        });

        // 输出，使用范围for循环
        for (Node node : nodes) System.out.println(node.name + " " + node.score);
    }
}
```