---
title: "速通Java算法竞赛"
date: 2026-03-19T12:00:00+08:00
tags: ["java", "编程语言", "竞赛", "算法", "模板", "Java"]
categories: ["语言学习"]
series: ["逃课-速通"]
---

```java
import java.util.*;
import java.io.*;
// import java.math.*;  

public class Main
{
    // 定义全局快读工具st
    static StreamTokenizer st = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));  // 其实是很好记的，如果出来代码补全Tab就一下的事
    // 封装4个最常用的读取函数
    static int ni() throws Exception { st.nextToken(); return (int) st.nval; }
    static long nl() throws Exception { st.nextToken(); return (long) st.nval; }
    static double nd() throws Exception { st.nextToken(); return st.nval; }
    static String ns() throws Exception { st.nextToken(); return st.sval;}

    public static class Node
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

## 咱们直接把“面向对象”速通了。

---

### 一、 核心概念：什么是面向对象？

在 C++ 里，你可能习惯用多个数组来存数据（我就用结构体lol）：
*   `int id[100]; string name[100]; int score[100];`（这是面向过程）

在 Java 里，你滴老师想让你把它们捆绑在一起：
*   创建一个 `Student` 类，里面包含 `id, name, score`。这就是**类（Class）**。
*   根据这个类 `new` 出来的一个个具体的学生，就是**对象（Object）**。

---

### 二、 必考词汇表

1.  **`class` (类)**：蓝图，定义了有什么属性和行为。
2.  **`static` (静态)**：
    *   **理解**：带 `static` 的属于类，不带 `static` 的属于对象。
    *   **技巧**：在 `Main` 类里写的函数，只要是在 `main` 函数里直接调用的，必须加 `static`。
3.  **`Constructor` (构造方法/构造器)**：
    *   `new` 一个对象时调用的函数。名字必须和类名一样，没有返回值。
4.  **`this`**：指代当前对象自己。通常在构造方法里用来区分参数和成员变量（例如 `this.name = name`）。
5.  **`private / public` (访问控制)**：
    *   考试如果要求“封装性”，就把变量写成 `private`，然后提供 `get/set` 方法。如果没要求，为了懒，直接 `public`。
6.  **`extends` (继承)**：子类继承父类。比如 `Dog extends Animal`。
7.  **`implements` (实现接口)**：Java 的大招，常用于**排序**。

---

### 三、 实战：把面向对象和快读结合

假设题目：**输入N个学生的信息（姓名、成绩），按照成绩降序排序，如果成绩相同按姓名升序。**

这就是最典型的“面向对象”考试题。

```java
import java.util.*;
import java.io.*;
// import java.math.*;

// 定义一个类（相当于 C++ 的 struct + 函数）
class Student implements Comparable<Student>  // implements Comparable 是为了能排序
{
    String name;
    int score;

    // 构造方法 (Constructor)
    public Student(String name, int score)
    {
        this.name = name;
        this.score = score;
    }

    // 重写排序逻辑 (Override)
    @Override
    public int compareTo(Student other)
    {
        if (this.score != other.score)
        {
            return other.score - this.score;  // 降序：后减前
        }
        return this.name.compareTo(other.name);  // 升序：Java String 自带 compareTo
    }
}

public class Main
{
    // 你的快读模板
    static StreamTokenizer st = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
    static int ni() throws Exception { st.nextToken(); return (int)st.nval; }
    static String ns() throws Exception { st.nextToken(); return st.sval; }

