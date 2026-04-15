---
title: "速通 Rust 基础"
date: 2026-04-14T12:00:00+08:00
tags: ["rust", "编程语言", "语法", "算法", "语言", "Rust", "蟹教"]
categories: ["语言学习"]
series: ["逃课-速通"]
---

> 作为聪明的我们，在2026年这一块，有 `Cpp` 基础的前提上，加入蟹教、搞 `Rust` ，必然是直接使唤 `ai` 来辅助学习的~

## 01_variables_and_types

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

## 02_functions

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

## 03_control_flow

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

## 04_ownership

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

## 05_structs

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

## 06_enums_and_pattern_matching

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

## 07_common_collections

**代码：**
```rust
// 07_common_collections.rs - 常见集合

fn main()
{
    // ========================
    // 1. Vector (向量)
    // ========================
    
    // 这不是我们 Cpp 的那个那个那个嘛！

    // 创建空向量
    let mut v: Vec<i32> = Vec::new();
    
    // 使用宏创建带有初始值的向量
    let v2 = vec![1, 2, 3];
    
    // 向向量添加元素
    v.push(5);
    v.push(6);
    v.push(7);
    v.push(8);
    
    println!("v2: {:?}", v2);
    println!("v: {:?}", v);
    
    // 读取向量元素
    let third: &i32 = &v2[2];  // 使用索引访问
    println!("第三个元素是: {}", third);
    
    match v2.get(2)
    {  // 使用 get 方法访问
        Some(third) => println!("第三个元素是: {}", third),
        None => println!("没有第三个元素"),
    }
    
    // 遍历向量
    for i in &v
    {
        println!("向量中的值: {}", i);
    }
    
    // 修改向量中的元素
    let mut v3 = vec![100, 32, 57];
    for i in &mut v3
    {
        *i += 50;  // 使用解引用操作符修改值
    }
    println!("修改后的向量: {:?}", v3);
    
    // 使用枚举存储多种类型
    #[derive(Debug)]
    enum SpreadsheetCell
    {
        Int(i32),
        Float(f64),
        Text(String),
    }
    
    let row = vec![
        SpreadsheetCell::Int(3),
        SpreadsheetCell::Text(String::from("blue")),
        SpreadsheetCell::Float(10.12),
    ];
    
    println!("混合类型向量: {:?}", row);
    
    // ========================
    // 2. String (字符串)
    // ========================
    
    // 创建空字符串
    let mut s = String::new();
    s.push_str("foo");
    s.push('l');  // push 添加单个字符
    s.push_str(" bar");
    
    println!("构建的字符串: '{}'", s);
    
    // 使用 to_string 方法
    let data = "initial contents";
    let s1 = data.to_string();
    
    // 直接在字符串字面量上调用
    let s2 = "initial contents".to_string();
    
    // 使用 String::from
    let s3 = String::from("initial contents");
    
    println!("三种创建字符串的方式: '{}', '{}', '{}'", s1, s2, s3);
    
    // 字符串拼接 (使用 + 操作符)
    let s1 = String::from("Hello, ");
    let s2 = String::from("world!");
    let s3 = s1 + &s2;  // 注意：s1 被移动了，不能再使用
    
    println!("拼接结果: '{}'", s3);
    
    // 使用 format! 宏进行格式化拼接
    let s1 = String::from("tic");
    let s2 = String::from("tac");
    let s3 = String::from("toe");
    
    let s = format!("{}-{}-{}", s1, s2, s3);
    println!("格式化拼接: '{}'", s);
    
    // 字符串切片
    let hello = "Здравствуйте";
    let s = &hello[0..4];  // 注意：这里按字节索引，不是字符
    println!("字符串切片 (前4字节): '{}'", s);
    
    // 遍历字符串
    for c in "नमस्ते".chars()
    {
        println!("字符: {}", c);
    }
    
    // ========================
    // 3. HashMap (哈希映射)
    // ========================
    
    use std::collections::HashMap;
    
    // 创建空的 HashMap
    let mut scores = HashMap::new();
    
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);
    
    println!("分数表: {:?}", scores);
    
    // 从向量创建 HashMap
    let teams = vec![String::from("Blue"), String::from("Yellow")];
    let initial_scores = vec![10, 50];
    
    let scores2: HashMap<_, _> = teams.iter().zip(initial_scores.iter()).collect();
    
    println!("从向量创建的分数表: {:?}", scores2);
    
    // 访问 HashMap 中的值
    let team_name = String::from("Blue");
    let score = scores.get(&team_name);
    
    match score
    {
        Some(score) => println!("{} 队得分: {}", team_name, score),
        None => println!("未找到 {} 队", team_name),
    }
    
    // 遍历 HashMap
    for (key, value) in &scores
    {
        println!("{}: {}", key, value);
    }
    
    // 更新 HashMap
    scores.insert(String::from("Blue"), 25);  // 替换旧值
    
    // 只在键不存在时插入
    scores.entry(String::from("Red")).or_insert(30);
    scores.entry(String::from("Blue")).or_insert(50);  // Blue 键已存在，不会更新
    
    println!("更新后的分数表: {:?}", scores);
    
    // 基于旧值更新
    let text = "hello world wonderful world";
    
    let mut map = HashMap::new();
    for word in text.split_whitespace()
    {
        let count = map.entry(word).or_insert(0);
        *count += 1;
    }
    
    println!("单词计数: {:?}", map);
}
```

**终端：**
```text
v2: [1, 2, 3]
v: [5, 6, 7, 8]
第三个元素是: 3
第三个元素是: 3
向量中的值: 5
向量中的值: 6
向量中的值: 7
向量中的值: 8
修改后的向量: [150, 82, 107]
混合类型向量: [Int(3), Text("blue"), Float(10.12)]
构建的字符串: 'fool bar'
三种创建字符串的方式: 'initial contents', 'initial contents', 'initial contents'
拼接结果: 'Hello, world!'
格式化拼接: 'tic-tac-toe'
字符串切片 (前4字节): 'Зд'
字符: न
字符: म
字符: स
字符: ्
字符: त
字符: े
分数表: {"Blue": 10, "Yellow": 50}
从向量创建的分数表: {"Blue": 10, "Yellow": 50}
Blue 队得分: 10
Blue: 10
Yellow: 50
更新后的分数表: {"Red": 30, "Blue": 25, "Yellow": 50}
单词计数: {"wonderful": 1, "hello": 1, "world": 2}
```

## 08_packages_and_modules

