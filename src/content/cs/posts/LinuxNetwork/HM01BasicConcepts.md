---
title: "黑马01 Linux网络基础概念"
date: 2026-04-13T12:00:00+08:00
tags: ["网络", "协议", "概念", "TCP" , "IP", "Linux", "OSI","帧","报文"]
categories: ["Linux网络"]
series: ["Linux网络"]
weight: 1
---

> 从今天（26.04.13）开始，进军 `Linux网络编程`，目前打算是跟着阿b上 **"黑马"** 的课和游双的《Linux高性能服务器编程》学习，希望在大二之前可以再学习下 `OS` 然后搞搞 `dpdk`。来呲狗哦！（到时候找老师要一个有网卡的服务器，或者先在VM上玩吧~）

---

# 1 基础概念

## 1.1 协议（Protocol）

协议可以理解为**数据传输和数据解释的规则**。简单理解为各个主机之间通信所使用的共同语言。

### 文件传输示例

举一个这样的例子，A、B 机器要发送文件：

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

从 A 上传文件到服务器 B，需要在 A 和 B 之间制定一个双方都认可的规则，就称为**文件传输协议**，该协议是 FTP 协议的一个初级版本，后续优化形成了 FTP 协议。

### 典型协议

| 层级 | 协议 |
|:---:|:---|
| **传输层** | TCP / UDP |
| **应用层** | HTTP、FTP |
| **网络层** | IP、ICMP、IGMP |
| **网络接口层** | ARP、RARP |

### 协议详解

- **TCP**（Transmission Control Protocol，传输协议控制）：是一种面向连接的、可靠的、基于字节流的传输层通信协议。

- **UDP**（User Datagram Protocol，用户数据报协议）：是 OSI 参考模型中一种无连接的传输层协议，提供面向事务的简单不可靠的信息传送服务。

- **HTTP**（HyperText Transfer Protocol，超文本传输协议）：是一种基于 TCP 协议的应用层协议，用于在 Web 浏览器和 Web 服务器之间传输超文本文档。

- **FTP**（File Transfer Protocol，文件传输协议）：是一种基于 TCP 协议的应用层协议，用于在客户端和服务器之间传输文件。

- **IP**（Internet Protocol）：是一种用于在互联网上传输数据的网络层协议，提供无连接的服务。

- **ICMP**（Internet Control Message Protocol，Internet 控制报文协议）：它是 TCP/IP 协议族的一个子协议，用于在 IP 主机、路由器之间传递控制信息。

- **IGMP**（Internet Group Management Protocol，Internet 组管理协议）：是因特网协议家族中的一个组播协议，用于多播通信的网络层协议，该协议运行在主机和组播路由器之间。

- **ARP**（Address Resolution Protocol，正向地址解析协议）：是一种用于将 IP 地址转换为物理地址的网络接口层协议，用于在局域网内解析主机地址。通过已知的 IP 寻找对应主机的 MAC 地址。

- **RARP**（Reverse Address Resolution Protocol，反向地址解析协议）：是一种用于将物理地址转换为 IP 地址的网络接口层协议，用于在局域网内解析主机地址的反向映射。通过 MAC 地址确定 IP 地址。

---

## 1.2 OSI 参考模型

**OSI**（Open Systems Interconnection，开放系统互联模型）是一种用于描述计算机网络的参考模型，是设计和描述计算机网络通信的基本框架。

### 网络分层 OSI 7层模型

> 口诀：**物数网传会表应**

| 层级 | 名称 | 功能描述 |
|:---:|:---|:---|
| 7 | **应用层** | 应用程序，如 email、FTP、SSH、HTTP 等 |
| 6 | **表示层** | 编解码、翻译工作 |
| 5 | **会话层** | 建立数据传输通道，建立/保持会话 |
| 4 | **传输层** | 传输数据（TCP/UDP），端到端传输 |
| 3 | **网络层** | 定义网络、路径选择，点到点传输 |
| 2 | **数据链路层** | 数据校验，定义传输基本单位 - 帧 |
| 1 | **物理层** | 双绞线、光纤等传输介质，模数/数模转换 |

### 各层详解

1. **物理层**：双绞线、光纤（传输介质），将模拟信号（高/低电平）转换为数字信号（1/0）。调制解调器（modem）负责模数转换和数模转换。

2. **数据链路层**：数据校验，定义了网络传输的基本单位 - **帧**（网络报文格式）。