    public static void main(String[] args) throws Exception
    {
        int n = ni();
        // 创建对象数组
        Student[] arr = new Student[n];
        
        for (int i = 0; i < n; i++)
        {
            String name = ns();
            int score = ni();
            // 实例化对象 (new)
            arr[i] = new Student(name, score);
        }

        // 排序 (由于 Student 实现了 Comparable，这里可以直接 sort)
        Arrays.sort(arr);

        // 输出
        for (Student s : arr)
        {
            System.out.println(s.name + " " + s.score);
        }
    }
}
```

---

### 四、 Java 特性

#### 1. 包装类 (Wrapper Class)
*   **新词**：`Integer`, `Double`, `Character`。
*   **为什么有它**：Java 的集合类（比如 `ArrayList`）**不能存基本类型 `int`**，必须存对象。
*   **自动装箱**：Java 会自动把 `int` 转成 `Integer`，基本不用管，但要认识这个词。

#### 2. 动态数组 `ArrayList`
C++ 的 `vector` 在 Java 里叫 `ArrayList`。
```java
ArrayList<Integer> list = new ArrayList<>();
list.add(10);           // push_back
int x = list.get(0);    // arr[0]
list.size();            // size()
Collections.sort(list); // 排序 list
```

#### 3. 字符串比较 (String)
*   **绝对禁止**：`if (s1 == s2)`。在 Java 里，这是在比两串字符串的**内存地址**。
*   **必须使用**：`if (s1.equals(s2))`。

#### 4. NullPointerException (NPE - 空指针异常)
*   Java 考试最常见的报错。
*   **原因**：你定义了数组 `Student[] arr = new Student[5]`，这只是开了 5 个位置，里面全是 `null`。必须给每个位置 `new Student(...)` 才能用，否则访问 `arr[0].name` 就崩了。

---

### 五、 速通建议

1.  **如果不让用快读**：用 `Scanner sc = new Scanner(System.in);`。
2.  **如果考继承**：记得 `super()`。子类构造方法第一行通常要调用父类的构造。
3.  **如果考多态**：就是父类引用指向子类对象（`Person p = new Student();`）。
4.  **IDE 技巧**：上机考试通常用 Eclipse 或 IntelliJ。
    *   **Alt + Insert** (IntelliJ) 或 **Alt + Shift + S** (Eclipse)：可以**自动生成**构造方法、Getter/Setter、toString。这能让你少写几十行代码，记不住英文的是这样的。

---

## 强化理解

---

### 一、 面向对象三大特性：封装、继承、多态

#### 1. 封装 (Encapsulation) —— “我的东西你别乱碰”
*   **人话**：把类的属性（变量）藏起来，不让外面随便改。想改？通过我提供的专门方法（函数）。
*   **怎么写**：变量全写成 `private`（私有），然后提供 `public` 的 `get` 和 `set` 方法。
*   **懒**：上机时千万别手写！在 IDE（Eclipse/IDEA）里，右键 -> `Generate`（快捷键 Alt+Insert） -> `Getter and Setter`，一秒钟生成。
*   **代码示例**：
```java
class Student
{
    private int age; // 私有变量，外面直接 student.age = -1 会报错

    // 提供修改的接口，可以在这里加逻辑限制
    public void setAge(int age)
    {
        if (age >= 0) this.age = age; 
    }
    public int getAge()
    {
        return this.age;
    }
}
```

#### 2. 继承 (Inheritance) —— “儿子继承爹的财产”
*   **人话**：C++ 里的派生类。如果你写了 `Dog` 和 `Cat`，发现它们都有 `name` 和 `age`，那就抽个父类叫 `Animal`。
*   **关键字**：`extends`。**注意：Java 是单继承，一个儿子只能有一个亲爹！**
*   **考点 `super`**：儿子在自己的构造方法里，第一行必须用 `super()` 叫爹（调用父类的构造方法）。
*   **代码示例**：
```java
class Animal
{
    String name;
    public Animal(String name) { this.name = name; }
}

