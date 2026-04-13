---
title: "黑马01 基础概念"
date: 2026-04-13T12:00:00+08:00
tags: ["网络","协议","概念","TCP/IP","Linux","OSI"]
categories: ["Linux网络"]
series: ["Linux网络"]
weight: 1
---

> 从今天（26.04.13）开始，进军 `Linux网络编程` ，目前打算是跟着阿b上 `"黑马"` 的课和游双的 `《Linux高性能服务器编程》` 学习，希望在大二之前可以再学习下 `OS` 然后搞搞 `dpdk`。来呲狗哦！

1.1
协议（Protocol）：协议可以理解为数据传输和数据解释的规则。简单理解为各个主机之间通信所使用的共同语言。


举一个这样的例子，A、B机器要发送文件：

```mermaid
flowchart LR
    subgraph A["A机器"]
        direction TB
        a1[第一次]
        a2[第二次]
        a3[第三次]
    end
    
    subgraph B["B机器"]
        direction TB
        b1[第一次]
        b2[第二次]
        b3[第三次]
    end
    
    a1 -->|"文件名"| b1
    b1 -->|"OK"| a1
    
    a2 -->|"文件大小"| b2
    b2 -->|"OK"| a2
    
    a3 -->|"文件内容"| b3
    b3 -->|"OK"| a3
    
    style A fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style B fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style a1 fill:#fff0f5,stroke:#f472b6,stroke-width:1px
    style a2 fill:#fff0f5,stroke:#f472b6,stroke-width:1px
    style a3 fill:#fff0f5,stroke:#f472b6,stroke-width:1px
    style b1 fill:#fff0f5,stroke:#f472b6,stroke-width:1px
    style b2 fill:#fff0f5,stroke:#f472b6,stroke-width:1px
    style b3 fill:#fff0f5,stroke:#f472b6,stroke-width:1px
```

从A上传文件到服务器B，需要在A和B之间制定一个双方都认可的规则，就称为文件传输协议，该协议是ftp协议的一个初级版本，后续优化形成了ftp协议。

典型协议：
传输层：TCP/UDP
应用层：HTTP、FTP
网络层：IP、ICMP、IGMP
网络接口层：ARP、RARP

TCP 传输协议控制 (Transmission Control Protocol)：是一种面向连接的、可靠的、基于字节流的传输层通信协议。

UDP 用户数据报协议 (User Datagram Protocol)：是 OSI 参考模型中一种无连接的传输层协议，提供面向事务的简单不可靠的信息传送服务。

HTTP 超文本传输协议 (HyperText Transfer Protocol)：是一种基于 TCP 协议的应用层协议，用于在 Web 浏览器和 Web 服务器之间传输超文本文档。

FTP 文件传输协议 (File Transfer Protocol)：是一种基于 TCP 协议的应用层协议，用于在客户端和服务器之间传输文件。

IP 协议 (Internet Protocol)：是一种用于在互联网上传输数据的网络层协议，提供无连接的服务。

ICMP 协议是 Internet 控制报文协议 (Internet Control Message Protocol)：它是 TCP/IP 协议族的一个子协议，用于在 IP 主机、路由器之间传递控制信息。

IGMP 协议是 Internet 组管理协议 (Internet Group Management Protocol)：是因特网协议家族中的一个组播协议，用于多播通信的网络层协议，该协议运行在主机和组播路由器之间。

ARP 协议是正向地址解析协议 (Address Resolution Protocol)：是一种用于将 IP 地址转换为物理地址的网络接口层协议，用于在局域网内解析主机地址。通过已知的 IP 寻找对应主机的 MAC 地址。

RARP 协议是反向地址解析协议 (Reverse Address Resolution Protocol)：是一种用于将物理地址转换为 IP 地址的网络接口层协议，用于在局域网内解析主机 地址的反向映射。通过 MAC 地址确定 IP 地址。

1.2
OSI (Open Systems Interconnection)：开放系统互联模型，是一种用于描述计算机网络的参考模型，是设计和描述计算机网络通信的基本框架。

网络分层 OSI 7层模型：物数网传会表应

1、物理层 -- 双绞线，光纤（传输介质），将模拟信号（高/低电平）转换为数字信号（1/0）。（调制解调器modemn，模数转换和数模转换。）

2、数据链路层 -- 数据校验，定义了网络传输的基本单位 - 帧（网络报文格式）。

3、网络层 -- 定义网络，两台机器之间传输的路径选择，点到点的传输。（比如A -> B -> C,A -> B 就是节点 A 到节点 B。）（IP协议 -- 路由器。）

4、传输层 -- 传输数据 TCP，UDP，端到端的传输。（比如A -> B -> C,A -> C 就是 A 端到 C 端，A 和 C 是两端。）（我们编程主要站在传输层的协议上。）

5、会话层 -- 通过传输层建立数据传输的通道。建立会话、保持会话。（直接感知不到，是内核帮忙实现的）

6、表示层 -- 编解码，翻译工作。

7、应用层 -- 应用程序，比如：email服务、ftp服务、ssh服务、http服务等。（使用、开发。）

OSI 7层模型与 TCP/IP 4层模型（真正使用）的对应关系：

