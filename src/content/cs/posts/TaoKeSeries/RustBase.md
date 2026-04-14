---
title: "速通 Rust 基础"
date: 2026-04-14T12:00:00+08:00
tags: ["rust", "编程语言", "语法", "算法", "语言", "Rust", "蟹教"]
categories: ["语言学习"]
series: ["逃课-速通"]
---

> 作为聪明的我们，在2026年这一块，有 `Cpp` 基础的前提上，加入蟹教、搞 `Rust` ，必然是直接使唤 `ai` 来辅助学习的~

### 01_variables_and_types

**代码：**
```rust
// 01_variables_and_types.rs - 变量与数据类型

fn main()
{
    // ========================
    // 1. 变量绑定 (Variable Binding)
    // ========================
    
    // 不可变变量 - 默认情况下变量是不可变的
    let x = 5;
    println!("x 的值是: {}", x);
    
    // 可变变量 - 使用 mut 关键字
    let mut y = 10;
    println!("y 的初始值是: {}", y);
    y = 15;  // 修改可变变量
    println!("y 的新值是: {}", y);
    
    // 常量 - 必须指定类型，使用 const 关键字
    const MAX_POINTS: u32 = 100_000;
    println!("最大点数是: {}", MAX_POINTS);
    
    // 隐藏 (Shadowing) - 可以用相同名称重新声明变量
    let z = 5;
    let z = z + 1;
    let z = z * 2;
    println!("通过隐藏，z 的最终值是: {}", z);  // 输出 12
    
    // ========================
    // 2. 标量数据类型 (Scalar Types)
    // ========================
    
    // 整数类型 (Integer Types)
    let signed_i8: i8 = -128;        // 8位有符号整数
    let unsigned_u8: u8 = 255;       // 8位无符号整数
    let default_i32: i32 = 42;       // 默认为 i32
    let isize_example: isize = -10;  // 指针大小的整数（在64位系统上通常是64位）
    
    println!("i8: {}, u8: {}, i32: {}, isize: {}", 
             signed_i8, unsigned_u8, default_i32, isize_example);
    
    // 浮点类型 (Floating-Point Types)
    let x_f64 = 2.0;       // f64，默认浮点类型
    let y_f32: f32 = 3.0;  // f32，显式指定类型
    
    println!("f64: {}, f32: {}", x_f64, y_f32);
    
    // 布尔类型 (Boolean Type)
    let t = true;
    let f: bool = false;  // 显式指定类型
    
    println!("布尔值 t: {}, f: {}", t, f);
    
    // 字符类型 (Character Type)
    let c = 'z';
    let unicode_char = '中';  // Rust 的 char 类型是 Unicode 标量值
    
    println!("字符 c: {}, 中文字符: {}", c, unicode_char);
    
    // ========================
    // 3. 复合数据类型 (Compound Types)
    // ========================
    
    // 元组 (Tuple) - 固定长度，可以包含不同类型
    let tup: (i32, f64, u8) = (500, 6.4, 1);
    
    // 解构元组
    let (x, y, z) = tup;
    println!("解构元组: x = {}, y = {}, z = {}", x, y, z);
    
    // 访问元组元素
    let five_hundred = tup.0;
    let six_point_four = tup.1;
    let one = tup.2;
    println!("元组元素: {} {} {}", five_hundred, six_point_four, one);
    
    // 数组 (Array) - 固定长度，相同类型
    let arr = [1, 2, 3, 4, 5];  // 推断类型
    let explicit_arr: [i32; 5] = [1, 2, 3, 4, 5];  // 显式指定类型和长度
    let filled_arr = [3; 5];  // 创建 [3, 3, 3, 3, 3]
    
    println!("数组 arr: {:?}", arr);
    println!("显式数组: {:?}", explicit_arr);
    println!("填充数组: {:?}", filled_arr);
    
    // 访问数组元素
    let first_element = arr[0];
    println!("数组第一个元素: {}", first_element);
}
```