**代码：**
```rust
// 08_packages_and_modules.rs - 包和模块

// 定义一个模块
mod sound
{
    // 模块内的公共函数
    pub fn guitar()
    {
        println!("吉他声音");
    }
    
    // 私有函数（默认为私有）
    fn drums()
    {
        println!("鼓声");
    }
    
    // 公共模块
    pub mod utils
    {
        pub fn play()
        {
            println!("播放音乐");
        }
        
        pub fn stop()
        {
            println!("停止播放");
        }
    }
}

// 使用 use 引入函数
use std::fmt;
use crate::sound::guitar;  // 绝对路径
use sound::utils;  // 相对路径

// 自定义结构体并实现 Display trait
pub struct Point
{
    pub x: i32,
    pub y: i32,
}

impl fmt::Display for Point
{
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
    {
        write!(f, "({}, {})", self.x, self.y)
    }
}

// 定义一个更复杂的模块结构
mod network
{
    pub mod server
    {
        pub fn connect()
        {
            println!("服务器连接");
        }
        
        pub fn disconnect() {
            println!("服务器断开连接");
        }
        
        // 内部模块
        mod connection
        {
            pub fn establish()
            {
                println!("建立连接");
            }
            
            pub fn close()
            {
                println!("关闭连接");
            }
        }
    }
    
    pub mod client
    {
        pub fn connect()
        {
            println!("客户端连接");
        }
        
        // 使用 super 访问父模块
        pub fn connect_with_server()
        {
            super::server::connect();
        }
    }
}

// 使用外部 crate 的示例（如果项目中有 Cargo.toml，通常会在这里引入外部依赖）
// extern crate rand;  // 在新版 Rust 中通常不需要这样写

fn main()
{
    // ========================
    // 1. 使用模块中的函数
    // ========================
    
    // 使用绝对路径调用
    crate::sound::guitar();
    
    // 使用相对路径调用
    sound::guitar();
    
    // 使用 use 引入的函数
    guitar();
    
    // 调用嵌套模块中的函数
    sound::utils::play();
    utils::play();  // 由于 use 语句，可以直接调用
    
    // ========================
    // 2. 使用复杂模块结构
    // ========================
    
    network::server::connect();
    network::client::connect();
    network::client::connect_with_server();
    
    // ========================
    // 3. 使用自定义结构体
    // ========================
    
    let point = Point { x: 10, y: 20 };
    println!("点的位置: {}", point);
    
    // ========================
    // 4. 路径和可见性
    // ========================
    
    // 正确：调用公共函数
    public_function();
    
    // 正确：调用父模块的函数
    outer_function();
    
    // ========================
    // 5. 使用标准库模块
    // ========================
    
    use std::collections::HashMap;
    
    let mut map = HashMap::new();
    map.insert(1, "one");
    map.insert(2, "two");
    println!("HashMap: {:?}", map);
    
    // 使用别名
    use std::fmt as formatter;
    println!("使用别名导入的模块");
    
    // 嵌套导入
    use std::{cmp::Ordering, io};
    
    // 多个项导入到同一作用域
    // use std::io::{self, Write};
    
    // 使用通配符导入（谨慎使用）
    // use std::collections::*;  // 导入 collections 中的所有公共项

    // 使用 io 模块
    let _stdout = io::stdout();
    println!("标准库模块使用示例");
}

// 公共函数
pub fn public_function()
{
    println!("这是一个公共函数");
}

// 私有函数
fn private_function()
{
    println!("这是一个私有函数");
}

// 外部函数
fn outer_function()
{
    println!("外部函数");
}

// 模块示例：使用文件组织模块
// 如果有多个文件，可以这样组织：
//
// src/
// ├── main.rs 或 lib.rs
// ├── sound.rs (包含 sound 模块的内容)
// └── network/
//     ├── mod.rs (网络模块的定义)
//     └── client.rs (客户端相关功能)
//
// 在主文件中使用:
// mod sound;
// mod network;
//
// 这种方式有助于组织大型项目

// 重新导出 (re-exporting)
pub use sound::guitar as instrument_sound;  // 将 guitar 作为 instrument_sound 导出
```
**终端：**
```text
吉他声音
吉他声音
吉他声音
播放音乐
播放音乐
服务器连接
客户端连接
服务器连接
点的位置: (10, 20)
这是一个公共函数
外部函数
HashMap: {1: "one", 2: "two"}
使用别名导入的模块
标准库模块使用示例
```

## 09_error_handling

**代码：**
```rust
// 09_error_handling.rs - 错误处理

use std::fs::File;
use std::io::{self, Read};
use std::net::IpAddr;

fn main()
{
    // ========================
    // 1. Result 枚举
    // ========================
    
    // 打开文件可能失败，返回 Result
    let greeting_file_result = File::open("Cargo.toml");
    
    let greeting_file = match greeting_file_result
    {
        Ok(file) => file,
        Err(error) =>
        {
            println!("打开文件出错: {:?}", error);
            // 在实际代码中，我们可能会创建文件而不是 panic
            panic!("无法打开文件");
        }
    };
    
    // ========================
    // 2. 传播错误 (Propagating Errors)
    // ========================
    
    // 使用 match 手动传播错误
    let result = read_username_from_file_manual();
    match result
    {
        Ok(content) => println!("用户名: {}", content),
        Err(e) => println!("读取用户名失败: {:?}", e),
    }
    
    // 使用 ? 操作符简化错误传播
    let result2 = read_username_from_file_short();
    match result2
    {
        Ok(content) => println!("用户名 (短版本): {}", content),
        Err(e) => println!("读取用户名失败 (短版本): {:?}", e),
    }
    
    // 直接使用 ? 操作符 (需要返回 Result 类型)
    if let Ok(content) = read_username_from_file_short()
    {
        println!("成功读取用户名: {}", content);
    }
    
    // ========================
    // 3. unwrap 和 expect
    // ========================
    
    // unwrap - 如果是 Ok 则返回值，如果是 Err 则 panic
    // let greeting_file = File::open("hello.txt").unwrap();
    
    // expect - 类似 unwrap，但允许自定义错误信息
    // let greeting_file = File::open("hello.txt").expect("无法打开 hello.txt 文件");
    
    // ========================
    // 4. Option 枚举
    // ========================
    
    let some_value = Some(5);
    let none_value: Option<i32> = None;
    
    println!("Some 值: {:?}", some_value);
    println!("None 值: {:?}", none_value);
    
    // 处理 Option
    let value = match some_value
    {
        Some(v) => v,
        None => 0,
    };
    
    println!("匹配后的值: {}", value);
    
    // 使用 unwrap_or 提供默认值
    let value2 = some_value.unwrap_or(0);
    let value3 = none_value.unwrap_or(0);
    
    println!("使用 unwrap_or: {} 和 {}", value2, value3);
    
    // ========================
    // 5. 使用闭包处理错误
    // ========================
    
    // 使用 map_err 转换错误
    let result = File::open("nonexistent.txt")
        .map_err(|err| io::Error::new(io::ErrorKind::Other, format!("自定义错误: {}", err)));
    
    if let Err(e) = result
    {
        println!("转换后的错误: {:?}", e);
    }
    
    // ========================
    // 6. Panic 与非 Panic 错误处理
    // ========================
    
    // 一些可能导致 panic 的情况
    let v = vec![1, 2, 3];
    // v[99]; // 这会导致 panic
    
    // 使用安全的方式访问
    match v.get(99)
    {
        Some(value) => println!("值: {}", value),
        None => println!("索引超出范围"),
    }
    
    // ========================
    // 7. 类型转换中的错误处理
    // ========================
    
    let parse_result: Result<i32, _> = "42".parse();
    
    match parse_result
    {
        Ok(num) => println!("解析成功: {}", num),
        Err(e) => println!("解析失败: {:?}", e),
    }
    
    // 尝试解析无效数字
    let invalid_parse: Result<i32, _> = "not_a_number".parse();
    
    match invalid_parse
    {
        Ok(num) => println!("解析成功: {}", num),
        Err(e) => println!("解析失败: {:?}", e),
    }
    
    // ========================
    // 8. 使用链式调用来处理错误
    // ========================
    
    let ip_addr_result = "127.0.0.1".parse::<IpAddr>();
    
    match ip_addr_result
    {
        Ok(ip) => println!("有效的IP地址: {}", ip),
        Err(e) => println!("无效的IP地址: {:?}", e),
    }
    
    // 尝试无效IP
    let invalid_ip = "invalid_ip".parse::<IpAddr>();
    
    match invalid_ip
    {
        Ok(ip) => println!("有效的IP地址: {}", ip),
        Err(e) => println!("无效的IP地址: {:?}", e),
    }
}

// 手动传播错误的函数
fn read_username_from_file_manual() -> Result<String, io::Error>
{
    let username_file_result = File::open("hello.txt");

    let mut username_file = match username_file_result
    {
        Ok(file) => file,
        Err(e) => return Err(e),
    };

    let mut username = String::new();

    match username_file.read_to_string(&mut username)
    {
        Ok(_) => Ok(username),
        Err(e) => Err(e),
    }
}

// 使用 ? 操作符的简化版本
fn read_username_from_file_short() -> Result<String, io::Error>
{
    let mut username_file = File::open("hello.txt")?;
    let mut username = String::new();
    username_file.read_to_string(&mut username)?;
    Ok(username)
}

// 更简洁的写法
fn read_username_from_file_tiny() -> Result<String, io::Error>
{
    fs::read_to_string("hello.txt")  // 需要先 use std::fs;
}

// 自定义错误类型示例
#[derive(Debug)]
enum CustomError
{
    FileNotFound,
    PermissionDenied,
    ParseError,
}

impl std::fmt::Display for CustomError
{
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result
    {
        match self
        {
            CustomError::FileNotFound => write!(f, "文件未找到"),
            CustomError::PermissionDenied => write!(f, "权限不足"),
            CustomError::ParseError => write!(f, "解析错误"),
        }
    }
}

impl std::error::Error for CustomError {}

// 使用自定义错误
fn risky_operation(success: bool) -> Result<(), CustomError>
{
    if success
    {
        Ok(())
    }
    else
    {
        Err(CustomError::ParseError)
    }
}

use std::fs;  // 为了 tiny 版本的函数
```