```mermaid
flowchart TB
    subgraph OSI["OSI 参考模型（7层）"]
        direction TB
        o7[7. 应用层]
        o6[6. 表示层]
        o5[5. 会话层]
        o4[4. 传输层]
        o3[3. 网络层]
        o2[2. 数据链路层]
        o1[1. 物理层]
    end
    
    subgraph TCPIP["TCP/IP 模型（4层）"]
        direction TB
        t4[4. 应用层]
        t3[3. 传输层]
        t2[2. 网络层]
        t1[1. 网络接口层]
    end
    
    %% 对应关系连线
    o7 -.->|对应| t4
    o6 -.->|对应| t4
    o5 -.->|对应| t4
    o4 -.->|对应| t3
    o3 -.->|对应| t2
    o2 -.->|对应| t1
    o1 -.->|对应| t1
    
    %% OSI层样式 - 粉色渐变
    style o7 fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style o6 fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style o5 fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style o4 fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style o3 fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style o2 fill:#f48fb1,stroke:#be185d,stroke-width:2px,color:#333
    style o1 fill:#f48fb1,stroke:#be185d,stroke-width:2px,color:#333
    
    %% TCP/IP层样式 - 紫色系
    style t4 fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px,color:#333
    style t3 fill:#e1bee7,stroke:#8e24aa,stroke-width:2px,color:#333
    style t2 fill:#ce93d8,stroke:#7b1fa2,stroke-width:2px,color:#333
    style t1 fill:#ba68c8,stroke:#6a1b9a,stroke-width:2px,color:#fff
    
    %% 子图样式
    style OSI fill:#fff5f7,stroke:#ec4899,stroke-width:2px
    style TCPIP fill:#faf5fb,stroke:#9c27b0,stroke-width:2px
```

1.3
数据的流向（从PC机A到PC机B）：

```mermaid
flowchart TB
    subgraph Network["🌐 网络传输总览"]
        direction LR
        PCA["🖥️ PC机A"] -->|发送| Router1["📡 路由器"]
        Router1 -->|路由| Cloud["☁️ 互联网"]
        Cloud -->|路由| Router2["📡 路由器"]
        Router2 -->|接收| PCB["🖥️ PC机B"]
    end
    
    subgraph Process["数据处理流程"]
        direction LR
        
        subgraph Encapsulation["📦 发送方：数据封装"]
            direction TB
            E1["应用层<br/>原始数据"]
            E2["传输层<br/>+ TCP/UDP头部"]
            E3["网络层<br/>+ IP头部"]
            E4["链路层<br/>+ MAC头部"]
            
            E1 --> E2 --> E3 --> E4
        end
        
        subgraph Transmit["📤 数据传输"]
            direction TB
            T["数据帧<br/>通过物理介质传输"]
        end
        
        subgraph Decapsulation["📭 接收方：数据解封装"]
            direction TB
            D4["链路层<br/>去除MAC头部"]
            D3["网络层<br/>去除IP头部"]
            D2["传输层<br/>去除TCP/UDP头部"]
            D1["应用层<br/>原始数据"]
            
            D4 --> D3 --> D2 --> D1
        end
        
        Encapsulation --> Transmit --> Decapsulation
    end
    
    %% 连接网络传输和数据处理
    PCA -.->|封装| Encapsulation
    Decapsulation -.->|解封装| PCB
    
    %% 样式定义 - 网络设备
    style PCA fill:#fce4ec,stroke:#ec4899,stroke-width:3px,color:#333
    style PCB fill:#fce4ec,stroke:#ec4899,stroke-width:3px,color:#333
    style Router1 fill:#e1bee7,stroke:#9c27b0,stroke-width:2px,color:#333
    style Router2 fill:#e1bee7,stroke:#9c27b0,stroke-width:2px,color:#333
    style Cloud fill:#f3e5f5,stroke:#ba68c8,stroke-width:2px,color:#333
    
    %% 封装层样式 - 从浅到深
    style E1 fill:#fff0f5,stroke:#f472b6,stroke-width:2px,color:#333
    style E2 fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style E3 fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style E4 fill:#f48fb1,stroke:#be185d,stroke-width:2px,color:#fff
    
    %% 传输样式
    style T fill:#e1bee7,stroke:#9c27b0,stroke-width:2px,color:#333
    
    %% 解封装层样式 - 从深到浅
    style D4 fill:#f48fb1,stroke:#be185d,stroke-width:2px,color:#fff
    style D3 fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style D2 fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style D1 fill:#fff0f5,stroke:#f472b6,stroke-width:2px,color:#333
    
    %% 子图样式
    style Network fill:#faf5fb,stroke:#9c27b0,stroke-width:3px
    style Process fill:#fff5f7,stroke:#ec4899,stroke-width:2px
    style Encapsulation fill:#fff0f5,stroke:#f472b6,stroke-width:2px
    style Transmit fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    style Decapsulation fill:#fce4ec,stroke:#ec4899,stroke-width:2px
```

**数据封装过程（从上到下）**：
- 应用层：原始数据
- 传输层：添加 TCP/UDP 头部
- 网络层：添加 IP 头部
- 链路层：添加 MAC 头部和尾部

**数据解封装过程（从下到上）**：
- 链路层：去除 MAC 头部和尾部
- 网络层：去除 IP 头部
- 传输层：去除 TCP/UDP 头部
- 应用层：得到原始数据
