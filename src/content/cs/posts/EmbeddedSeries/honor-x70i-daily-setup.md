---
title: "荣耀 X70i 折腾总账"
description: "记录临时权限之后的日常配置：Fcitx5 与 Rime 输入法、工具权限边界，以及重启后需要逐项检查的状态。"
date: 2026-11-08T19:00:00+08:00
tags: ["Android", "荣耀", "Fcitx5", "Rime", "Shizuku", "隐私", "实践"]
categories: ["嵌入式"]
series: ["成就-来硬的"]
draft: false
---

[临时 root 实战](/cs/posts/embeddedseries/honor-x70i-temporary-root/)记录了获取权限的过程，[运动数据那篇](/cs/posts/embeddedseries/android-motion-data-trust-boundaries/)整理了定位和传感器实验。这篇接着整理当天的日常配置：装过的工具、输入法的部署过程，以及重启后需要检查的状态。

记录日期为 2026 年 11 月 8 日，文中的应用版本和使用状态以当天记录为准。

## 一、设备与权限状态

这台荣耀 X70i 的型号是 ABR-AN00，12GB 内存、256GB 存储，MT6855 平台，运行 MagicOS 10 / Android 16，SDK 36。内核为 6.12.38，带 android16 标识，使用 4K 页。没有 OEM 解锁入口，引导处于锁定状态，`/system` 是只读的 erofs，SELinux 为 Enforcing。

这次的 root 只在当前运行中有效，重启后失效。已安装的应用、用户数据和部分设置可以保留，依赖权限服务的功能则需要重新确认。

