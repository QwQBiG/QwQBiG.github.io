---
title: "荣耀 X70i 临时 root 实战"
description: "记录荣耀 X70i 临时 root 的方案取舍、排错过程，以及厂商内核与 GKI 符号偏移的实测差异。"
date: 2026-11-08T00:00:00+08:00
tags: ["Android", "荣耀", "root", "KernelSU", "Linux", "刷机", "实践"]
categories: ["嵌入式"]
series: ["成就-来硬的"]
draft: false
---

这次折腾的是一台没有 OEM 解锁入口的荣耀 X70i。目标很小：不刷启动和系统镜像，拿到一次临时 root，方便观察实际运行的内核。

下面按尝试的顺序记下三条路线、成功时的日志，以及拿到权限后发现的偏移差异。机型、配置和结果都对应这台设备当时的状态。

> - 机型：荣耀 X70i（ABR-AN00）
> - 系统：MagicOS 10 / Android 16
> - 结果：KernelSU LKM 临时 root，权限重启后失效；本记录未刷写启动和系统镜像
> - 记录时间：2026-11-08

---

## 一、先看清楚这台机器锁得多死

```
机型      荣耀 X70i   ABR-AN00 / 构建 ABR-AN80 10.0.0.575(C00E538R201P2)
系统      MagicOS 10 / Android 16 / SDK 36 / 安全补丁 2026-08-01
SoC       联发科 MT6855（天玑 7025 Ultra），板级 k6855v1_64
内核      6.12.38-android16-5-gfde7767f6ef6-abogki481467632-4k
          #1 SMP PREEMPT Tue Feb 3 01:12:17 UTC 2026  aarch64  4K 页
引导      flash.locked=1，无 OEM 解锁开关，fastboot 所有解锁命令 unknown command
校验      verifiedbootstate=green，dm-verity 通过
分区      /system、/vendor 为 erofs 只读
SELinux   Enforcing
```

由此得到四条硬约束：

1. 不能刷写启动和系统镜像 → 走不了常规的 Magisk 安装路线
2. 不能解锁 BL → 当时没有通过修改 boot.img 持久化 root 的条件
3. 没有匹配的固件 → 当时拿不到与实机对应的符号资料，需要精确内核布局的路线受阻
4. 普通应用没有 ADB shell 的权限 → 在 Termux 中直接修改 `persist.log.tag` 行不通

目标因此定得很小：**只要一个临时的、内存里的 root。** 重启会让这次 root 权限失效，但工具文件、模块文件和已经修改的设置不一定随之消失。

---

## 二、三条路的取舍

### 2.1 GhostLock（futex PI，CVE-2026-43499）—— 走过，放弃

这条投入最多，也最值得记。

**做过的事：**

从 GKI 参考镜像（`6.12.38-android16-5-g209015b548fb`）里提取了 **125,760 个符号**，
又对照了 6.12.30 镜像中的几个数据符号。当时看到的偏移很接近，一度以为它们可以作为实机的参考；后面拿到运行时数据才发现，这个判断不适用于手里这台机器。

```
符号              6.12.38            6.12.30            差值
init_task         ffffffc0823fcf00   ffffffc0823fcf00   0x0
init_cred         ffffffc082412c70   ffffffc082412c70   0x0
root_task_group   ffffffc08262c580   ffffffc08262c580   0x0
selinux_state     ffffffc0826784d0   ffffffc0826784b8   0x18
```

另外把 GhostLock 的 profile `.bin` 格式**完全反解**了，对 75 个内置 profile 做了字节级往返验证：

```
文件 = '!' + u16版本 + u8标记 + 8B头 + u32长度 + release字符串 + u16段数 + 段*
段   = u8名长 + 名 + u32字段数 + (u8键长 + 键 + u64值)*
```

**结果：两次实跑都死在 W1 阶段的竞态写入 → panic。**

日志打印出了 `init_cred=ffffffc082412c70` 等地址，堆喷射阶段和 `prepare_kernel_page` 也报告成功，
但这些阶段日志并不能证明符号地址与实机匹配。换用小米 13T 同版本的参考数据符号偏移后，仍在相同阶段失败。