**终端：**
```text
x 的值是: 5
y 的初始值是: 10
y 的新值是: 15
最大点数是: 100000
通过隐藏，z 的最终值是: 12
i8: -128, u8: 255, i32: 42, isize: -10
f64: 2, f32: 3
布尔值 t: true, f: false
字符 c: z, 中文字符: 中
解构元组: x = 500, y = 6.4, z = 1
元组元素: 500 6.4 1
数组 arr: [1, 2, 3, 4, 5]
显式数组: [1, 2, 3, 4, 5]
填充数组: [3, 3, 3, 3, 3]
数组第一个元素: 1
``` 

### 02_functions

**代码：**
```rust
// 02_functions.rs - 函数

fn main()
{
    // 调用自定义函数
    another_function();
    
    // 带参数的函数调用
    print_labeled_value(5, 'h');
    
    // 函数返回值
    let result = plus_one(5);
    println!("plus_one(5) 的结果是: {}", result);
    
    // 表达式与语句的区别
    let x = 5;
    let y = {
        let x = 3;
        x + 1  // 这是一个表达式，没有分号，所以会返回值
    };
    
    println!("x 是: {}", x);  // x = 5
    println!("y 是: {}", y);  // y = 4
}

// 定义一个简单函数
fn another_function()
{
    println!("另一个函数!");
}

// 带参数的函数
fn print_labeled_value(value: i32, unit_label: char)
{
    println!("标签值是: {}{}", value, unit_label);
}

// 带返回值的函数
fn plus_one(x: i32) -> i32  // -> i32 表示返回 i32 类型
{
    x + 1  // 注意：这里没有分号，这是一个表达式，会返回值
}

// 返回值的其他例子
fn calculate_area(length: i32, width: i32) -> i32
{
    length * width
}

// 使用块作为表达式的函数
fn temperature_warning(temp: i32) -> String
{
    if temp > 30
    {
        "天气很热!".to_string()
    }
    else
    {
        "天气适中.".to_string()
    }
}
```

**终端：**
```text
标签值是: 5h
plus_one(5) 的结果是: 6
x 是: 5
y 是: 4
```

### 03_control_flow

**代码：**
```rust
// 03_control_flow.rs - 流程控制

fn main()
{
    // ========================
    // 1. if/else 表达式
    // ========================
    
    let number = 3;
    
    if number < 5
    {
        println!("条件为真");
    }
    else
    {
        println!("条件为假");
    }
    
    // if 作为表达式用于赋值
    let condition = true;
    let number = if condition { 5 } else { 6 };  // 注意：分支的返回类型必须相同
    println!("number 的值是: {}", number);
    
    // 多重条件判断
    let num = 6;
    
    if num % 4 == 0
    {
        println!("{} 可以被 4 整除", num);
    }
    else if num % 3 == 0
    {
        println!("{} 可以被 3 整除", num);
    }
    else if num % 2 == 0
    {
        println!("{} 可以被 2 整除", num);
    }
    else
    {
        println!("{} 不能被 4、3 或 2 整除", num);
    }
    
    // ========================
    // 2. 循环 (Loops)
    // ========================
    
    // loop - 无限循环
    let mut counter = 0;
    
    let result = loop
    {
        counter += 1;
        
        if counter == 10
        {
            break counter * 2;  // 从循环返回值
        }
    };
    
    println!("loop 循环的结果是: {}", result);
    
    // while - 条件循环
    let mut number = 3;
    
    while number != 0
    {
        println!("{}!", number);
        number -= 1;
    }
    
    println!("while 循环结束!");
    
    // for - 遍历集合或范围
    let a = [10, 20, 30, 40, 50];
    
    // 使用 for 循环遍历数组
    for element in a.iter()
    {
        println!("数组元素: {}", element);
    }
    
    // 使用 for 和 range 遍历数字范围
    println!("倒计时:");

    // 左闭右开 1..4 是 1，2，3
    for number in (1..4).rev()  // rev() 反转范围
    {
        println!("{}!", number);
    }
    println!("发射!");
    
    // ========================
    // 3. match 控制流
    // ========================
    
    // match 类似于其他语言的 switch，但更强大且必须穷尽所有可能性。

    let dice_roll = 9;
    
    match dice_roll
    {
        3 => println!("获得奖励!"),
        7 => println!("游戏结束!"),
        other => println!("移动 {} 步.", other),  // other 是一个通配变量，会绑定所有未被前面分支匹配的值（这里是除 3 和 7 外的所有值）
    }
    
    // match 与选项类型 (稍后在枚举部分详细介绍)
    let some_value = Some(3);
    
    // Option 有两个变体：Some(T) 表示有值，None 表示无值。
    match some_value
    {
        Some(3) => println!("找到了值 3!"),      // 仅匹配 Some(3)，3 被解构出来。
        Some(x) => println!("找到了值: {}", x),  // 匹配任何 Some，并将内部值绑定到变量 x。
        None => println!("没有找到任何值"),       // 处理 None 情况。注意：match 必须覆盖 None，否则编译报错，这强制你处理空值，避免空指针异常。
    }
    
    // ========================
    // 4. if let 简化匹配
    // ========================
    
    // 当只关心一种模式时，使用 if let 替代 match
    // 等价于 match { Some(3) => ..., _ => () }
    if let Some(3) = some_value
    {
        println!("if let: 找到了值 3!");
    }
    
    // 带 else 子句的 if let
    let config_max = Some(3u8);
    
    match config_max
    {
        Some(max) => println!("最大配置是 {}", max),
        _ => (),  // 忽略其他情况，什么都不做，但必须写
    }
    
    // 等价的 if let 形式
    if let Some(max) = config_max
    {
        println!("if let: 最大配置是 {}", max);
    }
    else
    {
        println!("if let: 没有配置值");  // 这里处理 None 的情况，可以省略不写
    }
}
```