3. **网络层**：定义网络，两台机器之间传输的路径选择，点到点的传输。例如：A → B → C，A → B 就是节点 A 到节点 B。IP 协议工作在这一层，路由器是该层设备。

4. **传输层**：传输数据 TCP、UDP，端到端的传输。例如：A → B → C，A → C 就是 A 端到 C 端，A 和 C 是两端。**我们编程主要站在传输层的协议上。**

5. **会话层**：通过传输层建立数据传输的通道，建立会话、保持会话。直接感知不到，是内核帮忙实现的。

6. **表示层**：编解码、翻译工作。

7. **应用层**：应用程序，如 email 服务、FTP 服务、SSH 服务、HTTP 服务等。

### OSI 7层 vs TCP/IP 4层

```mermaid
flowchart LR
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

    %% OSI层样式
    style o7 fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style o6 fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style o5 fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style o4 fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style o3 fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style o2 fill:#f48fb1,stroke:#be185d,stroke-width:2px,color:#333
    style o1 fill:#f48fb1,stroke:#be185d,stroke-width:2px,color:#333

    %% TCP/IP层样式
    style t4 fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px,color:#333
    style t3 fill:#e1bee7,stroke:#8e24aa,stroke-width:2px,color:#333
    style t2 fill:#ce93d8,stroke:#7b1fa2,stroke-width:2px,color:#333
    style t1 fill:#ba68c8,stroke:#6a1b9a,stroke-width:2px,color:#fff

    %% 子图样式
    style OSI fill:#fff5f7,stroke:#ec4899,stroke-width:2px
    style TCPIP fill:#faf5fb,stroke:#9c27b0,stroke-width:2px
```

---

## 1.3 数据的流向

从 PC 机 A 到 PC 机 B 的数据传输流程：

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

    %% 连接
    PCA -.->|封装| Encapsulation
    Decapsulation -.->|解封装| PCB

    %% 样式定义
    style PCA fill:#fce4ec,stroke:#ec4899,stroke-width:3px,color:#333
    style PCB fill:#fce4ec,stroke:#ec4899,stroke-width:3px,color:#333
    style Router1 fill:#e1bee7,stroke:#9c27b0,stroke-width:2px,color:#333
    style Router2 fill:#e1bee7,stroke:#9c27b0,stroke-width:2px,color:#333
    style Cloud fill:#f3e5f5,stroke:#ba68c8,stroke-width:2px,color:#333

    style E1 fill:#fff0f5,stroke:#f472b6,stroke-width:2px,color:#333
    style E2 fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style E3 fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style E4 fill:#f48fb1,stroke:#be185d,stroke-width:2px,color:#fff

    style T fill:#e1bee7,stroke:#9c27b0,stroke-width:2px,color:#333

    style D4 fill:#f48fb1,stroke:#be185d,stroke-width:2px,color:#fff
    style D3 fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style D2 fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style D1 fill:#fff0f5,stroke:#f472b6,stroke-width:2px,color:#333

    style Network fill:#faf5fb,stroke:#9c27b0,stroke-width:3px
    style Process fill:#fff5f7,stroke:#ec4899,stroke-width:2px
    style Encapsulation fill:#fff0f5,stroke:#f472b6,stroke-width:2px
    style Transmit fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    style Decapsulation fill:#fce4ec,stroke:#ec4899,stroke-width:2px