class Dog extends Animal
{
    public Dog(String name)
    {
        super(name); // 必须先调用父类的构造方法
    }
}
```

#### 3. 多态 (Polymorphism) —— “千人千面”
*   **人话**：同一个指令，不同对象执行起来效果不一样。
*   **触发条件**：要有继承 + 要有方法重写 + **父类引用指向子类对象**。
*   **怎么考**：老师就喜欢让你建一个父类数组，里面塞满不同的子类，然后一个 `for` 循环调用同一个方法。
*   **代码示例**：
```java
Animal a = new Dog("旺财"); // 核心：左边是爹，右边是儿子
a.speak(); // 如果 Dog 重写了 speak()，这里会汪汪叫，而不是执行 Animal 的 speak
```

---

### 二、 两个极其容易混淆的词：重载 vs 重写

考试最喜欢考简答题或选择题，你只记一句话：
*   **重载 (Overload)**：**同名不同参**。在一个类里，函数名一样，但参数个数或类型不同。（比如 `add(int a, int b)` 和 `add(double a, double b)`）。
*   **重写 (Override)**：**父子大乱斗**。子类觉得父类的方法不好用，自己重新写一遍。方法名、参数必须**一模一样**。（建议加上 `@Override` 注解，防写错）。

---

### 三、 抽象类 (Abstract Class) vs 接口 (Interface)

这也是考试高频考点，它们都是用来“定规矩”的。

#### 1. 抽象类 (`abstract`) —— “半成品图纸”
*   **大白话**：如果一个类里有方法不知道怎么实现（比如 `Animal` 的 `speak()`，你不知道是汪汪还是喵喵），就加上 `abstract`。
*   **规则**：有抽象方法的类必须是抽象类。抽象类**不能被 `new` 出来**。

#### 2. 接口 (`interface`) —— “纯纯的规矩”
*   **大白话**：Java 没法多继承（不能有两个爹），但可以实现多个接口（可以考很多证）。
*   **关键字**：`implements`。
*   **极简对比**：
    *   继承：狗 `extends` 动物（狗**是**动物）。
    *   接口：狗 `implements` 会游泳的接口（狗**具备**游泳的技能）。

---

### 四、 集合大杀器：ArrayList 与 HashMap

忘掉 C++ 的 `vector` 和 `map`，拥抱 Java 的集合框架。
**【终极避坑】**：尖括号 `< >` 里面**绝对不能写基本数据类型**（`int, double, char`），必须写它们的包装类（`Integer, Double, Character`）！

#### 1. ArrayList (动态数组)
```java
// 等价于 C++ 的 vector<int>
ArrayList<Integer> list = new ArrayList<>();
list.add(10);           // push_back(10)
int x = list.get(0);    // list[0]
list.size();            // size()
list.remove(0);         // 删除第0个元素
Collections.sort(list); // 排序
```

#### 2. HashMap (哈希表/字典)
```java
// 等价于 C++ 的 unordered_map<string, int>
HashMap<String, Integer> map = new HashMap<>();
map.put("张三", 100);       // 存入或修改
int score = map.get("张三"); // 取出，如果没有会报错
boolean has = map.containsKey("李四"); // 判断是否存在

// 遍历 HashMap (稍微有点繁琐，死记硬背)
for (String key : map.keySet())
{
    System.out.println(key + " 的分数是 " + map.get(key));
}
```

---

### 五、 异常处理 (Exception) —— “程序不准崩”

在之前那个快读模板里，看到了 `main(String[] args) throws Exception`。这玩意儿就是异常处理。

*   **人话**：代码运行可能会出错（比如除以0、读文件没找到、数组越界）。如果不处理，程序直接原地爆炸（闪退）。
*   **玩法 1：自己搞定 (`try-catch`)**
    ```java
    try
    {
        int a = 10 / 0; // 这句会抛出 ArithmeticException
    }
    catch (Exception e)
    {
        System.out.println("兄弟，不能除以0啊！"); // 捕获异常，程序继续活下去
    }
    finally
    {
        System.out.println("不管出错没出错，这句都会执行，通常用来关闭文件/Scanner");
    }
    ```
*   **玩法 2：甩锅 (`throws`)**
    如果你懒得写 `try-catch`，就在方法签名后面加 `throws Exception`。意思是：“我知道这里可能会报错，但我不管，谁调用我谁处理。如果是 `main` 方法甩锅，那就是直接甩给 Java 虚拟机（直接摆烂）。”

---

### 六、 咱们把这些知识点串成一道终极模拟题

**题目**：使用面向对象思想，创建一个动物园。里面有狗和猫。要求用集合存储它们，并遍历让它们叫。捕获可能出现的越界异常。

```java
import java.util.*;