**终端：**
```text
条件为真
number 的值是: 5
6 可以被 3 整除
loop 循环的结果是: 20
3!
2!
1!
while 循环结束!
数组元素: 10
数组元素: 20
数组元素: 30
数组元素: 40
数组元素: 50
倒计时:
3!
2!
1!
发射!
移动 9 步.
找到了值 3!
if let: 找到了值 3!
最大配置是 3
if let: 最大配置是 3
```

### 04_ownership

**代码：**
```rust
// 04_ownership.rs - 所有权

fn main()
{
    // ========================
    // 1. 所有权的基本概念
    // ========================
    
    // 字符串字面量 vs 字符串类型
    let s1 = "字符串字面量";  // 存储在栈上，不可变
    let mut s2 = String::from("堆分配字符串");  // 存储在堆上，可变
    
    // 修改字符串
    s2.push_str(", 追加内容");
    println!("{}", s2);
    
    // ========================
    // 2. 移动 (Move)
    // ========================
    
    let s1 = String::from("hello");
    let s2 = s1;  // s1 的值被移动到 s2，s1 不再有效
    
    // println!("{}, world!", s1);  // 这行代码会报错！因为 s1 已经无效了
    
    println!("{}, world!", s2);  // 正确：s2 拥有值
    
    // 整数类型的复制 (Copy trait)
    let x = 5;
    let y = x;  // x 实现了 Copy trait，所以这里是复制而不是移动
    
    println!("x = {}, y = {}", x, y);  // 两个变量都可以使用
    
    // ========================
    // 3. 函数中的所有权
    // ========================
    
    let s = String::from("hello");  // s 进入作用域
    
    takes_ownership(s);  // s 的值移动到函数里，s 从此不再有效
    
    // println!("{}", s);  // 错误！s 已经被移动了
    
    let x = 5;  // x 进入作用域
    
    makes_copy(x);  // x 应该被复制，因为它实现了 Copy trait
    
    println!("x 在函数调用后仍然可用: {}", x);  // 正确！x 仍然有效
    
    // ========================
    // 4. 返回值和作用域
    // ========================
    
    let s1 = gives_ownership();  // 函数返回值移动给 s1
    
    let s2 = String::from("hello");  // s2 进入作用域
    
    let s3 = takes_and_gives_back(s2);  // s2 被移动到函数，返回值移动给 s3
    
    println!("s1: {}, s3: {}", s1, s3);
    
    // ========================
    // 5. 引用和借用 (References & Borrowing)
    // ========================
    
    let s1 = String::from("hello");
    
    let len = calculate_length(&s1);  // &s1 创建对 s1 的引用，不获取所有权
    
    println!("字符串 '{}' 的长度是 {}.", s1, len);  // s1 仍然有效
    
    // 可变引用
    let mut s = String::from("hello");
    
    change(&mut s);  // 传递可变引用
    
    println!("修改后的字符串: {}", s);
    
    // ========================
    // 6. 悬垂引用 (Dangling References) - Rust 会防止这种情况
    // ========================
    
    // let reference_to_nothing = dangle();  // 这个函数不能编译通过
    
    let no_dangle_result = no_dangle();
    println!("no_dangle 返回的字符串: {}", no_dangle_result);
}

// 获取所有权的函数
fn takes_ownership(some_string: String)  // some_string 进入作用域
{
    println!("{}", some_string);
}  // some_string 离开作用域并被丢弃

// 复制值的函数
fn makes_copy(some_integer: i32)  // some_integer 进入作用域
{
    println!("{}", some_integer);
}  // some_integer 离开作用域，但它是 Copy 类型，所以没什么特别的

// 返回所有权的函数
fn gives_ownership() -> String  // 返回值移动到调用函数
{
    let some_string = String::from("hello");
    some_string  // some_string 被返回并移交给调用函数
}

// 获取并返回所有权的函数
fn takes_and_gives_back(a_string: String) -> String  // a_string 进入
{
    a_string  // 返回 a_string，移动给调用者
}

// 使用引用的函数 - 不获取所有权
fn calculate_length(s: &String) -> usize  // s 是对 String 的引用
{
    s.len()  // 获取长度但不获取所有权
}  // s 离开作用域，但它不拥有引用的数据，所以不会发生任何事情

// 使用可变引用的函数
fn change(some_string: &mut String)
{
    some_string.push_str(", world");
}

// 演示悬垂引用问题（这个函数不会编译）
/*
fn dangle() -> &String  // dangle 返回一个对 String 的引用
{
    let s = String::from("hello");  // s 是一个新的 String
    
    &s  // 我们尝试返回对 s 的引用
}  // s 离开作用域，被删除。返回指向被删除对象的引用，这是不允许的！

// 正确的写法 - 返回所有权而不是引用
*/
fn no_dangle() -> String
{
    let s = String::from("hello");
    
    s  // 返回 String，而不是引用
}
```

