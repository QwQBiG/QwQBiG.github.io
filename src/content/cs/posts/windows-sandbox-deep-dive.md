---
title: "Windows Sandbox 解析：不是虚拟机，胜似虚拟机"
date: 2026-03-03T14:00:00+08:00
draft: false
tags: ["Windows", "Sandbox", "虚拟化", "安全", "Hyper-V"]
categories: ["技术探索"]
---

# Windows Sandbox 解析：原理、安全边界与 .wsb 配置

Windows Sandbox（Windows 沙盒）提供了一套临时的 Windows 桌面。你可以在里面安装软件、运行脚本、修改设置，用完关闭，丢弃这次环境。

它省去了准备安装映像、安装系统和维护虚拟机的过程。背后仍然是基于 Hyper-V 的虚拟化隔离，只是微软围绕临时使用做了优化：复用系统文件、减少内存占用，让启动和资源调度更轻便。

下面从它的实现原理讲起，再看看哪些设置会影响安全与隐私，以及如何用 `.wsb` 文件准备自己的测试环境。

## 一、它为什么能保持轻量

### 为什么账户叫 WDAGUtilityAccount？

进入沙盒后，默认使用的账户是 `WDAGUtilityAccount`。名称中的 WDAG 来自 Windows Defender Application Guard，后者曾用于隔离浏览器等应用。Windows Sandbox 与它使用相关的容器和虚拟化技术。

这个账户在沙盒内具备安装软件所需的管理权限，方便你测试程序、修改环境。它的权限作用于沙盒中的 Windows。

### 为什么显示近 80 GB，实际却没占那么多空间？

沙盒中的磁盘容量和宿主实际消耗的磁盘空间是两回事。看到接近 80 GB 的卷容量，不代表它已经从宿主硬盘上占用了同样大小的空间。

Windows Sandbox 使用“动态基础映像”。它利用宿主现有的 Windows 系统文件，把可以共享的、不变的文件与需要独立保存的干净副本组合起来，构成一套可启动的系统。沙盒运行期间产生的修改另外保存。

这样就不用再下载一份 Windows 安装映像，也不用为每次测试维护一套完整的客体系统。实际占用会随着安装软件和写入文件而增加。

### 内存和 CPU 怎样分配？

内存也能复用。例如，宿主和沙盒都需要加载 `ntdll.dll`，相同的系统二进制内容可以映射到同一组物理内存页，减少重复占用。宿主内存紧张时，还能通过动态内存管理收回沙盒的一部分内存。

CPU 方面，Windows Sandbox 使用集成内核调度器。宿主参与沙盒虚拟处理器的调度，方式类似调度进程中的线程。两边争用资源时，宿主上优先级较高的任务可以抢占沙盒中优先级较低的工作。

启动速度则还受益于快照与克隆：利用预先准备好的系统状态恢复实例，减少每次从头启动 Windows 的开销。

## 二、安全隔离具体体现在哪里

### 独立内核与硬件虚拟化

Windows Sandbox 通过微软的虚拟机监控程序运行独立内核，利用处理器的硬件虚拟化能力与宿主隔离。程序在沙盒中安装服务、修改注册表或改变系统设置，影响的是里面那套 Windows。

关闭并确认结束沙盒后，本次环境中的软件和系统改动会被丢弃。Windows 11 22H2 起，在沙盒内部重启可以保留本次会话的状态，方便完成需要重启的安装过程。

### 图形加速

沙盒可以通过 DirectX 和 WDDM 图形虚拟化使用宿主的 GPU 资源，让界面和图形程序运行得更流畅。

如果测试不需要图形加速，可以关闭 vGPU，改用 WARP 软件渲染。这样减少了向沙盒开放的图形功能，代价是图形性能可能下降。

### 网络连接

沙盒默认通过 Hyper-V 的虚拟交换机联网，共用宿主的网络连接。联网后，里面的程序也可能接触到可达的内网设备。

测试一个不需要联网的未知程序时，直接关闭网络通常更合适。正式分析高风险恶意样本，则应使用专门准备的隔离实验环境。

## 三、使用时要留意的隐私边界

### 剪贴板默认共享

宿主与沙盒默认可以互相复制粘贴文字和文件。这很方便，但宿主刚复制过的密码、令牌等内容，也可能暴露给沙盒中的程序。

运行未知程序前，可以通过配置文件关闭剪贴板共享。需要传入的文件则放进一个专用的只读目录。

### 共享目录里的文件仍然属于宿主

映射文件夹让沙盒直接访问指定的宿主目录。这里要分清两种权限：

- **只读**：沙盒可以读取文件，不能通过该映射修改文件。目录中仍然只应放本次需要提供的内容。
- **可写**：沙盒中的修改会写回宿主，包括编辑、删除文件，以及生成新的文件。

因此，可写共享目录中的改动会在沙盒关闭后保留。测试时，如果只是想提供安装包或脚本，用只读映射就够了。

### 联网不会隐藏身份