**当时的判断**：崩溃点在路由/竞态层，而 pselect 的栈几何只能从真镜像反汇编得到——我们没固件。

**后来的更正（重要）**：拿到 root 后实测发现，**这台机器的 vendor 内核与前面那份 GKI 参考镜像，
符号偏移整体差了 64–72 KB**（数据见第五节）。
**偏移不匹配**因此成了一个不能忽略的疑点。不过，没有进一步的对照实验，仍不能确认它就是这两次 W1 panic 的根因，也不能据此排除竞态层的问题。

### 2.2 刷机匣 / MTK EDL —— 不可行

- 刷机匣的 MTK 配置表有 80 个条目，覆盖 MT6752 到 MT6983，**没有 MT6855**
- DA 必须厂商签名，别家的 MT6855 DA 无效
- 实测本机 mtkclient：`SLA required` / `DAA_SIG_VERIFY_FAILED`
- fastboot 侧：`getvar all` 直接 `Command not allowed`

### 2.3 DirtyFrag（CVE-2026-43284）—— 选中

选它的理由很干脆：

<div role="region" aria-label="GhostLock 与 DirtyFrag 比较表" tabindex="0" style="overflow-x: auto;">
<div style="min-width: 32rem;">

| 维度 | GhostLock | DirtyFrag |
|---|---|---|
| 需要内核符号偏移 | 需要（且必须精确） | **不需要** |
| 本次观察到的失败形态 | panic / 重启 | 报错或加载失败 |
| 依赖 | 目标内核布局匹配 | 相关漏洞路径仍可触发，并满足这次工具链的运行条件 |

</div>
</div>

本机 `CONFIG_XFRM_ESP=y`、`CONFIG_INET_UDP_DIAG=y`，`MODULE_SIG_FORCE` 未开启，
配合 KernelSU 的 LKM 模式，这次在这台机器上跑通了；这些配置本身并不足以保证其他构建也能成功。

---

## 三、DirtyFrag 原理与实操

### 3.1 原理

内核把 AES-CBC ESP 包直接解密进 `splice()` 打开文件的 page cache。构造

```
IV = AES_ECB_DEC(key, 当前内容) XOR 期望内容
```

就能在**无写权限、无 CoW** 的情况下改写只读文件的页缓存。用它把 shellcode 打进
`libc++.so`，在下一次特权调用时执行，从 `vendor_modprobe` 域 `insmod` 内核模块，
最后拉起 ksud。

### 3.2 实测日志（成功那次）

```
found ko_target: /vendor/lib64/libbinderdebug.so
Kernel 6.12 android16 -> Using KMI: android16-6.12
patch: crash_dump64      <- splicehelper (1408 B)
patch: libbinderdebug.so <- dfroot.ko (11040 B)
patch: libc++.so         <- shellcode (464 B)
patch: libc++.so         <- trampoline (16 B)
libc++: loading custom module
kernel module: launching bootstrap
bootstrap: cloning zygote env
bootstrap: setting partitions ro
bootstrap: starting SU daemon
```

`lsmod` 出现 `kernelsu 221184 1`，KernelSU 管理器显示 `LKM 工作中 [越狱模式]`。

### 3.3 操作顺序

```
① 设置日志开关（不设会直接中止）
   adb shell setprop persist.log.tag I

② 打开 DirtyFrag → SU Manager 选 "KernelSU" → 点 Run exploit → 再点一次确认

③ 等约 40 秒，界面显示 Rooted

④ 验证
   adb shell "grep kernelsu /proc/modules"      # 应输出包含 kernelsu 的模块行
```

这次记录中的粗估是约 **2/3**。本文没有列出完整的尝试次数，不能把它当成稳定成功率。遇到失败时，先看日志和下文提到的遗留命令，再判断是否重试。

### 3.4 踩过的四个坑

<div role="region" aria-label="问题现象与处理方式" tabindex="0" style="overflow-x: auto;">
<div style="min-width: 32rem;">