```

### 数据封装过程（从上到下）

| 层级 | 操作 |
|:---|:---|
| 应用层 | 原始数据 |
| 传输层 | 添加 TCP/UDP 头部 |
| 网络层 | 添加 IP 头部 |
| 链路层 | 添加 MAC 头部和尾部 |

### 数据解封装过程（从下到上）

| 层级 | 操作 |
|:---|:---|
| 链路层 | 去除 MAC 头部和尾部 |
| 网络层 | 去除 IP 头部 |
| 传输层 | 去除 TCP/UDP 头部 |
| 应用层 | 得到原始数据 |

---

## 1.4 网络应用程序设计模式

### C/S 模式

**客户端（Client）/ 服务器（Server）** 模式，需要在通讯两端各自部署客户机和服务器来完成数据通信。

**优点**：
- 可以安装在本地
- 可以缓存数据
- 协议的选择灵活

**缺点**：
- 客户端工具需要程序员开发，开发周期长、工作量大
- 需要本地安装，对客户电脑安全有一定影响

### B/S 模式

**浏览器（Browser） / Web 服务器（Server）** 模式，只需要在一端部署服务器，浏览器作为客户端即可完成数据的传输。

**优点**：
- 浏览器不用开发，开发周期短、工作量小

**缺点**：
- 只能选择 HTTP 协议
- 不能缓存数据，效率受影响

---

## 1.5 以太网帧格式

以太网帧格式是包装在网络接口层（数据链路层）的协议。

```mermaid
flowchart LR
    subgraph EthernetFrame["以太网帧格式 (RFC 894)"]
        direction LR
        DA["目的地址<br/>6字节"]
        SA["源地址<br/>6字节"]
        Type["类型<br/>2字节"]
        Data["数据<br/>46~1500字节"]
        CRC["CRC<br/>4字节"]

        DA --> SA --> Type --> Data --> CRC
    end

    subgraph IPPacket["类型 0x0800: IP数据报"]
        direction LR
        IPType["类型<br/>0800"]
        IPData["IP数据报<br/>46~1500字节"]

        IPType --> IPData
    end

    subgraph ARPPacket["类型 0x0806: ARP请求/应答"]
        direction LR
        ARPType["类型<br/>0806"]
        ARPData["ARP请求/应答<br/>28字节"]
        ARPPad["PAD填充<br/>18字节"]

        ARPType --> ARPData --> ARPPad
    end

    subgraph RARPPacket["类型 0x8035: RARP请求/应答"]
        direction LR
        RARPType["类型<br/>8035"]
        RARPData["RARP请求/应答<br/>28字节"]
        RARPPad["PAD填充<br/>18字节"]

        RARPType --> RARPData --> RARPPad
    end

    %% 样式定义
    style DA fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style SA fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style Type fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style Data fill:#f48fb1,stroke:#be185d,stroke-width:2px,color:#fff
    style CRC fill:#e1bee7,stroke:#9c27b0,stroke-width:2px,color:#333

    style IPType fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style IPData fill:#f48fb1,stroke:#be185d,stroke-width:2px,color:#fff

    style ARPType fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style ARPData fill:#ce93d8,stroke:#7b1fa2,stroke-width:2px,color:#333
    style ARPPad fill:#e1bee7,stroke:#9c27b0,stroke-width:2px,color:#333

    style RARPType fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style RARPData fill:#ba68c8,stroke:#6a1b9a,stroke-width:2px,color:#fff
    style RARPPad fill:#e1bee7,stroke:#9c27b0,stroke-width:2px,color:#333

    style EthernetFrame fill:#fff5f7,stroke:#ec4899,stroke-width:3px
    style IPPacket fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    style ARPPacket fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    style RARPPacket fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
```

### 以太网帧字段说明

| 字段 | 长度 | 说明 |
|:---|:---:|:---|
| **目的地址** | 6 字节 | MAC（Media Access Control，硬件/物理）地址。例如：`00:0a:02:1b:03:0c`，每个字节之间用冒号隔开 |
| **源地址** | 6 字节 | 发送主机的 MAC 地址 |
| **类型** | 2 字节 | 例如：`0800` 是 4 个 16 进制数，即 2 个字节 |
| **数据** | 46~1500 字节 | `0800` 类型是 IP 数据报；`0806` 类型是 ARP 请求/应答（28 字节 + 18 字节 PAD 填充）；`8035` 类型是 RARP 请求/应答 |
| **CRC** | 4 字节 | 循环冗余检验（Cyclic Redundancy Check），帧检验序列 FCS，用于检测数据传输中的误码 |

> **注意**：MAC 地址示例 `00:0a:02:1b:03:0c` 中，`1b` = 16 × 1 + 11 = 27

---

## 1.6 ARP 协议

**ARP**（Address Resolution Protocol，地址解析协议）通过对方的 IP 地址获得 MAC 地址。

### ARP 通信场景

```mermaid
flowchart TB
    subgraph Scene["ARP通信场景"]
        direction LR

        subgraph Source["源主机"]
            PCA["PC机A<br/>IP: 192.168.10.143<br/>MAC: 00:0c:29:7f:37:1b"]
        end

        Cloud["☁️ 局域网"]

        subgraph Target["目的主机"]
            PCB["PC机B<br/>IP: 192.168.10.149<br/>MAC: 00:0c:29:7f:37:3f"]
        end

        PCA <-->|ARP请求/应答| Cloud <-->|广播/单播| PCB
    end

    style PCA fill:#fce4ec,stroke:#ec4899,stroke-width:3px,color:#333
    style PCB fill:#e1bee7,stroke:#9c27b0,stroke-width:3px,color:#333
    style Cloud fill:#f3e5f5,stroke:#ba68c8,stroke-width:2px,color:#333
    style Source fill:#fff5f7,stroke:#ec4899,stroke-width:2px
    style Target fill:#faf5fb,stroke:#9c27b0,stroke-width:2px
    style Scene fill:#ffffff,stroke:#ec4899,stroke-width:3px