**终端：**
```text
堆分配字符串, 追加内容
hello, world!
x = 5, y = 5
hello
5
x 在函数调用后仍然可用: 5
s1: hello, s3: hello
字符串 'hello' 的长度是 5.
修改后的字符串: hello, world
no_dangle 返回的字符串: hello
```

### 05_structs

**代码：**
```rust
// 05_structs.rs - 结构体

#[derive(Debug)]  // 添加 Debug trait 以便打印结构体
struct User
{
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}

// 带有方法的结构体
#[derive(Debug)]
struct Rectangle
{
    width: u32,
    height: u32,
}

// 带有单个字段的结构体（单元结构体）
struct AlwaysEqual;

fn main()
{
    // ========================
    // 1. 创建和使用结构体实例
    // ========================
    
    // 创建 User 实例
    let user1 = User
    {
        email: String::from("someone@example.com"),
        username: String::from("someusername123"),
        active: true,
        sign_in_count: 1,
    };
    
    println!("用户邮箱: {}", user1.email);
    
    // 访问结构体字段
    if user1.active
    {
        println!("用户 {} 是活跃的", user1.username);
    }
    
    // ========================
    // 2. 可变结构体
    // ========================
    
    let mut user2 = User
    {
        email: String::from("another@example.com"),
        username: String::from("anotherusername567"),
        active: true,
        sign_in_count: 1,
    };
    
    // 修改结构体字段
    user2.email = String::from("updated@example.com");
    println!("更新后的邮箱: {}", user2.email);
    
    // ========================
    // 3. 使用函数创建结构体实例
    // ========================
    
    let user3 = build_user
    (
        String::from("third@example.com"),
        String::from("thirdusername")
    );
    
    println!("通过函数创建的用户: {:?}", user3);
    
    // ========================
    // 4. 结构体更新语法
    // ========================
    
    let user4 = User
    {
        email: String::from("fourth@example.com"),
        username: String::from("fourthusername"),
        ..user1  // 使用 user1 的其余字段
    };
    
    println!("使用更新语法创建的用户: {:?}", user4);
    
    // ========================
    // 5. 元组结构体
    // ========================
    
    struct Color(i32, i32, i32);  // RGB 颜色
    struct Point(i32, i32, i32);  // 3D 坐标
    
    let black = Color(0, 0, 0);
    let origin = Point(0, 0, 0);
    
    println!("黑色 RGB 值: ({}, {}, {})", black.0, black.1, black.2);
    println!("原点坐标: ({}, {}, {})", origin.0, origin.1, origin.2);
    
    // ========================
    // 6. 单元结构体
    // ========================
    
    let subject = AlwaysEqual;  // 单元结构体实例
    
    // ========================
    // 7. 结构体的方法
    // ========================
    
    let rect1 = Rectangle { width: 30, height: 50 };
    let rect2 = Rectangle { width: 10, height: 40 };
    let rect3 = Rectangle { width: 60, height: 45 };
    
    println!("rect1 的面积是: {}", rect1.area());
    
    // 使用方法检查是否可以容纳其他矩形
    println!("rect1 可以容纳 rect2 吗? {}", rect1.can_hold(&rect2));
    println!("rect1 可以容纳 rect3 吗? {}", rect1.can_hold(&rect3));
    
    // ========================
    // 8. 关联函数 (静态方法)
    // ========================
    
    let square = Rectangle::square(25);
    println!("正方形: {:?}", square);
}

// 创建用户的辅助函数
fn build_user(email: String, username: String) -> User
{
    User
    {
        email,     // 字段初始化简写 (email: email)
        username,  // 字段初始化简写 (username: username)
        active: true,
        sign_in_count: 1,
    }
}

// 为结构体实现方法
impl Rectangle
{
    // 实例方法 - 计算面积
    fn area(&self) -> u32
    {
        self.width * self.height
    }
    
    // 实例方法 - 检查是否能容纳另一个矩形
    fn can_hold(&self, other: &Rectangle) -> bool
    {
        self.width > other.width && self.height > other.height
    }
    
    // 关联函数 (类似静态方法) - 创建正方形
    fn square(size: u32) -> Rectangle
    {
        Rectangle
        {
            width: size,
            height: size,
        }
    }
}
```

