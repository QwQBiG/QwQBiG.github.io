---
title: "Windows Sandbox 解析：不是虚拟机，胜似虚拟机"
date: 2026-03-03T14:00:00+08:00
draft: false
tags: ["Windows", "Sandbox", "虚拟化", "安全", "Hyper-V"]
categories: ["技术探索"]
author: "QwQBiG"
---

# Windows Sandbox 硬核解析：不是虚拟机，胜似虚拟机

> 当你点击那个蓝色图标时，你启动的不仅仅是一个"干净的环境"，而是微软 Hyper-V 技术栈的集大成之作。

Windows Sandbox（Windows 沙盒）并非传统的虚拟机（如 VMware 或 VirtualBox），它采用了更轻量、更底层的架构。下面我将从技术实现、安全机制和隐私问题三个维度为你硬核拆解 Windows Sandbox。

---

## 一、核心技术实现 (How it works)

Windows Sandbox 的本质是基于 **Hyper-V 容器技术 (Hyper-V Containers)** 的轻量级微型虚拟机。它与传统 VM 最大的区别在于资源共享和动态映像。

### 1. 为什么账户叫 WDAGUtilityAccount？

- **前身与技术栈**：`WDAG` 代表 **Windows Defender Application Guard**。微软最初开发这项技术是为了在隔离的硬件环境中运行 Edge 浏览器（防止恶意网页攻击宿主机）。后来，微软将这项底层隔离技术开放出来，做成了完整的桌面环境，也就是 Windows Sandbox。
- **账户权限**：这是一个内置的、动态生成的本地管理员账户。虽然它在沙盒内部有管理员权限（方便你安装测试软件），但它的权限被严格限制在虚拟化边界内。

### 2. 为什么显示有近 80GB 空间，但启动却很快？

- **动态基础映像 (Dynamic Base Image)**：如果你用 VMware 装 Windows，你需要一个完整的 ISO 文件并占用几十 GB 硬盘。但 Sandbox 不需要下载或复制独立的 Windows 映像。
- **文件系统重定向 (NTFS 链接)**：它直接利用你宿主机 (Host) 现有的 `C:\Windows` 系统文件。它通过操作系统层面的特殊文件链接技术，将宿主机上未被修改的系统文件"映射"到沙盒中，沙盒只对自己修改过的文件进行 **写时复制 (Copy-on-Write)** 存储。
- **显示的空间**：这 80GB 并不是真正在你硬盘上划走了一块空间，而是分配给沙盒的一个虚拟磁盘上限 (VHDX)，实际占用的物理空间极小（通常只有几十 MB 到一百多 MB 的差异文件）。

### 3. 内存与调度的黑科技

- **智能内存管理 (Smart Memory Management)**：宿主机和沙盒会共享相同的物理内存页。例如，宿主机和沙盒都在运行 `ntdll.dll`，内存中只会保留一份该文件的只读副本，双方共享。这极大地减少了内存开销。
- **集成调度器 (Integrated Scheduler)**：传统虚拟机由 Hypervisor 进行粗粒度的 CPU 时间片分配。而 Sandbox 允许宿主机的内核调度器直接将沙盒中的虚拟处理器当作宿主机的线程来调度。这意味着沙盒能极其高效地抢占和释放 CPU 资源。

---

## 二、安全隔离机制 (Security)

作为 CS 学生，如果你想用它来做恶意软件分析 (Malware Analysis) 或测试不安全代码，你需要了解它的安全边界：

- **硬件级隔离**：它依赖于现代 CPU 的虚拟化扩展（Intel VT-x 或 AMD-V）以及 SLAT（二级地址转换）。通过 Hyper-V 的 Type-1 虚拟机监视器，沙盒与宿主机在物理硬件层面被强制隔离。
- **绝对的无状态性 (Ephemeral State)**：沙盒关闭时，所有的状态、文件、注册表更改、内存数据会瞬间全部销毁。没有任何持久化存储（除非你配置了特定的映射文件夹）。
- **虚拟化图形处理 (vGPU)**：为了让沙盒内的动画和渲染流畅，它利用了硬件加速，但它不是直接访问你的显卡，而是通过宿主机的 WDDM（Windows 显示驱动程序模型）进行安全的 vGPU 代理渲染，防止恶意软件通过 GPU 驱动漏洞逃逸。
- **网络隔离 (vSwitch)**：它通过一个虚拟交换机 (Default Switch) 桥接到宿主机的网络。沙盒位于一个隔离的 NAT 子网中。

> ⚠️ **安全警告**：虽然极难（虚拟机逃逸漏洞非常昂贵且罕见），但理论上 0-day 的 Hyper-V 虚拟机逃逸漏洞是有可能穿透沙盒的。对于极度危险的内核级病毒（如针对底层硬件固件的破坏性勒索软件），使用专用的物理隔离机（Air-gapped machine）才是最安全的。

---