```

### ARP 数据报格式

```mermaid
flowchart LR
    subgraph ARPHeader["ARP数据报格式（28字节）"]
        direction LR

        ETH["以太网首部<br/>14字节"]
        ARP["ARP数据报<br/>28字节"]

        ETH --> ARP
    end

    subgraph ARPDetail["ARP数据报详细结构"]
        direction LR

        HT["硬件类型<br/>2字节<br/>0001"]
        PT["协议类型<br/>2字节<br/>0800"]
        HL["硬件地址<br/>长度<br/>1字节<br/>06"]
        PL["协议地址<br/>长度<br/>1字节<br/>04"]
        OP["操作码<br/>2字节<br/>0001/0002"]
        SMAC["发送端<br/>MAC地址<br/>6字节"]
        SIP["发送端<br/>IP地址<br/>4字节"]
        DMAC["目的<br/>MAC地址<br/>6字节"]
        DIP["目的<br/>IP地址<br/>4字节"]

        HT --> PT --> HL --> PL --> OP --> SMAC --> SIP --> DMAC --> DIP
    end

    style HT fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style PT fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style HL fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style PL fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style OP fill:#f48fb1,stroke:#be185d,stroke-width:2px,color:#fff
    style SMAC fill:#e1bee7,stroke:#9c27b0,stroke-width:2px,color:#333
    style SIP fill:#e1bee7,stroke:#9c27b0,stroke-width:2px,color:#333
    style DMAC fill:#ce93d8,stroke:#7b1fa2,stroke-width:2px,color:#333
    style DIP fill:#ce93d8,stroke:#7b1fa2,stroke-width:2px,color:#333
    style ETH fill:#fff0f5,stroke:#f472b6,stroke-width:2px,color:#333
    style ARP fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px,color:#333
    style ARPHeader fill:#fff5f7,stroke:#ec4899,stroke-width:2px
    style ARPDetail fill:#faf5fb,stroke:#9c27b0,stroke-width:2px
```

### ARP 请求包（op=1）

```mermaid
flowchart LR
    subgraph ARPRequest["ARP请求包（op=1）"]
        direction LR

        DA["目的地址<br/>ff:ff:ff:ff:ff:ff<br/>(广播)"]
        SA["源地址<br/>00:0c:29:7f:37:1b"]
        Type["帧类型<br/>0806"]
        HT["硬件类型<br/>0001"]
        PT["协议类型<br/>0800"]
        HL["硬件地址<br/>长度<br/>06"]
        PL["协议地址<br/>长度<br/>04"]
        OP["操作码<br/>0001<br/>(请求)"]
        SMAC["源MAC<br/>00:0c:29:7f:37:1b"]
        SIP["源IP<br/>192.168.10.143"]
        DMAC["目的MAC<br/>ff:ff:ff:ff:ff:ff<br/>(未知)"]
        DIP["目的IP<br/>192.168.10.149"]

        DA --> SA --> Type --> HT --> PT --> HL --> PL --> OP --> SMAC --> SIP --> DMAC --> DIP
    end

    style DA fill:#f48fb1,stroke:#be185d,stroke-width:2px,color:#fff
    style SA fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style Type fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style HT fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style PT fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style HL fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style PL fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style OP fill:#f48fb1,stroke:#be185d,stroke-width:2px,color:#fff
    style SMAC fill:#e1bee7,stroke:#9c27b0,stroke-width:2px,color:#333
    style SIP fill:#e1bee7,stroke:#9c27b0,stroke-width:2px,color:#333
    style DMAC fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style DIP fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style ARPRequest fill:#fff5f7,stroke:#ec4899,stroke-width:3px