沙盒通常与宿主共用网络出口。访问网站、登录账号、上传文件时，对应服务仍然能记录这些活动。

Windows 本身也有与 Sandbox 有关的诊断事件，例如基础映像的创建和更新。结束临时桌面，并不意味着所有相关记录都会随之消失。

### 宿主仍然负责管理沙盒

沙盒的运行和资源分配由宿主管理。如果某些内容需要对宿主管理员保密，就不适合放在这台机器的沙盒中。

## 四、用 .wsb 文件准备测试环境

除了从开始菜单启动，还可以用 `.wsb` 文件指定沙盒的行为。文件内容是 XML，双击后就会按其中的配置启动。

下面准备一个离线测试环境：关闭网络、GPU 加速和剪贴板共享，把宿主上的代码目录以只读方式放到沙盒桌面上。

先创建宿主目录，将需要测试的文件放进去。保存以下内容为 `test.wsb`，并把 `YourName` 替换成实际用户名：

```xml
<Configuration>
  <vGPU>Disable</vGPU>
  <Networking>Disable</Networking>
  <ClipboardRedirection>Disable</ClipboardRedirection>

  <MappedFolders>
    <MappedFolder>
      <HostFolder>C:\Users\YourName\Downloads\TestScripts</HostFolder>
      <SandboxFolder>C:\Users\WDAGUtilityAccount\Desktop\Scripts</SandboxFolder>
      <ReadOnly>true</ReadOnly>
    </MappedFolder>
  </MappedFolders>

  <LogonCommand>
    <Command>explorer.exe C:\Users\WDAGUtilityAccount\Desktop\Scripts</Command>
  </LogonCommand>
</Configuration>
```

注意文件扩展名应当是 `.wsb`，不要保存成 `test.wsb.txt`。

双击后，沙盒会自动打开桌面上的 `Scripts` 文件夹。此时：

- 沙盒没有网络连接；
- 图形使用软件渲染；
- 宿主与沙盒之间不能通过共享剪贴板传递内容；
- `Scripts` 中的文件可以读取，但不能通过这个映射修改。

有些程序会向自身所在目录写入配置或日志。如果它在只读目录中运行失败，可以先把文件复制到沙盒内部的另一个目录，再从那里运行。

### 常用配置项

下面这些开关都支持 `Enable`、`Disable` 和 `Default`。其中，`Default` 表示使用系统默认行为。

| 配置项 | 用途 |
|---|---|
| `vGPU` | GPU 图形加速 |
| `Networking` | 网络连接 |
| `AudioInput` | 向沙盒提供麦克风等音频输入 |
| `VideoInput` | 向沙盒提供摄像头输入 |
| `ProtectedClient` | 为沙盒连接增加隔离保护 |
| `PrinterRedirection` | 向沙盒提供打印机 |
| `ClipboardRedirection` | 宿主与沙盒之间的剪贴板共享 |

例如，不需要麦克风时，可以在 `<Configuration>` 中加入：

```xml
<AudioInput>Disable</AudioInput>
```

### 场景一：临时测试未知程序

如果不需要自动映射文件夹，可以使用一份更简单的配置：

```xml
<Configuration>
  <Networking>Disable</Networking>
  <vGPU>Disable</vGPU>
  <ClipboardRedirection>Disable</ClipboardRedirection>
  <AudioInput>Disable</AudioInput>
</Configuration>
```

这份配置关闭了网络、GPU 加速、剪贴板共享和音频输入。需要从宿主传入文件时，再按前面的示例添加只读目录。

### 场景二：临时开发环境

如果想把工具和依赖装在沙盒里，同时继续编辑宿主上的项目，可以使用可写映射：

```xml
<Configuration>
  <MappedFolders>
    <MappedFolder>
      <HostFolder>D:\Projects</HostFolder>
      <SandboxFolder>C:\Projects</SandboxFolder>
      <ReadOnly>false</ReadOnly>
    </MappedFolder>
  </MappedFolders>

  <LogonCommand>
    <Command>explorer.exe C:\Projects</Command>
  </LogonCommand>
</Configuration>
```

使用前确认宿主上的 `D:\Projects` 已存在。启动后，沙盒会打开映射进来的项目目录，接着可以在里面安装编辑器和本次需要的开发工具。

这里将 `ReadOnly` 设为了 `false`，编辑器保存的代码、构建产生的文件，以及删除操作，都会影响宿主上的项目目录。

如果只想试验一组依赖，不准备改动现有项目，就使用只读映射，再把项目复制到沙盒内部工作。需要保留的结果在结束前另行保存。

## 结语

Windows Sandbox 适合试装软件、运行脚本和复现问题这类短期任务。它省去了单独安装和维护系统的麻烦，也让清理测试环境变得简单。

准备一份符合用途的 `.wsb` 文件，把联网、文件共享和需要保留的结果安排好，下次就能直接复用这套配置。

## 参考链接

- [Windows Sandbox 概览](https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/)
- [Windows Sandbox 架构](https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-architecture)
- [Windows Sandbox 配置文件](https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-configure-using-wsb-file)