// 1. 抽象类
abstract class Animal
{
    String name;
    public Animal(String name) { this.name = name; }
    
    // 抽象方法，没有方法体
    public abstract void speak(); 
}

// 2. 继承与重写
class Dog extends Animal
{
    public Dog(String name) { super(name); } // 调爹
    
    @Override
    public void speak() { System.out.println(name + "说：汪汪！"); }
}

class Cat extends Animal
{
    public Cat(String name) { super(name); }
    
    @Override
    public void speak() { System.out.println(name + "说：喵喵！"); }
}

public class Main
{
    public static void main(String[] args)
    {
        // 3. 多态与 ArrayList 结合（Animal 引用指向 Dog 和 Cat）
        ArrayList<Animal> zoo = new ArrayList<>();
        zoo.add(new Dog("旺财"));
        zoo.add(new Cat("汤姆"));

        // 4. 多态的威力：我不关心你是啥，你只要是动物，就给我叫！
        for (Animal a : zoo)
        {
            a.speak(); 
        }

        // 5. 异常处理演示
        try
        {
            Animal x = zoo.get(100); // 肯定越界了
        }
        catch (Exception e)
        {
            System.out.println("哎呀，数组越界啦！报错信息是：" + e.getMessage());
        }
    }
}
```
## 这三个题型，几乎涵盖了大一 Java 上机考试 80% 的考点。直接套用刚刚的**“快读模板”**。

---

### 预测题一：对象多条件排序

**考点**：`class` 定义、构造方法、`Comparable` 接口重写（多态的体现）。
**题目背景**：老师最喜欢出的学生成绩管理。
**题目要求**：
输入 $N$ 个学生的姓名、语文成绩、数学成绩。
请按 **总分降序** 排列；如果总分相同，按 **数学成绩降序** 排列；如果数学还相同，按 **姓名的字典序升序** 排列。

**输入样例**：
```text
4
Alice 90 80
Bob 80 90
Charlie 80 90
David 100 100
```
**输出样例**：
```text
David 200 100
Bob 170 90
Charlie 170 90
Alice 170 80
```

**直接抄答案**：
```java
import java.util.*;
import java.io.*;

public class Main
{
    // 快读模板
    static StreamTokenizer st = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
    static int ni() throws Exception { st.nextToken(); return (int)st.nval; }
    static String ns() throws Exception { st.nextToken(); return st.sval; }

    // 面向对象：把学生封装成一个类
    static class Student implements Comparable<Student>
    {
        String name;
        int chinese, math, total;

        public Student(String name, int chinese, int math)
        {
            this.name = name;
            this.chinese = chinese;
            this.math = math;
            this.total = chinese + math;
        }

        // 核心考点：重写比较规则
        @Override
        public int compareTo(Student other)
        {
            if (this.total != other.total)
            {
                return other.total - this.total; // 降序：别人减我
            }
            if (this.math != other.math)
            {
                return other.math - this.math;   // 降序：别人减我
            }
            return this.name.compareTo(other.name); // 升序：String自带，我比别人
        }
    }

    public static void main(String[] args) throws Exception
    {
        int n = ni();
        Student[] arr = new Student[n]; // 对象数组

        for (int i = 0; i < n; i++)
        {
            // 实例化对象存入数组
            arr[i] = new Student(ns(), ni(), ni());
        }

        Arrays.sort(arr);  // 一键排序，会自动调用我们写的 compareTo

        for (Student s : arr)
        {   
            System.out.println(s.name + " " + s.total + " " + s.math);
        }
    }
}
```

**或者是数组和Lambda表达式**
```java
import java.util.*;
import java.io.*;
import java.math.*;

public class Main
{
    // st
    static StreamTokenizer st = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
    static int ni() throws Exception { st.nextToken(); return (int) st.nval; }
    static String ns() throws Exception { st.nextToken(); return st.sval; }