**终端：**
```text
读取用户名失败: Os { code: 2, kind: NotFound, message: "The system cannot find the file specified." }
读取用户名失败 (短版本): Os { code: 2, kind: NotFound, message: "The system cannot find the file specified." }
Some 值: Some(5)
None 值: None
匹配后的值: 5
使用 unwrap_or: 5 和 0
转换后的错误: Custom { kind: Other, error: "自定义错误: The system cannot find the file specified. (os error 2)" }
索引超出范围
解析成功: 42
解析失败: ParseIntError { kind: InvalidDigit }
有效的IP地址: 127.0.0.1
无效的IP地址: AddrParseError(Ip)
```

## 10_generics

**代码：**
```rust
// 10_generics.rs - 泛型

fn main()
{
    // ========================
    // 1. 泛型函数
    // ========================
    
    let numbers = vec![34, 50, 25, 100, 65];
    let result = largest_i32(&numbers);
    println!("最大的数字是: {}", result);
    
    let chars = vec!['y', 'm', 'a', 'q'];
    let result = largest_char(&chars);
    println!("最大的字符是: {}", result);
    
    // 使用泛型函数
    let numbers = vec![34, 50, 25, 100, 65];
    let result = largest(&numbers);
    println!("使用泛型函数找最大值: {}", result);
    
    let chars = vec!['y', 'm', 'a', 'q'];
    let result = largest(&chars);
    println!("使用泛型函数找最大字符: {}", result);
    
    // ========================
    // 2. 泛型结构体
    // ========================
    
    let integer = Point { x: 5, y: 10 };
    let float = Point { x: 1.0, y: 4.0 };
    let mixed = Point3 { x: 5, y: 10.4 };
    
    println!("整数点: ({}, {})", integer.x, integer.y);
    println!("浮点点: ({}, {})", float.x, float.y);
    println!("混合点: ({}, {})", mixed.x, mixed.y);
    
    // 使用泛型方法
    let p1 = Point { x: 5, y: 10 };
    let p2 = Point { x: 10, y: 8 };
    let p3 = p1.mixup(p2);
    
    println!("混合点 p3: x = {:?}, y = {:?}", p3.x, p3.y);
    
    // ========================
    // 3. 泛型枚举
    // ========================
    
    let integer = Option::Some(5);
    let float = Option::Some(5.0);
    let nothing: Option<i32> = Option::None;
    
    println!("整数选项: {:?}", integer);
    println!("浮点选项: {:?}", float);
    println!("无值选项: {:?}", nothing);
    
    let result = Some("成功").ok_or("错误信息");
    println!("Result: {:?}", result);
    
    // ========================
    // 4. 泛型与特征约束
    // ========================
    
    let numbers = vec![34, 50, 25, 100, 65];
    let result = largest_with_trait(&numbers);
    println!("使用特征约束的最大值: {}", result);
    
    // ========================
    // 5. 泛型在不同场景中的应用
    // ========================
    
    let pair = Pair { x: 10, y: 20 };
    println!("原始对: x={}, y={}", pair.x, pair.y);
    
    let swapped_pair = pair.swap();
    println!("交换后对: x={}, y={}", swapped_pair.x, swapped_pair.y);
    
    // 使用泛型容器
    let mut stack: Stack<i32> = Stack::new();
    stack.push(1);
    stack.push(2);
    stack.push(3);
    
    while let Some(top) = stack.pop()
    {
        println!("弹出栈顶元素: {}", top);
    }
}

// 非泛型函数 - 找最大 i32
fn largest_i32(list: &[i32]) -> i32
{
    let mut largest = list[0];

    for &item in list.iter()
    {
        if item > largest
        {
            largest = item;
        }
    }

    largest
}

// 非泛型函数 - 找最大 char
fn largest_char(list: &[char]) -> char
{
    let mut largest = list[0];

    for &item in list.iter()
    {
        if item > largest
        {
            largest = item;
        }
    }

    largest
}

// 泛型函数 - 找最大值
fn largest<T: PartialOrd + Copy>(list: &[T]) -> T
{
    let mut largest = list[0];

    for &item in list.iter()
    {
        if item > largest
        {
            largest = item;
        }
    }

    largest
}

// 使用特征约束的泛型函数
fn largest_with_trait<T: PartialOrd + Copy>(list: &[T]) -> T
{
    let mut largest = list[0];

    for &item in list.iter()
    {
        if item > largest
        {
            largest = item;
        }
    }

    largest
}

// 泛型结构体
struct Point<T>
{
    x: T,
    y: T,
}


struct Point3<T, U>
{
    x: T,
    y: U,
}

impl<T> Point<T>
{
    // 添加 mixup 方法
    fn mixup<U>(self, other: Point<U>) -> Point<(T, U)>
    {
        Point
        {
            x: (self.x, other.x),
            y: (self.y, other.y),
        }
    }
}

// 为泛型结构体实现方法
impl<T, U> Point3<T, U>
{
    fn x(&self) -> &T
    {
        &self.x
    }

    fn y(&self) -> &U
    {
        &self.y
    }
}

// 为特定类型的泛型结构体实现方法
impl Point<f32>
{
    fn distance_from_origin(&self) -> f32
    {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}

// 为泛型结构体实现方法，其中类型参数可能不同
impl<T, U> Point3<T, U>
{
    fn mixup<V, W>(self, other: Point3<V, W>) -> Point3<T, W>
    {
        Point3
        {
            x: self.x,
            y: other.y,
        }
    }
}

// 泛型枚举
enum MyOption<T>
{
    Some(T),
    None,
}

enum Result<T, E>
{
    Ok(T),
    Err(E),
}

// 带有特征约束的泛型结构体
struct Pair<T>
{
    x: T,
    y: T,
}

impl<T> Pair<T>
{
    fn new(x: T, y: T) -> Self
    {
        Self { x, y }
    }
}

impl<T: Copy> Pair<T>
{
    fn swap(self) -> Pair<T>
    {
        Pair { x: self.y, y: self.x }
    }
}

// 泛型容器示例
struct Stack<T>
{
    items: Vec<T>,
}

impl<T> Stack<T>
{
    fn new() -> Self
    {
        Stack { items: Vec::new() }
    }

    fn push(&mut self, item: T)
    {
        self.items.push(item);
    }

    fn pop(&mut self) -> Option<T>
    {
        self.items.pop()
    }

    fn peek(&self) -> Option<&T>
    {
        self.items.last()
    }

    fn is_empty(&self) -> bool 
    {
        self.items.is_empty()
    }

    fn len(&self) -> usize
    {
        self.items.len()
    }
}
```

**终端：**
```text
最大的数字是: 100
最大的字符是: y
使用泛型函数找最大值: 100
使用泛型函数找最大字符: y
整数点: (5, 10)
浮点点: (1, 4)
混合点: (5, 10.4)
混合点 p3: x = (5, 10), y = (10, 8)
整数选项: Some(5)
浮点选项: Some(5.0)
无值选项: None
Result: Ok("成功")
使用特征约束的最大值: 100
原始对: x=10, y=20
交换后对: x=20, y=10
弹出栈顶元素: 3
弹出栈顶元素: 2
弹出栈顶元素: 1
```

## 11_traits