| 坑 | 现象 | 解法 |
|---|---|---|
| `persist.log.tag=S` | App 报"日志缓冲区关闭"并中止 | `setprop persist.log.tag I`（**每次开机都要设**） |
| SU Manager 缓存 | "No app with libksud.so found" | 重启 DirtyFrag App 重扫 |
| profile 导入 | 只显示"导入失败" | App 的 conf 导入只存不激活；这条路当时走不通 |
| 遗留命令 | 模块自动执行旧脚本，导致"重复 panic" | 清空 `/data/local/tmp/rootcmd.sh` |

</div>
</div>

第四条尤其值得记：有三次所谓的"崩溃"，其实是 **root 已经成功，但上一轮遗留的启动命令把设备带崩了**。
判断 exploit 成败要看**产物**（`/proc/modules`、通道文件时间戳），不能只看 UI。

---

## 四、root 到手之后：没有 su 怎么办

这是这次最容易踩的坑：**当时的安装状态下，`/data/adb/ksu/bin/` 里只有
`bootctl / busybox / ksud / resetprop`，没有 `su`。**
`adb shell su` 直接报不存在。这里记录的是这次环境遇到的情况，不能据此判断所有 KernelSU LKM 安装都没有 `su`。

解决办法是做一个**命令通道**——利用 KernelSU 模块的 `service.sh` 在 ksud 启动时以
`uid=0 / u:r:ksu:s0` 执行的特性：

下面保留当时的通道脚本。它是持续轮询的临时实现，没有加入等待或退出控制；模块打包和启动所需的其他文件也不在本文附件中。

```sh
#!/system/bin/sh
CH=/data/local/tmp/rootcmd.sh
OUT=/data/local/tmp/rootout.txt
: > "$OUT"
(
  last=""
  while true; do
    if [ -f "$CH" ]; then
      now=$(md5sum "$CH" 2>/dev/null | cut -d' ' -f1)
      if [ -n "$now" ] && [ "$now" != "$last" ]; then
        last="$now"
        echo "=== RUN $(date) ===" >> "$OUT"
        /system/bin/sh "$CH" >> "$OUT" 2>&1
      fi
    fi
  done
) &
```

用法：

```sh
adb push 你的脚本.sh /data/local/tmp/rootcmd.sh
# 等 1~2 秒
adb shell cat /data/local/tmp/rootout.txt
```

设计要点：
- 用 **md5 比较内容**而不是时间戳，避免重复执行
- 命令写文件、结果写文件，adb 只做搬运，不依赖交互式 shell
- 输出带 `=== RUN <时间> ===` 分隔，便于分辨哪次是新的

有了这条通道，后续所有 root 操作（读 `/proc/kallsyms`、改 `kptr_restrict`、起 frida）都能做。

---

## 五、拿到 root 后的实测：GKI 与厂商构建的偏移差

root 之后第一件值得做的事，是量出真实的内核符号布局：

```sh
echo 0 > /proc/sys/kernel/kptr_restrict
grep -E " (_text|init_task|init_cred)$" /proc/kallsyms
echo 2 > /proc/sys/kernel/kptr_restrict     # 用完恢复
```

以 `_text` 为基准的相对偏移，与 GKI 6.12.38 的 `System.map` 对比：

<div role="region" aria-label="GKI 与实机符号偏移对照" tabindex="0" style="overflow-x: auto;">
<div style="min-width: 32rem;">

| 符号 | GKI Δ(_text) | 实机 Δ(_text) | 差值 |
|---|---|---|---|
| `init_task` | `0x23FCF00` | `0x23ECF00` | −64.0 KB |
| `init_nsproxy` | `0x2412870` | `0x24028B0` | −63.9 KB |
| `init_cred` | `0x2412C70` | `0x2402CB0` | −63.9 KB |
| `root_task_group` | `0x262C580` | `0x261A580` | −72.0 KB |
| `selinux_state` | `0x26784D0` | `0x26663C8` | −72.3 KB |

</div>
</div>

**同为 `6.12.38-android16-5`、同样 4K 页，但构建不同，表中符号的相对偏移低了约 64–72 KB。**

从这次对照能确认的是：

1. **本文这台厂商构建与所比较的 GKI 参考镜像不偏移兼容。**
   不能只凭 release 名称，就认定某份 profile 适用于这台设备；这次测量也不足以概括所有带 `abogki…` 后缀的构建。