    public static void main(String[] args) throws Exception
    {
        int n = ni();
        // 我要数组
        Student[]  students = new Student[n];
        for (int i = 0; i < n; i++)
        {
            students[i] = new Student(ns(), ni(), ni());  // 读入
        }

        // 我要Lamada
        Arrays.sort(students, (a, b) -> {
            if (a.total !=  b.total) return b.total - a.total;  // 降序后减前
            if (a.math != b.math) return b.math - a.math;
            else return a.name.compareTo(b.name);
        });

        // 输出
        Arrays.stream(students).forEach(s -> System.out.println(s.name + " " + s.total + " " + s.math));
    }

    public static class Student
    {
        String name;
        int chinese;
        int math;
        int total;

        // 构造方式
        Student(String n, int c, int m)
        {
            this.name = n;
            this.chinese  = c;
            this.math = m;
            this.total = c + m;
        }
    }
}
```

---

### 预测题二：哈希表计票系统

**考点**：`HashMap` 的增删改查、包装类。这题如果是 C++ 你会用 `map<string, int>`，但在 Java 里必须熟练使用 `HashMap`。
**题目要求**：
班级竞选班长，输入 $N$ 张选票（每张选票是一个人名）。请输出得票最多的人的名字和票数。如果有并列第一，输出任意一个即可。

**输入样例**：
```text
5
张三
李四
张三
王五
张三
```
**输出样例**：
```text
张三 3
```

**直接抄答案**：
```java
import java.util.*;
import java.io.*;

public class Main
{
    static StreamTokenizer st = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
    static int ni() throws Exception { st.nextToken(); return (int)st.nval; }
    static String ns() throws Exception { st.nextToken(); return st.sval; }

    public static void main(String[] args) throws Exception
    {
        int n = ni();
        
        // 创建 HashMap，注意尖括号里必须是包装类 String 和 Integer
        HashMap<String, Integer> map = new HashMap<>();

        for (int i = 0; i < n; i++)
        {
            String name = ns();
            // 经典计票写法（背下来，极其好用）：
            // getOrDefault(名字, 0)：如果 map 里有这个名字，拿它的票数；如果没有，当做 0 票。然后 +1。
            map.put(name, map.getOrDefault(name, 0) + 1);
        }

        // 找最大值
        String maxName = "";
        int maxVotes = 0;

        // 遍历 HashMap 的标准写法
        for (String key : map.keySet())
        {
            int votes = map.get(key);
            if (votes > maxVotes)
            {
                maxVotes = votes;
                maxName = key;
            }
        }

        System.out.println(maxName + " " + maxVotes);
    }
}
```

---

### 预测题三：栈的操作模拟

**考点**：使用 Java 官方推荐的 `ArrayDeque` 作为栈（千万别用老旧的 `Stack` 类）。这道题融合了字符串比较和集合类的使用。
**题目要求**：
输入 $N$ 个操作指令：
- `push X`：将整数 $X$ 压入栈。
- `pop`：弹出栈顶元素。如果栈空，输出 `empty`。
- `top`：输出栈顶元素。如果栈空，输出 `empty`。

**输入样例**：
```text
5
push 10
push 20
pop
top
pop
```
**输出样例**：
```text
10
```

**直接抄答案**：
```java
import java.util.*;
import java.io.*;

public class Main
{
    static StreamTokenizer st = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
    static int ni() throws Exception { st.nextToken(); return (int)st.nval; }
    static String ns() throws Exception { st.nextToken(); return st.sval; }