**代码：**
```rust
// 11_traits.rs - Trait

fn main()
{
    // ========================
    // 1. 定义和实现 Trait 特征
    // ========================
    
    let tweet = Tweet
    {
        username: String::from("horse_ebooks"),
        content: String::from("of course, as you probably already know, people"),
        reply: false,
        retweet: false,
    };
    
    println!("1 新推文: {}", tweet.summarize());
    
    let article = Article
    {
        headline: String::from("Penguins win the Stanley Cup Championship!"),
        location: String::from("Pittsburgh, PA, USA"),
        author: String::from("Iceburgh"),
        content: String::from("The Pittsburgh Penguins once again are the best hockey team in the NHL."),
    };
    
    println!("1 新文章: {}", article.summarize());
    
    // ========================
    // 2. Trait 作为参数
    // ========================
    
    notify(&article);
    notify(&tweet);
    
    // ========================
    // 3. Trait Bound 语法
    // ========================
    
    let article2 = Article
    {
        headline: String::from("New Rust Release"),
        location: String::from("Internet"),
        author: String::from("Rust Team"),
        content: String::from("Version 1.x released"),
    };
    
    println!("摘要: {}", summarize_generic(&article2));
    
    // ========================
    // 4. 返回实现了 Trait 的类型
    // ========================
    
    let returns_summarizable = returns_summarizable();
    println!("返回的摘要: {}", returns_summarizable.summarize());
    
    // ========================
    // 5. 使用多重 Trait Bound
    // ========================
    
    let pair = Pair { x: 10, y: 20 };
    pair.cmp_display();
    
    // ========================
    // 6. 派生 Trait (Derive Traits)
    // ========================
    
    let pair1 = Pair2 { x: 1, y: 2 };
    let pair2 = Pair2 { x: 1, y: 2 };
    
    if pair1 == pair2
    {
        println!("pair1 和 pair2 相等!");
    }
    
    println!("Pair2: {:?}", pair2);
    
    // ========================
    // 7. 关联类型
    // ========================
    
    let mut counter = Counter::new();
    
    for (i, val) in counter.take(5).enumerate()
    {
        println!("第 {} 次迭代，值为 {}", i + 1, val);
    }
    
    // ========================
    // 8. 默认实现和覆盖
    // ========================
    
    println!("Tweet 的默认实现: {}", tweet.default_info());
    println!("Article 的默认实现: {}", article.default_info());
}

// 定义一个 trait
trait Summary
{
    // 抽象方法 - 没有默认实现
    fn summarize(&self) -> String;
    
    // 具有默认实现的方法
    fn default_info(&self) -> String
    {
        String::from("这是一个内容摘要")
    }
}

// 定义另一个 trait
trait Display
{
    fn display(&self) -> String;
}

// 定义一个结构体
struct NewsArticle
{
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

// 为结构体实现 trait
impl Summary for NewsArticle
{
    fn summarize(&self) -> String
    {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

// 另一个结构体
struct Tweet
{
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}

// 为 Tweet 实现 Summary trait
impl Summary for Tweet
{
    fn summarize(&self) -> String
    {
        format!("{}: {}", self.username, self.content)
    }
}

// 实现 Display trait
impl Display for Tweet
{
    fn display(&self) -> String
    {
        format!("推文 - 用户: {}, 内容: {}", self.username, self.content)
    }
}

// 另一个实现了 Summary 的结构体
struct Article
{
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

impl Summary for Article
{
    fn summarize(&self) -> String
    {
        format!("{} 作者: {}", self.headline, self.author)
    }
    
    // 重写默认实现
    fn default_info(&self) -> String
    {
        format!("这是一篇关于 {} 的文章", self.headline)
    }
}

// 使用 trait 作为参数
fn notify(item: &impl Summary)
{
    println!("打断一下! {}", item.summarize());
}

// 等价的 trait bound 语法
fn notify_bound<T: Summary>(item: &T)
{
    println!("通知: {}", item.summarize());
}

// 使用多个 trait bound
fn some_function<T: Display + Clone, U: Clone + Summary>(t: &T, u: &U) -> String
{
    format!("{} 和 {}", t.display(), u.summarize())
}

// 使用 where 子句简化长的 trait bound
fn some_function_where<T, U>(t: &T, u: &U) -> String
where
    T: Display + Clone,
    U: Clone + Summary,
{
    format!("{} 和 {}", t.display(), u.summarize())
}

// 泛型函数使用 trait bound
fn summarize_generic<T: Summary>(item: &T) -> String
{
    item.summarize()
}

// 返回实现了 trait 的类型
fn returns_summarizable() -> impl Summary
{
    Tweet
    {
        username: String::from("anonymous"),
        content: String::from("I love Rust!"),
        reply: false,
        retweet: false,
    }
}

// 使用多重约束的结构体
struct Pair<T>
{
    x: T,
    y: T,
}

impl<T: std::fmt::Display + PartialEq> Pair<T>
{
    fn cmp_display(&self)
    {
        if self.x == self.y
        {
            println!("x 和 y 相等");
        }
        else
        {
            println!("x: {}, y: {}", self.x, self.y);
        }
    }
}

// 派生 trait 的结构体
#[derive(Debug, PartialEq)]
struct Pair2<T>
{
    x: T,
    y: T,
}

// 关联类型的示例
trait MyIterator
{
    type Item;  // 关联类型
    
    fn next(&mut self) -> Option<Self::Item>;
}

struct Counter
{
    count: u32,
}

impl Counter
{
    fn new() -> Counter
    {
        Counter { count: 0 }
    }
}

impl std::iter::Iterator for Counter
{
    type Item = u32;
    
    fn next(&mut self) -> Option<Self::Item>
    {
        if self.count < 5
        {
            self.count += 1;
            Some(self.count)
        }
        else
        {
            None
        }
    }
}

// trait 继承 (Trait Supertraits)
trait OutlinePrint: Display  // OutlinePrint 需要实现 Display
{
    fn outline_print(&self)
    {
        let output = self.display();
        let len = output.len();
        println!("{}", "*".repeat(len + 4));
        println!("*{}*", " ".repeat(len + 2));
        println!("* {} *", output);
        println!("*{}*", " ".repeat(len + 2));
        println!("{}", "*".repeat(len + 4));
    }
}

// 为 Tweet 实现 OutlinePrint
impl OutlinePrint for Tweet {}
```

**终端：**
```text
1 新推文: horse_ebooks: of course, as you probably already know, people
1 新文章: Penguins win the Stanley Cup Championship! 作者: Iceburgh
打断一下! Penguins win the Stanley Cup Championship! 作者: Iceburgh
打断一下! horse_ebooks: of course, as you probably already know, people
摘要: New Rust Release 作者: Rust Team
返回的摘要: anonymous: I love Rust!
x: 10, y: 20
pair1 和 pair2 相等!
Pair2: Pair2 { x: 1, y: 2 }
第 1 次迭代，值为 1
第 2 次迭代，值为 2
第 3 次迭代，值为 3
第 4 次迭代，值为 4
第 5 次迭代，值为 5
Tweet 的默认实现: 这是一个内容摘要
Article 的默认实现: 这是一篇关于 Penguins win the Stanley Cup Championship! 的文章
```

## 12_lifetimes

**代码：**
```rust
// 12_lifetimes.rs - 生命周期

fn main()
{
    // ========================
    // 1. 基本生命周期概念
    // ========================
    
    let string1 = String::from("long string is long");
    
    {
        let string2 = String::from("xyz");
        let result = longest(string1.as_str(), string2.as_str());
        println!("最长的字符串是: '{}'", result);
    }
    
    // ========================
    // 2. 生命周期省略规则
    // ========================
    
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().expect("找不到 '.'");
    let i = ImportantExcerpt
    {
        part: first_sentence,
    };
    println!("重要摘录: '{}'", i.part);
    
    // ========================
    // 3. 静态生命周期
    // ========================
    
    let s: &'static str = "我有一个静态生命周期";
    println!("静态字符串: '{}'", s);
    
    // ========================
    // 4. 方法中的生命周期
    // ========================
    
    let novel = String::from("Alice starts at 0");
    let excerpt = ImportantExcerpt
    {
        part: &novel[..5],
    };
    
    println!("摘录级别: {}", excerpt.level());
    println!("两倍部分: {}", excerpt.another_function());
    
    // ========================
    // 5. 限制生命周期的示例
    // ========================
    
    let string1 = String::from("long string is long");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest_with_announcement(string1.as_str(), string2.as_str(), "今天是好日子!");
        println!("最长的字符串是: '{}'", result);
    }
    // 注意：result 在这里仍然有效，因为它的生命周期不依赖于 string2
    
    // ========================
    // 6. 实际应用示例
    // ========================
    
    let string1 = String::from("abc");
    let string2 = String::from("defghijklmnop");
    let result = longest(string1.as_str(), string2.as_str());
    println!("比较字符串 '{}' 和 '{}': 最长的是 '{}'", string1, string2, result);
}

// 带有显式生命周期注解的函数
// 'a 是生命周期参数，表示 x 和 y 必须至少活得和返回的引用一样久
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str
{
    if x.len() > y.len()
    {
        x
    }
    else
    {
        y
    }
}

// 结构体中的生命周期
struct ImportantExcerpt<'a>
{
    part: &'a str,
}

// 为带生命周期的结构体实现方法
impl<'a> ImportantExcerpt<'a>
{
    // 方法没有返回引用，所以不需要生命周期注解
    fn level(&self) -> i32
    {
        3
    }
    
    // 方法返回 &self.part，其生命周期与 self 相同
    fn part(&self) -> &str
    {
        self.part
    }
    
    // 这个方法演示了输入和输出生命周期的关系
    fn another_function(&self) -> &str
    {
        self.part
    }
}

// 带有生命周期和泛型的函数
fn longest_with_announcement<'a, T>(
    x: &'a str,
    y: &'a str,
    ann: T,
) -> &'a str
where
    T: std::fmt::Display,
{
    println!("公告! {}", ann);
    if x.len() > y.len()
    {
        x
    }
    else
    {
        y
    }
}

// 生命周期省略规则示例
// 编译器会自动推断以下函数的生命周期，等价于上面的函数
fn first_word(s: &str) -> &str
{
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate()
    {
        if item == b' '
        {
            return &s[0..i];
        }
    }

    &s[..]
}

// 多个生命周期参数的示例
fn complex_lifetime<'a, 'b>(x: &'a str, _y: &'b str) -> &'a str
{
    // 注意：这里我们明确指定返回 'a 生命周期的引用
    // 这意味着返回的引用与 x 有相同的生命周期
    x
}

// 静态生命周期示例
const STATIC_STR: &'static str = "静态字符串常量";

// 使用生命周期来避免悬垂引用的示例
fn avoid_dangling_reference() -> String
{
    // 以下代码会导致编译错误，因为试图返回局部变量的引用
    /*
    fn dangling() -> &String
    {
        let s = String::from("hello");
        &s  // 错误：返回局部变量的引用
    }
    */
    
    // 正确的做法是返回所有权
    fn no_dangle() -> String
    {
        let s = String::from("hello");
        s  // 返回 String，而不是引用
    }
    
    no_dangle()
}
```