```

### ARP 应答包（op=2）

```mermaid
flowchart LR
    subgraph ARPReply["ARP应答包（op=2）"]
        direction LR

        DA["目的地址<br/>00:0c:29:7f:37:1b"]
        SA["源地址<br/>00:0c:29:7f:37:3f"]
        Type["帧类型<br/>0806"]
        HT["硬件类型<br/>0001"]
        PT["协议类型<br/>0800"]
        HL["硬件地址<br/>长度<br/>06"]
        PL["协议地址<br/>长度<br/>04"]
        OP["操作码<br/>0002<br/>(应答)"]
        SMAC["源MAC<br/>00:0c:29:7f:37:3f"]
        SIP["源IP<br/>192.168.10.149"]
        DMAC["目的MAC<br/>00:0c:29:7f:37:1b"]
        DIP["目的IP<br/>192.168.10.143"]

        DA --> SA --> Type --> HT --> PT --> HL --> PL --> OP --> SMAC --> SIP --> DMAC --> DIP
    end

    style DA fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style SA fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style Type fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style HT fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style PT fill:#fce4ec,stroke:#ec4899,stroke-width:2px,color:#333
    style HL fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style PL fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style OP fill:#f48fb1,stroke:#be185d,stroke-width:2px,color:#fff
    style SMAC fill:#e1bee7,stroke:#9c27b0,stroke-width:2px,color:#333
    style SIP fill:#e1bee7,stroke:#9c27b0,stroke-width:2px,color:#333
    style DMAC fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style DIP fill:#f8bbd9,stroke:#db2777,stroke-width:2px,color:#333
    style ARPReply fill:#fff5f7,stroke:#ec4899,stroke-width:3px