**终端：**
```text
用户邮箱: someone@example.com
用户 someusername123 是活跃的
更新后的邮箱: updated@example.com
通过函数创建的用户: User { username: "thirdusername", email: "third@example.com", sign_in_count: 1, active: true }
使用更新语法创建的用户: User { username: "fourthusername", email: "fourth@example.com", sign_in_count: 1, active: true }
黑色 RGB 值: (0, 0, 0)
原点坐标: (0, 0, 0)
rect1 的面积是: 1500
rect1 可以容纳 rect2 吗? true
rect1 可以容纳 rect3 吗? false
正方形: Rectangle { width: 25, height: 25 }
```

### 06_enums_and_pattern_matching

**代码：**
```rust
// 06_enums_and_pattern_matching.rs - 枚举和模式匹配

#[derive(Debug)]
enum IpAddrKind
{
    V4,
    V6,
}

// 将数据直接嵌入枚举
#[derive(Debug)]
enum IpAddr
{
    V4(u8, u8, u8, u8),
    V6(String),
}

// 使用结构体存储数据
struct Ipv4Addr
{
    a: u8,
    b: u8,
    c: u8,
    d: u8,
}

struct Ipv6Addr
{
    addr: String,
}

enum IpAddrWithStruct
{
    V4(Ipv4Addr),
    V6(Ipv6Addr),
}

// 更多枚举示例
#[derive(Debug)]
enum Message
{
    Quit,                        // 不包含任何数据
    Move { x: i32, y: i32 },     // 包含匿名结构体
    Write(String),               // 包含单一字符串
    ChangeColor(i32, i32, i32),  // 包含三个 i32 值
}

// 为枚举实现方法
impl Message
{
    fn call(&self)
    {
        // 方法体 - 可以使用 self 来获取调用方法的枚举值
        println!("消息被调用: {:?}", self);
    }
}

// Option 枚举示例 (Rust 预定义的枚举)
// enum Option<T>
// {
//     Some(T),
//     None,
// }

fn main()
{
    // ========================
    // 1. 基本枚举使用
    // ========================
    
    let four = IpAddrKind::V4;
    let six = IpAddrKind::V6;
    
    route(four);
    route(six);
    
    // ========================
    // 2. 带有数据的枚举
    // ========================
    
    let home = IpAddr::V4(127, 0, 0, 1);
    let loopback = IpAddr::V6(String::from("::1"));
    
    println!("家庭地址: {:?}", home);
    println!("回环地址: {:?}", loopback);
    
    // ========================
    // 3. 枚举方法
    // ========================
    
    let m = Message::Write(String::from("hello"));
    m.call();
    
    let quit_msg = Message::Quit;
    quit_msg.call();
    
    let move_msg = Message::Move { x: 10, y: 20 };
    move_msg.call();
    
    // ========================
    // 4. match 控制流运算符
    // ========================
    
    let some_number = Some(5);
    let some_string = Some("a string");
    let absent_number: Option<i32> = None;
    
    println!("some_number: {:?}", some_number);
    println!("some_string: {:?}", some_string);
    println!("absent_number: {:?}", absent_number);
    
    // 使用 match 处理 Option
    let x = Some(5);
    let y = 10;
    
    let sum = match x
    {
        Some(50) => 50 + y,  // 返回 i32
        Some(n) if n == 5 =>
        {
            println!("匹配到了 Some(5)，然后加上 {}", y);
            n + y
        },
        _ => 2,
    };
    
    println!("sum 的值是: {}", sum);
    
    // ========================
    // 5. match 和枚举
    // ========================
    
    let coin = Coin::Penny;
    println!("硬币价值: {} 分", value_in_cents(coin));
    
    let quarter_coin = Coin::Quarter(UsState::Alaska);
    println!("硬币价值: {} 分", value_in_cents(quarter_coin));
    
    // ========================
    // 6. if let 简化匹配
    // ========================
    
    let some_value = Some(3);
    if let Some(3) = some_value
    {
        println!("得到了三!");
    }
    
    // 等价于 match 表达式
    match some_value
    {
        Some(3) => println!("匹配到了 Some(3)!"),
        _ => (),
    }
    
    // 使用 if let 和 else
    let mut count = 0;
    let coin2 = Coin::Nickel;
    
    if let Coin::Quarter(state) = coin2
    {
        println!("25美分硬币来自: {:?}", state);
    }
    else
    {
        count += 1;
        println!("计数增加到: {}", count);
    }
    
    // ========================
    // 7. 模式匹配的其他应用
    // ========================
    
    let dice_roll = 9;
    match dice_roll
    {
        3 => println!("得到奖励!"),
        7 => println!("游戏结束!"),
        other => println!("移动 {} 步", other),
    }
}

fn route(ip_kind: IpAddrKind)
{
    println!("路由到 IP 版本: {:?}", ip_kind);
}

#[derive(Debug)]
enum UsState
{
    Alabama,
    Alaska,
    // ... 其他州
}

enum Coin
{
    Penny,
    Nickel,
    Dime,
    Quarter(UsState),  // 25美分硬币可以有不同的州设计
}

fn value_in_cents(coin: Coin) -> u8
{
    match coin
    {
        Coin::Penny =>
        {
            println!("一分硬币!");
            1
        },
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) =>
        {
            println!("25美分硬币，来自 {:?}!", state);
            25
        },
    }
}
```

**终端：**
```text
路由到 IP 版本: V4
路由到 IP 版本: V6
家庭地址: V4(127, 0, 0, 1)
回环地址: V6("::1")
消息被调用: Write("hello")
消息被调用: Quit
消息被调用: Move { x: 10, y: 20 }
some_number: Some(5)
some_string: Some("a string")
absent_number: None
匹配到了 Some(5)，然后加上 10
sum 的值是: 15
一分硬币!
硬币价值: 1 分
25美分硬币，来自 Alaska!
硬币价值: 25 分
得到了三!
匹配到了 Some(3)!
计数增加到: 1
移动 9 步
```

### 07_common_collections

**代码：**
```rust

```

**终端：**
```text

```