    public static void main(String[] args) throws Exception
    {
        int n = ni();
        
        // 定义栈：Deque 接口 + ArrayDeque 实现（比传统的 Stack 类快得多）
        Deque<Integer> stack = new ArrayDeque<>();

        for (int i = 0; i < n; i++)
        {
            String cmd = ns();
            
            // 字符串比较必须用 equals！
            if (cmd.equals("push"))
            {
                int x = ni();
                stack.push(x);  // 压栈
            } 
            else if (cmd.equals("pop"))
            {
                if (stack.isEmpty())
                {
                    System.out.println("empty");
                }
                else
                {
                    stack.pop(); // 弹栈（无返回值要求时直接弹）
                }
            } 
            else if (cmd.equals("top"))
            {
                if (stack.isEmpty())
                {
                    System.out.println("empty");
                }
                else
                {
                    System.out.println(stack.peek()); // peek 只看栈顶，不弹出来
                }
            }
        }
    }
}
```
---

**“快读模板”**启动，直接上经典算法题！

---

### 必考算法一：一维前缀和（区间求和神器）

**考点**：如果题目让你求“第 $L$ 个数到第 $R$ 个数的和”，你用 `for` 循环挨个加，数据量一到 $10^5$ 必定超时（TLE）。**前缀和**能把求和时间变成 $O(1)$。
**题目要求**：
输入一个长度为 $N$ 的数组，接下来有 $Q$ 次询问。
每次询问输入两个整数 $L$ 和 $R$，请输出数组从第 $L$ 个元素到第 $R$ 个元素的总和（下标从 1 开始）。

**输入样例**：
```text
5 3
1 2 3 4 5
1 3
2 4
1 5
```
**输出样例**：
```text
6
9
15
```

**代码实现**：
```java
import java.util.*;
import java.io.*;

public class Main
{
    static StreamTokenizer st = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
    static int ni() throws Exception { st.nextToken(); return (int)st.nval; }

    public static void main(String[] args) throws Exception
    {
        int n = ni(); // 数组长度
        int q = ni(); // 询问次数
        
        // 技巧：前缀和数组开大一点，下标从 1 开始，且用 long 防止数值溢出
        long[] sum = new long[n + 1]; 
        
        for (int i = 1; i <= n; i++)
        {
            int x = ni();
            // 构建前缀和：当前前缀和 = 上一个前缀和 + 当前数字
            sum[i] = sum[i - 1] + x; 
        }
        
        for (int i = 0; i < q; i++)
        {
            int l = ni();
            int r = ni();
            // 3. O(1) 查询：R的前缀和 - (L-1)的前缀和
            System.out.println(sum[r] - sum[l - 1]);
        }
    }
}
```

---

### 必考算法二：二分答案（“分巧克力/切绳子”模板）

**考点**：遇到“求最大值中的最小值”或“最小值中的最大值”，或者题目问“最多能切多长”，99%是二分答案。这比手写排序还要重要。
**题目要求**：
有 $N$ 条绳子，它们的长度分别为 $L_i$。如果从它们中切割出 $K$ 条长度相同的绳子，这 $K$ 条绳子每条最长能有多长？（取整数）

**输入样例**：
```text
4 11
8 0 2 4
```
*(解释：4条绳子分别长8, 0, 2, 4。要切出11条长度一样的绳子，最长只能切长度为1)*
**输出样例**：
```text
1
```

**代码实现**：
```java
import java.util.*;
import java.io.*;

public class Main
{
    static StreamTokenizer st = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
    static int ni() throws Exception { st.nextToken(); return (int)st.nval; }

    // 写一个检查函数：如果切长度为 mid，能切出多少根？
    static boolean check(int[] arr, int mid, int k)
    {
        int count = 0;
        for (int len : arr) {
            count += len / mid; // 每根绳子能提供几段
        }
        return count >= k; // 够不够 K 根？
    }