2. **这里采到的是运行时虚拟地址与符号相对偏移，物理装载点没有验证。**
   从虚拟地址中去掉 KASLR 的随机化偏移，得到的仍是虚拟地址，不能直接当作物理装载点。虚实地址还涉及映射关系，可对照 [Linux 的 AArch64 内存布局文档](https://docs.kernel.org/arch/arm64/memory.html)。

其它可读性情况：

```
/proc/config.gz            可读
/sys/kernel/btf/vmlinux    可读（6.9 MB，含 BTF 类型信息）
/proc/iomem                root 下可读
kptr_restrict              默认 2，root 可临时设 0
```

---

## 六、重启之后怎么恢复

root 权限是临时的，重启后需要重新获取。下面是当时在已经配置好 Shizuku、Termux 和相关文件的手机上使用的流程：

```
① 连 WiFi（任何网络，热点无网也行）
② 打开 Shizuku →「通过无线调试启动」（手机自己和自己配对，不经电脑）
③ Termux 里执行：sh campus-boot.sh
   —— 它会把 persist.log.tag 设成 I、清掉遗留命令、检查文件
④ DirtyFrag → Run exploit → 等 40 秒 → Rooted
```

`campus-boot.sh` 是当时项目中的本地准备脚本，不是通用安装包，本文没有附带。上面这段用于记录那次环境的恢复顺序，不能把脚本名直接当作一条新环境可用的命令。

为什么必须走 Shizuku：`persist.log.tag` 每次开机被重置成 `S`，DirtyFrag 见到就中止，
而这个属性只有 shell 权限能改。Shizuku 提供 uid=2000 的 shell 权限，
配 `rish` 就能在 Termux 里执行 `setprop`。

---

## 七、风险与边界

1. **权限不持久**：重启后临时 root 失效。本记录未刷写启动和系统镜像，观察到的 `verifiedbootstate` 为 `green`；但 `/data` 中的文件、模块和设置变更可能保留，不能等同于恢复了全部状态。
2. **不可降级**：荣耀不让回退，OTA CDN 匿名 403，没有 boot.img，
   所以任何"试试看"的操作都要先想清楚
3. **系统更新会破坏它**：内核一换，漏洞可能被修、LKM vermagic 不匹配。
   本机已用 `pm disable-user` 禁掉 `com.hihonor.ouc`（OUC 在线更新）与
   `com.hihonor.systemappsupdater`。禁用应用是另一项会保留的设置变更，和临时 root 权限本身不同。
4. **不要 `kill -9` 注入类进程**：frida-inject 被强杀会让它 hook 的目标进程崩溃
   （我们实测把 `system_server` 带崩过一次，桌面重启）
5. **合规**：本文是技术研究记录，用于做什么由使用者自己负责

---

## 八、一页速查

```
拿 root    setprop persist.log.tag I → DirtyFrag Run exploit ×1~2 → lsmod | grep kernelsu
执行命令   push 脚本到 /data/local/tmp/rootcmd.sh → 读 /data/local/tmp/rootout.txt
本次环境   未提供 su；工具在 /data/adb/ksu/bin/{busybox,ksud,resetprop}
读内核符号 echo 0 > /proc/sys/kernel/kptr_restrict
重启恢复   Shizuku 无线调试 → Termux 跑 campus-boot.sh → DirtyFrag
```

## 参考资料

- [Ubuntu：CVE-2026-43284（Dirty Frag）](https://ubuntu.com/security/CVE-2026-43284)：核对漏洞编号及共享页片段被原地修改的问题；本文的具体机型结果来自上面的实机记录。
- [Red Hat：GhostLock 安全公告](https://access.redhat.com/security/vulnerabilities/RHSB-2026-010)：核对 GhostLock 与 futex / rtmutex 的背景。
- [Android：Generic Kernel Image 项目](https://source.android.com/docs/core/architecture/kernel/generic-kernel-image)：了解 GKI 的设计背景；本文的符号偏移差异只针对表中两份构建。
- [Linux：AArch64 内存布局](https://docs.kernel.org/arch/arm64/memory.html)：区分内核虚拟地址布局和物理地址映射。