**终端：**
```text
最长的字符串是: 'long string is long'
重要摘录: 'Call me Ishmael'
静态字符串: '我有一个静态生命周期'
摘录级别: 3
两倍部分: Alice
公告! 今天是好日子!
最长的字符串是: 'long string is long'
比较字符串 'abc' 和 'defghijklmnop': 最长的是 'defghijklmnop'
```

##  13_closures_and_iterators

**代码：**
```rust
// 13_closures_and_iterators.rs - 闭包与迭代器：Rust函数式编程

fn main()
{
    println!("=== Rust函数式编程：闭包与迭代器 ===\n");
    
    // ========================
    // 第一部分：闭包 (Closures)
    // ========================
    
    println!("【第一部分：闭包 Closures】\n");
    
    // 1.1 闭包基础
    println!("1.1 闭包基础语法");
    println!("----------------");
    
    // 闭包的基本形式：|参数| 表达式
    let add = |a, b| a + b;
    println!("add(1, 2) = {}", add(1, 2));
    
    // 多行闭包需要使用大括号
    let multiply = |a: i32, b: i32| -> i32
    {
        let result = a * b;
        println!("计算: {} * {} = {}", a, b, result);
        result
    };
    println!("multiply(3, 4) = {}\n", multiply(3, 4));
    
    // 1.2 闭包捕获环境
    println!("1.2 闭包捕获环境变量");
    println!("--------------------");
    
    let outer_var = 10;
    
    // 闭包可以捕获外部变量
    let capture_closure = |x| x + outer_var;
    println!("捕获外部变量: capture_closure(5) = {}", capture_closure(5));
    
    // 可变捕获
    let mut count = 0;
    let mut increment = ||
    {
        count += 1;
        println!("计数器: {}", count);
    };
    increment();
    increment();
    increment();
    println!("最终 count = {}\n", count);
    
    // 1.3 三种捕获方式
    println!("1.3 闭包的三种捕获方式");
    println!("----------------------");
    
    let s = String::from("hello");
    
    // 不可变借用 (&T)
    let borrow_closure = || println!("借用: {}", s);
    borrow_closure();
    println!("借用后 s 仍可用: {}", s);
    
    // 可变借用 (&mut T)
    let mut s2 = String::from("world");
    let mut mutate_closure = ||
    {
        s2.push_str("!");
        println!("修改后: {}", s2);
    };
    mutate_closure();
    // s2 在这里可以继续使用
    println!("修改后 s2: {}\n", s2);
    
    // 1.4 Fn, FnMut, FnOnce trait
    println!("1.4 闭包实现的 Trait");
    println!("-------------------");
    println!("Fn:     不可变借用环境，可多次调用");
    println!("FnMut:  可变借用环境，可多次调用");
    println!("FnOnce: 获取所有权，只能调用一次\n");
    
    // Fn 示例
    let x = 5;
    let fn_closure = |y| y + x;
    call_fn(&fn_closure, 10);
    call_fn(&fn_closure, 20);
    
    // FnMut 示例
    let mut sum = 0;
    let mut fnmut_closure = |val|
    {
        sum += val;
        sum
    };
    println!("FnMut 累加结果: {}", call_fnmut(&mut fnmut_closure, 5));
    println!("FnMut 累加结果: {}", call_fnmut(&mut fnmut_closure, 10));
    
    // FnOnce 示例
    let s = String::from("takes ownership");
    let fnonce_closure = ||
    {
        println!("获取所有权: {}", s);
        drop(s);  // 消费 s
    };
    call_fnonce(fnonce_closure);
    // fnonce_closure 不能再调用
    
    // 1.5 闭包作为函数参数和返回值
    println!("\n1.5 闭包作为参数和返回值");
    println!("------------------------");
    
    let numbers = vec![1, 2, 3, 4, 5];
    let squared = apply_to_each(&numbers, |x| x * x);
    println!("原数组: {:?}", numbers);
    println!("平方后: {:?}", squared);
    
    // 返回闭包
    let multiplier = make_multiplier(3);
    println!("multiplier(4) = {}", multiplier(4));
    println!("multiplier(5) = {}\n", multiplier(5));
    
    // ========================
    // 第二部分：迭代器 (Iterators)
    // ========================
    
    println!("【第二部分：迭代器 Iterators】\n");
    
    // 2.1 迭代器基础
    println!("2.1 迭代器基础");
    println!("--------------");
    
    let v = vec![1, 2, 3];
    
    // iter() - 不可变引用迭代
    println!("iter():");
    for val in v.iter()
    {
        println!("  值: {}", val);
    }
    
    // iter_mut() - 可变引用迭代
    let mut v2 = vec![1, 2, 3];
    println!("\niter_mut():");
    for val in v2.iter_mut()
    {
        *val *= 2;
        println!("  修改后: {}", val);
    }
    
    // into_iter() - 获取所有权迭代
    let v3 = vec![1, 2, 3];
    println!("\ninto_iter():");
    for val in v3.into_iter()
    {
        println!("  消费值: {}", val);
    }
    // v3 在这里不能再使用
    
    // 2.2 Iterator trait 和 next 方法
    println!("\n2.2 Iterator Trait");
    println!("------------------");
    
    let mut iter = vec![1, 2, 3].into_iter();
    println!("手动调用 next():");
    println!("  {:?}", iter.next());
    println!("  {:?}", iter.next());
    println!("  {:?}", iter.next());
    println!("  {:?} (结束)\n", iter.next());
    
    // 2.3 消费适配器 (Consuming Adaptors)
    println!("2.3 消费适配器");
    println!("--------------");
    
    let nums = vec![1, 2, 3, 4, 5];
    
    // sum - 求和
    let total: i32 = nums.iter().sum();
    println!("sum: {}", total);
    
    // product - 求积
    let product: i32 = nums.iter().product();
    println!("product: {}", product);
    
    // count - 计数
    let count = nums.iter().count();
    println!("count: {}", count);
    
    // collect - 收集到集合
    let doubled: Vec<i32> = nums.iter().map(|x| x * 2).collect();
    println!("doubled: {:?}", doubled);
    
    // fold - 累积计算
    let folded = nums.iter().fold(0, |acc, x| acc + x * x);
    println!("fold (平方和): {}", folded);
    
    // any / all - 条件判断
    let has_even = nums.iter().any(|x| x % 2 == 0);
    let all_positive = nums.iter().all(|x| *x > 0);
    println!("any even: {}, all positive: {}\n", has_even, all_positive);
    
    // 2.4 迭代器适配器 (Iterator Adaptors)
    println!("2.4 迭代器适配器");
    println!("----------------");
    
    let nums = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    // map - 转换每个元素
    let squares: Vec<i32> = nums.iter().map(|x| x * x).collect();
    println!("map (平方): {:?}", squares);
    
    // filter - 过滤元素
    let evens: Vec<&i32> = nums.iter().filter(|x| *x % 2 == 0).collect();
    println!("filter (偶数): {:?}", evens);
    
    // filter_map - 过滤并映射
    let parsed: Vec<i32> = vec!["1", "two", "3", "4"]
        .into_iter()
        .filter_map(|s| s.parse().ok())
        .collect();
    println!("filter_map (解析数字): {:?}", parsed);
    
    // enumerate - 获取索引
    let with_index: Vec<(usize, &i32)> = nums.iter().enumerate().collect();
    println!("enumerate: {:?}", with_index);
    
    // take / skip - 截取
    let first_3: Vec<&i32> = nums.iter().take(3).collect();
    let skip_3: Vec<&i32> = nums.iter().skip(3).take(3).collect();
    println!("take(3): {:?}, skip(3).take(3): {:?}", first_3, skip_3);
    
    // zip - 合并两个迭代器
    let names = vec!["Alice", "Bob", "Carol"];
    let scores = vec![85, 92, 78];
    let combined: Vec<(&str, i32)> = names.into_iter().zip(scores.into_iter()).collect();
    println!("zip: {:?}", combined);
    
    // chain - 连接迭代器
    let v1 = vec![1, 2, 3];
    let v2 = vec![4, 5, 6];
    let chained: Vec<i32> = v1.into_iter().chain(v2.into_iter()).collect();
    println!("chain: {:?}", chained);
    
    // rev - 反转
    let reversed: Vec<i32> = nums.iter().take(5).rev().map(|&x| x).collect();
    println!("rev: {:?}", reversed);
    
    // flatten - 扁平化
    let nested = vec![vec![1, 2], vec![3, 4], vec![5, 6]];
    let flat: Vec<i32> = nested.into_iter().flatten().collect();
    println!("flatten: {:?}", flat);
    
    // 2.5 复杂迭代器链
    println!("\n2.5 复杂迭代器链示例");
    println!("--------------------");
    
    let data = vec![
        ("Alice", 25),
        ("Bob", 30),
        ("Carol", 22),
        ("David", 35),
        ("Eve", 28),
    ];
    
    // 筛选年龄大于25的人，获取名字，排序，连接成字符串
    let result: String = data
        .into_iter()
        .filter(|(_, age)| *age > 25)
        .map(|(name, _)| name)
        .collect::<Vec<_>>()
        .join(", ");
    
    println!("年龄大于25岁的人: {}", result);
    
    // 更复杂的例子
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let sum_of_even_squares: i32 = numbers
        .iter()
        .filter(|&&x| x % 2 == 0)     // 筛选偶数
        .map(|x| x * x)                // 平方
        .take(3)                       // 取前3个
        .sum();                        // 求和
    println!("前3个偶数的平方和: {}\n", sum_of_even_squares);
    
    // ========================
    // 第三部分：闭包与迭代器结合
    // ========================
    
    println!("【第三部分：闭包与迭代器结合】\n");
    
    // 3.1 使用闭包自定义逻辑
    println!("3.1 自定义排序与比较");
    println!("--------------------");
    
    let mut people = vec![
        ("Alice", 30),
        ("Bob", 25),
        ("Carol", 35),
    ];
    
    // 按年龄排序
    people.sort_by(|a, b| a.1.cmp(&b.1));
    println!("按年龄排序: {:?}", people);
    
    // 按名字长度排序
    people.sort_by(|a, b| a.0.len().cmp(&b.0.len()));
    println!("按名字长度排序: {:?}", people);
    
    // 3.2 分组与分区
    println!("\n3.2 分组与分区");
    println!("--------------");
    
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    // partition - 分成两组
    let (evens, odds): (Vec<i32>, Vec<i32>) = numbers
        .into_iter()
        .partition(|x| x % 2 == 0);
    println!("偶数: {:?}, 奇数: {:?}", evens, odds);
    
    // 3.3 查找操作
    println!("\n3.3 查找操作");
    println!("------------");
    
    let numbers = vec![1, 3, 5, 8, 10, 12];
    
    // find - 查找第一个满足条件的
    let first_even = numbers.iter().find(|&&x| x % 2 == 0);
    println!("第一个偶数: {:?}", first_even);
    
    // position - 查找位置
    let pos = numbers.iter().position(|&x| x > 5);
    println!("第一个大于5的位置: {:?}", pos);
    
    // max_by / min_by - 自定义比较
    let max = numbers.iter().max_by(|a, b| a.cmp(b));
    let min = numbers.iter().min_by(|a, b| a.cmp(b));
    println!("最大值: {:?}, 最小值: {:?}", max, min);
    
    // 3.4 使用闭包实现自定义迭代器逻辑
    println!("\n3.4 自定义迭代器逻辑");
    println!("--------------------");
    
    // 使用 scan 进行状态累积
    let fibonacci: Vec<i32> = (0..10)
        .scan((0, 1), |state, _|
        {
            let (a, b) = *state;
            *state = (b, a + b);
            Some(a)
        })
        .collect();
    println!("斐波那契数列 (前10个): {:?}", fibonacci);
    
    // 使用 unfold (需要 itertools crate，这里用 scan 模拟)
    let powers_of_2: Vec<i32> = (0..8)
        .scan(1, |state, _|
        {
            let current = *state;
            *state *= 2;
            Some(current)
        })
        .collect();
    println!("2的幂 (前8个): {:?}", powers_of_2);
    
    // ========================
    // 第四部分：性能与最佳实践
    // ========================
    
    println!("\n【第四部分：性能与最佳实践】\n");
    
    println!("4.1 迭代器的惰性求值");
    println!("--------------------");
    println!("迭代器是惰性的，只有在调用消费适配器(如 collect, sum)时才会执行");
    
    let result: Vec<i32> = (0..1000)
        .map(|x|
        {
            // 这个闭包不会立即执行
            x * x
        })
        .filter(|x|
        {
            // 这个闭包也不会立即执行
            x % 2 == 0
        })
        .take(5)  // 这里开始执行，但只处理必要的元素
        .collect();
    println!("惰性求值结果: {:?}", result);
    
    println!("\n4.2 零成本抽象");
    println!("--------------");
    println!("Rust的迭代器在优化后与手写循环性能相当，甚至更好");
    println!("编译器会进行循环展开、向量化等优化\n");
    
    println!("4.3 最佳实践");
    println!("------------");
    println!("1. 优先使用迭代器而非手动循环");
    println!("2. 使用 iter() 避免不必要的所有权转移");
    println!("3. 链式调用时考虑可读性，适当换行");
    println!("4. 对于复杂逻辑，使用中间变量提高可读性");
    println!("5. 注意 collect 会分配内存，必要时使用 try_fold 等避免");
    
    // 示例：可读性对比
    println!("\n可读性示例:");
    let data = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    // 不好的写法
    let bad: Vec<i32> = data.iter().map(|x| x * 2).filter(|&x| x > 5).take(3).collect();
    println!("紧凑写法: {:?}", bad);
    
    // 好的写法
    let good: Vec<i32> = data
        .iter()
        .copied()
        .map(|x| x * 2)
        .filter(|x| *x > 5)
        .take(3)
        .collect();
    println!("清晰写法: {:?}", good);
    
    println!("\n=== 函数式编程学习完成 ===");
}

// ========================
// 辅助函数：展示闭包 trait 的使用
// ========================

// 接受 Fn trait 的函数
fn call_fn<F>(f: &F, arg: i32) -> i32
where
    F: Fn(i32) -> i32,
{
    f(arg)
}

// 接受 FnMut trait 的函数
fn call_fnmut<F>(f: &mut F, arg: i32) -> i32
where
    F: FnMut(i32) -> i32,
{
    f(arg)
}

// 接受 FnOnce trait 的函数
fn call_fnonce<F>(f: F)
where
    F: FnOnce(),
{
    f();
}

// 接受闭包作为参数的泛型函数
fn apply_to_each<F>(vec: &[i32], f: F) -> Vec<i32>
where
    F: Fn(i32) -> i32,
{
    vec.iter().map(|&x| f(x)).collect()
}

// 返回闭包的函数
fn make_multiplier(factor: i32) -> impl Fn(i32) -> i32
{
    move |x| x * factor
}

// ========================
// 进阶示例：实现自定义迭代器
// ========================

struct Counter
{
    count: u32,
    max: u32,
}

impl Counter
{
    fn new(max: u32) -> Counter
    {
        Counter { count: 0, max }
    }
}

impl Iterator for Counter
{
    type Item = u32;
    
    fn next(&mut self) -> Option<Self::Item>
    {
        if self.count < self.max
        {
            self.count += 1;
            Some(self.count)
        }
        else
        {
            None
        }
    }
}

// ========================
// 练习题（在 main 中调用）
// ========================

#[cfg(test)]
mod tests {
    #[test]
    fn test_closure_basic()
    {
        let add = |a, b| a + b;
        assert_eq!(add(2, 3), 5);
    }
    
    #[test]
    fn test_iterator_chain()
    {
        let result: Vec<i32> = (1..=10)
            .filter(|x| x % 2 == 0)
            .map(|x| x * x)
            .collect();
        assert_eq!(result, vec![4, 16, 36, 64, 100]);
    }
    
    #[test]
    fn test_custom_iterator()
    {
        let counter = super::Counter::new(5);
        let sum: u32 = counter.sum();
        assert_eq!(sum, 15); // 1+2+3+4+5
    }
}

```