    public static void main(String[] args) throws Exception
    {
        int n = ni();
        int k = ni();
        int[] arr = new int[n];
        
        int maxLen = 0;
        for (int i = 0; i < n; i++)
        {
            arr[i] = ni();
            maxLen = Math.max(maxLen, arr[i]); // 找到最长的那根绳子作为二分上限
        }
        
        // 经典的二分模板
        int left = 1, right = maxLen;
        int ans = 0;  // 记录最终答案
        
        while (left <= right)
        {
            int mid = left + (right - left) / 2;  // 防溢出写法
            if (check(arr, mid, k))
            {
                ans = mid;       // 既然长度为 mid 能满足，记录下来
                left = mid + 1;  // 并且尝试能不能切得更长
            }
            else
            {
                right = mid - 1; // 满足不了，说明切太长了，缩短一点
            }
        }
        
        System.out.println(ans);
    }
}
```

---

### 必考算法三：最大公约数 (GCD) 与 最小公倍数 (LCM)

**考点**：数论基础。
**C++ vs Java 的大坑**：在 C++ 中，你有 `<numeric>` 里的 `std::gcd` 或者老式的 `__gcd()`。**但在 Java 里，官方没有提供算最大公约数的现成函数！**你必须自己背下这一行代码，否则考试碰到直接干瞪眼。

**题目要求**：
输入两个正整数 $A$ 和 $B$，输出它们的最大公约数和最小公倍数。

**代码实现**：
```java
import java.util.*;
import java.io.*;

public class Main
{
    static StreamTokenizer st = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
    static long nl() throws Exception { st.nextToken(); return (long)st.nval; } // 用long防溢出

    // 极其重要！全网通用的 1 行代码求最大公约数 (辗转相除法)
    static long gcd(long a, long b)
    {
        return b == 0 ? a : gcd(b, a % b);
    }

    // 最小公倍数 = 两数乘积 / 最大公约数
    static long lcm(long a, long b)
    {
        return a / gcd(a, b) * b;  // 先除再乘，防止 a*b 爆 long 范围
    }

    public static void main(String[] args) throws Exception
    {
        long a = nl();
        long b = nl();
        
        System.out.println(gcd(a, b) + " " + lcm(a, b));
    }
}
```

---

### 必考算法四：滑动窗口（尺取法 / 双指针）

**考点**：这也是把 $O(N^2)$ 优化为 $O(N)$ 的神级技巧，代码非常短，但思路很妙。
**题目要求**：
给定一个由正整数组成的数组和一个正整数 $S$。
找出该数组中满足**其和 $\ge S$ 的长度最小的连续子数组**，并返回其长度。如果不存在符合条件的子数组，返回 0。

**输入样例**：
```text
6 7
2 3 1 2 4 3
```
*(解释：和大于等于7的最短连续子数组是 [4,3]，长度为2)*
**输出样例**：
```text
2
```

**代码实现**：
```java
import java.util.*;
import java.io.*;

public class Main
{
    static StreamTokenizer st = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
    static int ni() throws Exception { st.nextToken(); return (int)st.nval; }

    public static void main(String[] args) throws Exception
    {
        int n = ni();
        int s = ni();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++)
        {
            arr[i] = ni();
        }

        // 滑动窗口核心逻辑：
        int left = 0;  // 窗口左边界
        int sum = 0;  // 窗口内的总和
        int minLen = Integer.MAX_VALUE;  // 记录最小长度

        // right 是窗口右边界，不断向右扩展
        for (int right = 0; right < n; right++)
        {
            sum += arr[right]; // 把右边的数吃进来

            // 如果窗口内的和够了，就开始尝试把左边吐出来（缩短窗口）
            while (sum >= s)
            {
                minLen = Math.min(minLen, right - left + 1); // 更新最短长度
                sum -= arr[left]; // 吐出左边界的值
                left++;           // 左边界右移
            }
        }

        // 如果 minLen 没变过，说明没有找到满足条件的，输出 0
        System.out.println(minLen == Integer.MAX_VALUE ? 0 : minLen);
    }
}
```

### 总结（针对这四个算法）：
1. **前缀和**：看到“求一段区间的和”直接条件反射用它。注意数组开 `[n+1]`。
2. **二分答案**：看到“最大化最小值”或“最多切多少”，默写 `while(l <= r)` 和 `check()` 函数。
3. **GCD**：**Java没有自带函数**，必须背诵 `b == 0 ? a : gcd(b, a % b)`。
4. **滑动窗口**：本质是左右两个指针，右边一直走，满足条件了左边就追上来。