这台设备通过无线调试启动 Shizuku，使用的是 shell 身份，UID 为 2000；root 的 UID 为 0。应用的可用功能取决于服务身份、自身授权和当前工作模式，相关说明见 [Shizuku 启动文档](https://shizuku.rikka.app/guide/setup/)和 [API 文档](https://github.com/RikkaApps/Shizuku-API)。

工具连接失败时，先检查权限服务是否运行，再查看应用的授权和后端连接状态。应用重新安装、服务重新启动和重新授权，分别对应不同的问题。

## 二、工具与版本

几项系统工具的版本、使用方式和检查项如下。

<div role="region" aria-label="工具及当时状态" tabindex="0" style="overflow-x:auto;">
<div style="min-width:32rem;">

| 工具 | 当日版本 | 当时的状态 | 后续检查点 |
| --- | --- | --- | --- |
| Hail（雹） | 1.11.0 | 使用 Shizuku 停用模式 | Shizuku 状态、工具模式、应用是否仍被停用 |
| App Manager | 4.1.1 | 有独立 shell 后端的记录 | 后端连接、授权及具体操作结果 |
| SD Maid SE | 2.2.2-rc0 | 已授予文件访问 | 当前可访问的目录范围 |
| KernelSU 管理器 | 当日安装状态 | 用于查看模块状态 | 临时 root 和模块的实际运行状态 |

</div>
</div>

当时观察到 App Manager 的后端进程。连接和授权情况还需要结合应用显示的工作模式，以及具体操作的返回结果确认。[官方文档](https://muntashir.dev/AppManager/en/)列出了各模式的说明。

此外还安装了 MT 管理器和 DevCheck，后者用于查看设备信息。网络与下载工具的具体配置暂略，下面主要记录输入法、权限和界面设置。

## 三、Fcitx5 与雾凇拼音

查看预装输入法时，发现它已获 `READ_SMS` 授权，随后换成了 Fcitx5 for Android 0.1.3、同版本 Rime 插件和雾凇拼音 nightly，设为默认输入法，并完成部署。雾凇用的是当时的 nightly 包，未记录具体提交号。

Fcitx5 是输入法前端，Rime 插件提供转换引擎，雾凇提供方案和词库。配置过程依次包括安装前端、启用插件、放入方案和重新部署。

普通个人资料下，Rime 用户目录通常是：

```text
/storage/emulated/0/Android/data/org.fcitx.fcitx5.android/files/data/rime/
```

`/sdcard` 是常见的等价入口。更方便的找法是从系统文件选择器 DocumentsUI 的侧栏进入“小企鹅输入法5”：这个入口展示的是应用的 `files/` 根目录，再进入 `data/rime/`。工作资料或其他用户的目录可能不同，以应用提供的入口为准。[官方 FAQ](https://fcitx5-android.github.io/faq/)说明了文件访问方式。

解压后，方案文件应直接放在 `rime/` 下；多套一层下载包目录会影响引擎查找文件。放好后使用 Reload Config／重新部署，等待完成并查看部署日志，步骤可对照[雾凇安装说明](https://github.com/iDvel/rime-ice/blob/main/others/docs/Installation.md#fcitx-for-android)。部署耗时和生成文件数量随方案、设备及版本而变。

Fcitx5 0.1.3 的整包备份包含 `metadata.json`、`shared_prefs`、`databases`、`external` 等内容，用于恢复应用设置和数据。雾凇方案 ZIP 则提供方案文件，两者使用不同的导入或恢复方式。备份结构见该版本的 [UserDataManager 源码](https://github.com/fcitx5-android/fcitx5-android/blob/0.1.3/app/src/main/java/org/fcitx/fcitx5/android/data/UserDataManager.kt)。

调整输入法前，可以导出配置备份，并保存方案源文件和自定义补丁。`build/` 存放部署生成物，重新部署仍需要相应的源文件，配置关系见 [Rime 方案说明](https://github.com/rime/home/wiki/RimeWithSchemata)。导出包可能包含个人词库，分享前需要检查内容。

部署后，确认方案列表中选中了预期方案，检查日志是否报错，再试常用词和自定义词。候选栏的“中州韵”或“雾”是显示名称，词典是否正常加载还要通过实际输入确认。

后续修改自定义补丁时，可以记录文件名和预期变化，部署后检查对应功能；遇到问题再查看日志、核对目录，或恢复备份。

## 四、权限检查与本地清理

[`READ_SMS`](https://developer.android.com/reference/android/Manifest.permission#READ_SMS) 允许应用读取短信。当天看到的是已授权状态，具体读取过哪些内容、是否发生上传，记录中没有相应证据。

当时还查看了一些系统服务、权限和日志文件，做过停用、停止和本地清理。留下的结果主要是服务运行状态、文件变化和清理后的大小，记录中未包含网络传输验证。

权限列表中的 `GRANTED_BY_DEFAULT` 表示默认授予，`SYSTEM_FIXED` 涉及系统固定的权限状态。它们描述权限的授予和管理方式，具体字段定义见 [AOSP PackageManager](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/core/java/android/content/pm/PackageManager.java#5309)。

后续可以通过系统权限页和隐私面板查看使用记录，调整不需要的授权；各类权限的管理方式可参考 [Android 权限概览](https://developer.android.com/guide/topics/permissions/overview)。

记录中还有停用更新相关组件的操作，未注明恢复组件及后续接收系统、安全更新的情况。恢复日常使用时，需要检查更新渠道是否正常。

## 五、无障碍服务

GKD 当时安装的版本为 1.13.0，通过无障碍服务执行界面交互。这类服务可以接收界面事件，在相应授权下读取界面内容、执行操作，使用时需要了解规则来源和作用范围。相关能力见 [Android 无障碍服务文档](https://developer.android.com/guide/topics/ui/accessibility/service)。

服务失效时，可以检查系统无障碍页、应用内状态及后台限制。`enabled_accessibility_services` 保存整份服务列表，直接覆盖该值可能同时清除其他服务的配置。

## 六、动画、浏览器与壁纸

窗口动画、过渡动画和动画时长三项缩放，当时都设为 0.75。这项设置控制动画播放时间，动效样式、应用加载和下载速度不在它的调整范围内。0.75 是这次使用的数值，可按个人习惯调整。

下面三条是只读查询示例，本文整理时没有重新连接设备执行：

```powershell
adb shell settings get global window_animation_scale
adb shell settings get global transition_animation_scale
adb shell settings get global animator_duration_scale
```

调整前记录原值，再通过开发者选项修改，恢复时填回原值。设置项说明见 [Settings.Global 文档](https://developer.android.com/reference/android/provider/Settings.Global)。

Chrome 当时通过分包侧载后能够启动，账户登录、同步和后续更新的情况未记录。XAPK 是打包容器，安装时需要处理其中完整且匹配的分包；ADB 的 `install-multiple` 用于安装多个 APK，说明见 [ADB 文档](https://developer.android.com/tools/adb)。侧载应用的后续更新渠道也需要自行确认。

Wallpaper Engine 2.8.8 已安装，六张内置壁纸在本机可用。电脑配对和 PC 同步尚未完成。

## 七、重启检查

以下是根据这次配置整理的重启检查清单，原记录未包含完整回滚验证。

<div role="region" aria-label="重启后的配置检查" tabindex="0" style="overflow-x:auto;">
<div style="min-width:32rem;">

| 项目 | 可能保留或变化的部分 | 重启后怎么确认 |
| --- | --- | --- |
| 应用、输入法与用户数据 | 安装和部分配置可以保留 | 默认输入法、方案列表、常用词和自定义词 |
| 临时 root | 当次权限重启失效 | 重新确认权限状态，再考虑依赖它的操作 |
| Shizuku 与各工具后端 | 经 ADB 启动的服务运行态需要重查 | 启动方式、应用授权、当前工作模式逐项看 |
| 无障碍服务 | 以系统实际状态为准 | 系统无障碍页、应用状态与后台限制 |
| 动态壁纸 | 本机使用与电脑配对分开记 | 检查本机壁纸状态，电脑配对与 PC 同步仍待完成 |

</div>
</div>

重启后先检查输入法、桌面和设置，再启动需要的权限服务，进入各工具确认授权和工作模式。

配置记录里还可以保存对应的恢复资料：动画设置的原值，输入法导出包、方案源文件和自定义补丁，以及各工具后端的启动方式和当前模式。

日常配置可以通过重新导入、改回设置等方式恢复，具体取决于备份和改动范围。固件降级涉及系统镜像与设备条件，需要另行评估。

## 参考资料

- [Fcitx5 for Android FAQ](https://fcitx5-android.github.io/faq/)、[0.1.3 备份与恢复源码](https://github.com/fcitx5-android/fcitx5-android/blob/0.1.3/app/src/main/java/org/fcitx/fcitx5/android/data/UserDataManager.kt)
- [雾凇拼音：Fcitx for Android 安装](https://github.com/iDvel/rime-ice/blob/main/others/docs/Installation.md#fcitx-for-android)
- [Rime：方案与配置](https://github.com/rime/home/wiki/RimeWithSchemata)
- [Shizuku 启动说明](https://shizuku.rikka.app/guide/setup/)、[Shizuku API](https://github.com/RikkaApps/Shizuku-API)
- [App Manager 官方文档](https://muntashir.dev/AppManager/en/)
- [Android 权限概览](https://developer.android.com/guide/topics/permissions/overview)、[READ_SMS 定义](https://developer.android.com/reference/android/Manifest.permission#READ_SMS)
- [AOSP PackageManager 权限标志](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/core/java/android/content/pm/PackageManager.java#5309)
- [Android 无障碍服务](https://developer.android.com/guide/topics/ui/accessibility/service)
- [Android Settings.Global](https://developer.android.com/reference/android/provider/Settings.Global)
- [Android Debug Bridge（ADB）](https://developer.android.com/tools/adb)