**终端：**
```text
=== Rust函数式编程：闭包与迭代器 ===

【第一部分：闭包 Closures】

1.1 闭包基础语法
----------------
add(1, 2) = 3
计算: 3 * 4 = 12
multiply(3, 4) = 12

1.2 闭包捕获环境变量
--------------------
捕获外部变量: capture_closure(5) = 15
计数器: 1
计数器: 2
计数器: 3
最终 count = 3

1.3 闭包的三种捕获方式
----------------------
借用: hello
借用后 s 仍可用: hello
修改后: world!
修改后 s2: world!

1.4 闭包实现的 Trait
-------------------
Fn:     不可变借用环境，可多次调用
FnMut:  可变借用环境，可多次调用
FnOnce: 获取所有权，只能调用一次

FnMut 累加结果: 5
FnMut 累加结果: 15
获取所有权: takes ownership

1.5 闭包作为参数和返回值
------------------------
原数组: [1, 2, 3, 4, 5]
平方后: [1, 4, 9, 16, 25]
multiplier(4) = 12
multiplier(5) = 15

【第二部分：迭代器 Iterators】

2.1 迭代器基础
--------------
iter():
  值: 1
  值: 2
  值: 3

iter_mut():
  修改后: 2
  修改后: 4
  修改后: 6

into_iter():
  消费值: 1
  消费值: 2
  消费值: 3

2.2 Iterator Trait
------------------
手动调用 next():
  Some(1)
  Some(2)
  Some(3)
  None (结束)

2.3 消费适配器
--------------
sum: 15
product: 120
count: 5
doubled: [2, 4, 6, 8, 10]
fold (平方和): 55
any even: true, all positive: true

2.4 迭代器适配器
----------------
map (平方): [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
filter (偶数): [2, 4, 6, 8, 10]
filter_map (解析数字): [1, 3, 4]
enumerate: [(0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 6), (6, 7), (7, 8), (8, 9), (9, 10)]
take(3): [1, 2, 3], skip(3).take(3): [4, 5, 6]
zip: [("Alice", 85), ("Bob", 92), ("Carol", 78)]
chain: [1, 2, 3, 4, 5, 6]
rev: [5, 4, 3, 2, 1]
flatten: [1, 2, 3, 4, 5, 6]

2.5 复杂迭代器链示例
--------------------
年龄大于25岁的人: Bob, David, Eve
前3个偶数的平方和: 56

【第三部分：闭包与迭代器结合】

3.1 自定义排序与比较
--------------------
按年龄排序: [("Bob", 25), ("Alice", 30), ("Carol", 35)]
按名字长度排序: [("Bob", 25), ("Alice", 30), ("Carol", 35)]

3.2 分组与分区
--------------
偶数: [2, 4, 6, 8, 10], 奇数: [1, 3, 5, 7, 9]

3.3 查找操作
------------
第一个偶数: Some(8)
第一个大于5的位置: Some(3)
最大值: Some(12), 最小值: Some(1)

3.4 自定义迭代器逻辑
--------------------
斐波那契数列 (前10个): [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
2的幂 (前8个): [1, 2, 4, 8, 16, 32, 64, 128]

【第四部分：性能与最佳实践】

4.1 迭代器的惰性求值
--------------------
迭代器是惰性的，只有在调用消费适配器(如 collect, sum)时才会执行
惰性求值结果: [0, 4, 16, 36, 64]

4.2 零成本抽象
--------------
Rust的迭代器在优化后与手写循环性能相当，甚至更好
编译器会进行循环展开、向量化等优化

4.3 最佳实践
------------
1. 优先使用迭代器而非手动循环
2. 使用 iter() 避免不必要的所有权转移
3. 链式调用时考虑可读性，适当换行
4. 对于复杂逻辑，使用中间变量提高可读性
5. 注意 collect 会分配内存，必要时使用 try_fold 等避免

可读性示例:
紧凑写法: [6, 8, 10]
清晰写法: [6, 8, 10]

=== 函数式编程学习完成 ===
```