## 三、隐私问题 (Privacy)

使用沙盒时，需要注意以下隐私相关的边界：

- **剪贴板共享**：默认情况下，宿主机和沙盒之间的剪贴板是互通的。如果在宿主机复制了密码，在沙盒中是可以粘贴的。这在运行不受信任的代码时是一个隐私风险点（恶意代码可以监听沙盒内的剪贴板获取你宿主机的敏感信息）。
- **网络流量暴露**：因为沙盒使用的是 NAT 网络，沙盒发出的所有网络请求（例如下载、访问网页、甚至恶意软件向外发送数据），在路由器和 ISP 看来，都是从你的宿主机 IP 发出的。沙盒只能隔离本地破坏，不能匿名网络流量。
- **微软的遥测数据 (Telemetry)**：沙盒运行的依然是正版 Windows 内核。它同样会遵循宿主机的隐私设置，可能会向微软发送系统崩溃日志或基础遥测数据。
- **宿主机可见性**：宿主机可以监控到沙盒的整体资源占用（如你在任务管理器中看到的），但通常无法轻易"看透"沙盒内部正在运行的具体进程，除非使用专门的 Hyper-V 调试工具。反过来，沙盒绝对无法看到宿主机的进程和文件系统。

---

## 💡 CS 学生的进阶玩法：使用 .wsb 配置文件

千万不要只通过点击图标来启动沙盒！你可以通过编写 XML 格式的 `.wsb` (Windows Sandbox Configuration) 文件来定制沙盒的行为。

创建一个文本文件，命名为 `test.wsb`，写入以下代码：

```xml
<Configuration>
  <vGPU>Disable</vGPU> <!-- 禁用显卡加速，纯CPU运行 -->
  <Networking>Disable</Networking> <!-- 拔掉网线，彻底断网，适合测试病毒 -->
  <MappedFolders>
    <MappedFolder>
      <HostFolder>C:\Users\YourName\Downloads\TestScripts</HostFolder> <!-- 将宿主机的代码文件夹映射进去 -->
      <SandboxFolder>C:\Users\WDAGUtilityAccount\Desktop\Scripts</SandboxFolder>
      <ReadOnly>true</ReadOnly> <!-- 设置为只读，防止沙盒内的代码修改宿主机源码 -->
    </MappedFolder>
  </MappedFolders>
  <LogonCommand>
    <Command>explorer.exe C:\Users\WDAGUtilityAccount\Desktop\Scripts</Command> <!-- 启动时自动打开该文件夹 -->
  </LogonCommand>
</Configuration>
```

双击这个 `.wsb` 文件，你就会得到一个：
- ✅ 没有网络
- ✅ 不能使用 GPU 加速
- ✅ 桌面上放着你的测试代码（且只能读不能写）

的安全靶场环境。这非常适合用来跑脚本、测试依赖库或者分析未知的 `.exe` 文件。

### 更多配置选项

| 配置项 | 说明 | 可选值 |
|--------|------|--------|
| `<vGPU>` | 是否启用 GPU 加速 | Enable / Disable |
| `<Networking>` | 网络连接 | Enable / Disable / Default |
| `<AudioInput>` | 音频输入 | Enable / Disable |
| `<VideoInput>` | 视频输入（摄像头） | Enable / Disable |
| `<ProtectedClient>` | 增强保护模式 | Enable / Disable |
| `<PrinterRedirection>` | 打印机重定向 | Enable / Disable |
| `<ClipboardRedirection>` | 剪贴板共享 | Enable / Disable |

### 实用场景示例

**场景 1：安全测试可疑软件**
```xml
<Configuration>
  <Networking>Disable</Networking>
  <vGPU>Disable</vGPU>
  <ClipboardRedirection>Disable</ClipboardRedirection>
</Configuration>
```

**场景 2：临时开发环境**
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
    <Command>powershell.exe -Command "Set-Location C:\Projects; code ."</Command>
  </LogonCommand>
</Configuration>
```

---

## 总结

Windows Sandbox 是微软在虚拟化领域的一次优雅创新。它不是传统意义上的"虚拟机"，而是一种**轻量级、瞬时性、硬件隔离**的安全容器。对于开发者、安全研究人员和普通用户来说，它提供了一个完美的"试毒"环境——既不需要像 VMware 那样占用大量资源，又比 Docker Desktop 更适合运行完整的 Windows 应用程序。

下次当你需要测试一个来路不明的 `.exe` 文件，或者想在一个干净的环境中复现 Bug 时，不妨试试这个系统自带的"时光机"。

---

**参考链接：**
- [Microsoft Docs: Windows Sandbox](https://docs.microsoft.com/en-us/windows/security/threat-protection/windows-sandbox/windows-sandbox-overview)
- [Windows Sandbox Config File](https://docs.microsoft.com/en-us/windows/security/threat-protection/windows-sandbox/windows-sandbox-configure-using-wsb-file)