```

---

## 1.7 IP 数据报格式

<div class="ip-header-diagram">
  <div class="ip-header-title">IP数据报格式（20字节固定首部）</div>
  <div class="bit-labels">
    <span>0</span>
    <span>4</span>
    <span>8</span>
    <span>16</span>
    <span>31</span>
  </div>
  <div class="ip-row">
    <div class="ip-cell" style="width: 12.5%;">4位<br/>版本</div>
    <div class="ip-cell" style="width: 12.5%;">4位<br/>首部长度</div>
    <div class="ip-cell" style="width: 25%;">8位服务类型(TOS)</div>
    <div class="ip-cell" style="width: 50%;">16位总长度(字节数)</div>
  </div>
  <div class="ip-row">
    <div class="ip-cell" style="width: 50%;">16位标识</div>
    <div class="ip-cell" style="width: 9.375%;">3位<br/>标志</div>
    <div class="ip-cell" style="width: 40.625%;">13位片偏移</div>
  </div>
  <div class="ip-row">
    <div class="ip-cell" style="width: 25%;">8位生存时间(TTL)</div>
    <div class="ip-cell" style="width: 25%;">8位协议</div>
    <div class="ip-cell" style="width: 50%;">16位首部检验和</div>
  </div>
  <div class="ip-row">
    <div class="ip-cell full">32位源IP地址</div>
  </div>
  <div class="ip-row">
    <div class="ip-cell full">32位目的IP地址</div>
  </div>
  <div class="ip-row optional">
    <div class="ip-cell full">选项（如果有）0~40字节</div>
  </div>
  <div class="ip-row data">
    <div class="ip-cell full">数据</div>
  </div>
</div>

### IP 首部各字段说明

| 字段 | 说明 |
|:---|:---|
| **版本** | IP 协议版本，IPv4 为 4，IPv6 为 6 |
| **首部长度** | 以 4 字节为单位，最小值为 5（20 字节），最大值为 15（60 字节） |
| **服务类型(TOS)** | 用于区分服务优先级 |
| **总长度** | 整个 IP 数据报的长度，最大 65535 字节 |
| **标识** | 用于分片重组时识别同一数据报 |
| **标志** | 3 位：保留位、DF（禁止分片）、MF（更多分片） |
| **片偏移** | 分片在原始数据报中的位置，以 8 字节为单位 |
| **生存时间(TTL)** | 防止网络阻塞，每经过一个节点 -1，到 0 丢弃 |
| **协议** | 区分上层协议：TCP、UDP、ICMP、IGMP |
| **首部检验和** | 只校验 IP 首部，数据校验由更高层负责 |
| **源/目的 IP 地址** | 32 位，4 字节，点分十进制表示 |

> **注意**：我们熟悉的 IP 都是点分十进制的，4 字节，每字节对应一个点分位，最大为 255，实际上就是整型数！

---

## 1.8 UDP 数据报格式

<div class="ip-header-diagram">
  <div class="ip-header-title">UDP数据报格式（8字节固定首部）</div>
  <div class="bit-labels">
    <span>0</span>
    <span>15</span>
    <span>16</span>
    <span>31</span>
  </div>
  <div class="ip-row">
    <div class="ip-cell" style="width: 50%;">16位源端口号</div>
    <div class="ip-cell" style="width: 50%;">16位目的端口号</div>
  </div>
  <div class="ip-row">
    <div class="ip-cell" style="width: 50%;">16位UDP长度</div>
    <div class="ip-cell" style="width: 50%;">16位UDP检验和</div>
  </div>
  <div class="ip-row data">
    <div class="ip-cell full">数据（如果有）</div>
  </div>
</div>

### UDP 首部各字段说明

| 字段 | 长度 | 说明 |
|:---|:---:|:---|
| **源端口号** | 2 字节 | 发送方的端口号 |
| **目的端口号** | 2 字节 | 接收方的端口号 |
| **UDP 长度** | 2 字节 | UDP 数据报的总长度（首部 + 数据），最小值为 8（只有首部） |
| **UDP 检验和** | 2 字节 | 检测 UDP 数据报在传输中是否有错，有错就丢弃 |

> **核心概念**：通过 IP 地址来确定网络环境中的唯一一台主机；主机上使用端口号来区分不同的应用程序。**IP + 端口** 唯一确定唯一一台主机上的一个应用程序。

---

## 1.9 TCP 数据报格式

<div class="ip-header-diagram">
  <div class="ip-header-title">TCP数据报格式（20字节固定首部）</div>
  <div class="bit-labels">
    <span>0</span>
    <span>15</span>
    <span>16</span>
    <span>31</span>
  </div>
  <div class="ip-row">
    <div class="ip-cell" style="width: 50%;">16位源端口号</div>
    <div class="ip-cell" style="width: 50%;">16位目的端口号</div>
  </div>
  <div class="ip-row">
    <div class="ip-cell full">32位序号</div>
  </div>
  <div class="ip-row">
    <div class="ip-cell full">32位确认序号</div>
  </div>
  <div class="ip-row">
    <div class="ip-cell" style="width: 12.5%;">4位<br/>首部长度</div>
    <div class="ip-cell" style="width: 18.75%;">保留<br/>(6位)</div>
    <div class="ip-cell tcp-flags" style="width: 18.75%;">
      <div class="flag-row">
        <span>U<br/>R<br/>G</span>
        <span>A<br/>C<br/>K</span>
        <span>P<br/>S<br/>H</span>
        <span>R<br/>S<br/>T</span>
        <span>S<br/>Y<br/>N</span>
        <span>F<br/>I<br/>N</span>
      </div>
    </div>
    <div class="ip-cell" style="width: 50%;">16位窗口大小</div>
  </div>
  <div class="ip-row">
    <div class="ip-cell" style="width: 50%;">16位检验和</div>
    <div class="ip-cell" style="width: 50%;">16位紧急指针</div>
  </div>
  <div class="ip-row optional">
    <div class="ip-cell full">选项</div>
  </div>
  <div class="ip-row data">
    <div class="ip-cell full">数据</div>
  </div>
</div>

### TCP 首部各字段说明

| 字段 | 说明 |
|:---|:---|
| **源/目的端口号** | 发送方和接收方的端口号，各 2 字节 |
| **32位序号** | 本报文段所发送的数据的第一个字节的序号 |
| **32位确认序号** | 期望收到对方下一个报文段的第一个数据字节的序号 |
| **4位首部长度** | TCP 报文段的数据起始处距离报文段的起始处有多远，单位是 4 字节 |
| **保留(6位)** | 保留为今后使用，目前应置为 0 |
| **6个标志位** | **URG**（紧急）、**ACK**（确认）、**PSH**（推送）、**RST**（复位）、**SYN**（同步）、**FIN**（终止） |
| **16位窗口大小** | 接收方允许发送方发送的数据量，用于流量控制 |
| **16位检验和** | 检测 TCP 报文段在传输中是否有错 |
| **16位紧急指针** | 指出本报文段中紧急数据的字节数 |

### TCP 核心机制

- **序号**：TCP 是安全可靠的，每个数据包都带有序号。当数据包丢失时，需要重传，使用序号进行重传。控制数据有序，丢包重传。

- **确认序号**：使用确认序号可以知道对方是否已经收到，通过确认序号可以知道哪个序号的数据需要重传。

- **16位窗口大小**：**滑动窗口**，主要进行流量控制。