## **Next**

### Rust 基础架构方向学习路线图

> 目标：掌握 Rust 系统编程能力，能够从事 C/C++/Rust 基础架构开发

---

### 已掌握的基础内容 ✅

| 序号 | 文件 | 内容 | 重要性 |
|------|------|------|--------|
| 01 | 01_variables_and_types.rs | 变量与类型 | ⭐⭐⭐ |
| 02 | 02_functions.rs | 函数 | ⭐⭐⭐ |
| 03 | 03_control_flow.rs | 控制流 | ⭐⭐⭐ |
| 04 | 04_ownership.rs | 所有权系统 | ⭐⭐⭐⭐⭐ |
| 05 | 05_structs.rs | 结构体 | ⭐⭐⭐⭐ |
| 06 | 06_enums_and_pattern_matching.rs | 枚举与模式匹配 | ⭐⭐⭐⭐ |
| 07 | 07_common_collections.rs | 常用集合 | ⭐⭐⭐⭐ |
| 08 | 08_packages_and_modules.rs | 包与模块 | ⭐⭐⭐ |
| 09 | 09_error_handling.rs | 错误处理 | ⭐⭐⭐⭐ |
| 10 | 10_generics.rs | 泛型 | ⭐⭐⭐⭐ |
| 11 | 11_traits.rs | 特征（Trait）| ⭐⭐⭐⭐⭐ |
| 12 | 12_lifetimes.rs | 生命周期 | ⭐⭐⭐⭐⭐ |
| 13 | 13_closures_and_iterators.rs | 闭包与迭代器 | ⭐⭐⭐⭐ |

---

### 待学习内容 📚

### 阶段一：核心进阶（必须掌握）

#### 14. 智能指针 ⭐⭐⭐⭐⭐
**基础架构开发的核心，内存管理的进阶**

- **Box<T>** - 堆分配智能指针
  - 在堆上存储数据
  - 递归类型（如链表、树）
  - trait 对象的动态分发
  
- **Rc<T>** - 单线程引用计数
  - 共享所有权场景
  - 不可变共享数据
  - 循环引用问题
  
- **Arc<T>** - 多线程原子引用计数
  - 线程间共享数据
  - 与 Mutex/RwLock 配合
  
- **RefCell<T>** - 运行时借用检查
  - 内部可变性模式
  - 单线程运行时借用
  
- **Mutex<T> / RwLock<T>** - 线程安全内部可变性
  - 跨线程共享可变状态
  - 死锁避免策略
  
- **Weak<T>** - 弱引用
  - 打破循环引用
  - 树/图结构中的父节点引用

**实践项目**：实现一个线程安全的对象池

---

#### 15. 并发编程 ⭐⭐⭐⭐⭐
**基础架构必备，高性能系统的核心能力**

- **线程基础**
  - `std::thread::spawn`
  - `join` 等待线程完成
  - 线程局部存储 `thread_local!`
  
- **消息传递（Channel）**
  - `mpsc` 多生产者单消费者
  - `Sender` / `Receiver`
  - 同步 vs 异步通道
  - 跨线程数据传递的最佳实践
  
- **共享状态并发**
  - `Mutex` - 互斥锁
  - `RwLock` - 读写锁
  - `Condvar` - 条件变量
  - 锁的粒度与性能
  
- **Send 和 Sync Trait**
  - `Send`：跨线程转移所有权
  - `Sync`：跨线程共享引用
  - 自定义类型的实现
  - `PhantomData` 标记
  
- **原子类型**
  - `AtomicUsize`、`AtomicBool` 等
  - 内存顺序（Memory Ordering）
  - 无锁数据结构基础
  - CAS 操作（Compare-And-Swap）
  
- **线程池**
  - 工作窃取算法
  - `rayon` 数据并行库
  - 自定义线程池实现

**实践项目**：实现一个高性能的 HTTP 服务器

---

#### 16. Unsafe Rust ⭐⭐⭐⭐
**与 C/C++ 交互、底层优化的必备技能**

- **Unsafe 基础**
  - `unsafe` 代码块
  - `unsafe` 函数
  - `unsafe` trait
  
- **原始指针（Raw Pointers）**
  - `*const T` 和 `*mut T`
  - 与引用的区别
  - 解引用原始指针
  - 空指针和野指针处理
  
- **FFI（外部函数接口）**
  - `extern` 关键字
  - 调用 C 函数
  - 被 C 调用（`#[no_mangle]`、`pub extern "C"`）
  - 类型转换（`c_char`、`c_int` 等）
  
- **C 集成实战**
  - `bindgen` 自动生成绑定
  - `cc` crate 编译 C 代码
  - 构建脚本 `build.rs`
  - 链接静态/动态库
  
- **内存布局控制**
  - `std::alloc` 自定义分配器
  - 内存对齐 (`align_of`、`size_of`)
  - `MaybeUninit` 未初始化内存
  
- **Unsafe 最佳实践**
  - 安全抽象层设计
  - 不变量维护
  - Miri 检测未定义行为

**实践项目**：封装一个 C 库（如 SQLite 或 Redis 客户端）

---

### 阶段二：现代系统编程

#### 17. 异步编程 ⭐⭐⭐⭐
**现代高性能 IO 密集型系统的标准范式**

- **Future 基础**
  - `Future` trait 原理
  - `async` / `await` 语法糖
  - `Pin` 和自引用结构
  
- **Tokio 运行时**
  - 异步运行时概念
  - `tokio::main` 宏
  - `spawn` 创建异步任务
  - 任务调度与执行
  
- **异步 IO**
  - 异步文件操作
  - 异步网络编程（TCP/UDP）
  - 超时与取消
  
- **并发原语**
  - `Mutex`、`RwLock` 的异步版本
  - `Semaphore` 信号量
  - `Channel` 异步通道
  
- **Stream 处理**
  - `Stream` trait
  - 异步迭代器
  - 背压控制
  
- **Select 与并发**
  - `tokio::select!`
  - 多路复用
  - 竞赛条件处理

**实践项目**：实现一个异步 HTTP 客户端/服务器

---

#### 18. 宏编程 ⭐⭐⭐
**提高代码复用性，DSL 开发能力**

- **声明宏（Declarative Macros）**
  - `macro_rules!` 语法
  - 模式匹配与重复
  - 递归宏
  - 卫生宏（Hygienic Macros）
  
- **过程宏（Procedural Macros）**
  - 自定义派生宏 `#[derive(...)]`
  - 属性宏 `#[...]`
  - 函数式宏 `...!()`
  - `syn` 和 `quote` crate
  
- **实用场景**
  - 日志宏（类似 `println!`）
  - 测试宏
  - 序列化/反序列化
  - DSL 领域特定语言

**实践项目**：实现一个自定义的 `derive` 宏

---

### 阶段三：性能与底层优化

#### 19. 内存布局与优化 ⭐⭐⭐⭐⭐
**基础架构性能关键，零成本抽象的精髓**

- **内存布局**
  - 结构体内存对齐
  - `#[repr(C)]` - C 兼容布局
  - `#[repr(packed)]` - 紧凑布局
  - `#[repr(align(n))]` - 自定义对齐
  
- **零成本抽象**
  - 迭代器优化
  - 泛型单态化
  - 内联优化
  
- **SIMD 向量化**
  - `std::simd` (nightly)
  - `packed_simd` crate
  - 自动向量化技巧
  
- **缓存优化**
  - 缓存行（Cache Line）
  - 伪共享（False Sharing）
  - 数据局部性
  
- **内存屏障**
  - `std::sync::atomic::fence`
  - 内存顺序详解
  - Release-Acquire 语义
  - Sequential Consistency

**实践项目**：实现一个高性能的 Ring Buffer

---

#### 20. 测试与文档 ⭐⭐⭐
**工程化能力，代码质量保证**

- **单元测试**
  - `#[test]` 属性
  - `assert!` 系列宏
  - 测试模块组织
  
- **集成测试**
  - `tests/` 目录
  - 测试私有函数
  - 测试夹具（Fixtures）
  
- **文档测试**
  - `///` 文档注释中的代码块
  - `cargo test --doc`
  
- **基准测试**
  - `criterion` crate
  - 性能回归检测
  - 统计显著性
  
- **代码覆盖率**
  - `tarpaulin` 或 `cargo-llvm-cov`
  - CI 集成
  
- **持续集成**
  - GitHub Actions
  - `rustfmt` 格式化检查
  - `clippy` 静态分析
  - `cargo deny` 安全检查

**实践项目**：为一个库编写完整的测试套件

---

### 阶段四：专业领域深入

#### 21. 网络编程 ⭐⭐⭐⭐
**分布式系统基础**

- **TCP/UDP 编程**
  - `std::net` 基础
  - `tokio::net` 异步版本
  - 连接池管理
  
- **HTTP 协议**
  - `hyper` 库
  - `axum` / `actix-web` 框架
  - 中间件设计
  
- **序列化**
  - `serde` 生态
  - JSON / MessagePack / Protobuf
  - 零拷贝序列化
  
- **gRPC**
  - `tonic` 框架
  - Protocol Buffers
  - 流式 RPC

---

#### 22. 数据库与存储 ⭐⭐⭐⭐
**数据持久化能力**

- **SQL 数据库**
  - `sqlx` - 异步 SQL
  - `diesel` - ORM
  - 连接池管理
  
- **NoSQL**
  - Redis 客户端
  - MongoDB 驱动
  
- **嵌入式数据库**
  - `sled` - 纯 Rust KV 存储
  - `rocksdb` 绑定
  
- **存储引擎原理**
  - LSM-Tree
  - B-Tree
  - 日志结构存储

---

#### 23. 系统编程 ⭐⭐⭐⭐⭐
**操作系统级别的编程**

- **文件系统**
  - `std::fs` 高级 API
  - 异步文件 IO (`tokio::fs`)
  - 内存映射文件 `memmap2`
  
- **进程管理**
  - 进程创建与控制
  - 进程间通信（IPC）
  - 信号处理
  
- **系统调用**
  - `libc` crate
  - `nix` - 类 Unix 系统接口
  - Windows API 绑定
  
- **内核模块**（进阶）
  - Rust for Linux
  - 内核模块开发

---

### 阶段五：实战项目

#### 推荐项目列表

| 难度 | 项目 | 涉及知识点 |
|------|------|-----------|
| ⭐⭐ | 命令行工具（如 `grep` 克隆）| 文件 IO、正则表达式、错误处理 |
| ⭐⭐⭐ | HTTP 服务器 | 网络编程、并发、异步 |
| ⭐⭐⭐ | 键值存储（KV Store）| 数据结构、持久化、并发控制 |
| ⭐⭐⭐⭐ | 代理服务器 | 网络编程、协议解析、性能优化 |
| ⭐⭐⭐⭐ | 数据库连接池 | 智能指针、并发、资源管理 |
| ⭐⭐⭐⭐⭐ | 分布式 KV 存储 | 网络、存储、一致性协议 |
| ⭐⭐⭐⭐⭐ | 嵌入式系统项目 | Unsafe、FFI、内存管理 |

---


### 学习资源
- **官方文档**：The Rust Programming Language（TRPL）
- **进阶书籍**：Programming Rust、Rust for Rustaceans
- **在线资源**：Rust by Example、Rustlings
- **实践平台**：LeetCode、Exercism Rust Track
- **开源贡献**：参与 Tokio、Rust 标准库等开源项目

### 与 C/C++ 的对比学习
| 概念 | C/C++ | Rust |
|------|-------|------|
| 内存管理 | 手动 malloc/free | 所有权系统 |
| 并发安全 | 程序员责任 | 编译期保证 (Send/Sync) |
| 泛型 | 模板 / 宏 | Trait + 单态化 |
| 错误处理 | 返回值/异常 | Result/Option |
| 指针 | 原始指针 | 智能指针 + 原始指针 |
| 宏 | 文本替换 | 卫生宏 + 过程宏 |

---