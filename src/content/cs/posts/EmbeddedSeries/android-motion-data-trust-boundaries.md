---
title: "校园运动数据：定位、传感器与可信边界"
description: "从一次设备实验出发，梳理 Android 定位与传感器的数据链、时间戳、只读观测方法，以及系统异常的证据边界。"
date: 2026-11-08T18:00:00+08:00
tags: ["Android", "传感器", "定位", "技术复盘"]
categories: ["嵌入式"]
series: ["成就-来硬的"]
draft: false
---

## 一、先把这次记录的范围说清楚

拿到设备的临时系统权限之后，我又尝试干预了一款第三方校园运动应用接收到的定位和运动数据。折腾过程中，应用里的数值和记录状态发生过变化，也出现了应用退出、系统中断和日常功能异常。这篇留下的是对这些现象的复盘。

实验没有对应的真实跑步过程，界面显示或保存的记录不能作为完成锻炼的证明。这里省略了平台标识、具体参数、实现代码和操作步骤，只保留数据关系与设备现象。省略细节不改变实际行为的性质；是否符合规定，仍需结合授权范围、平台和学校规则及现行法律判断，相关法律原文见文末。

下面先拆开几种数据，再沿着 Android 的传感器栈看它们怎样到达应用。后面的只读示例用于说明如何在自己的测试工程里观察事件，不是原实验的实现，也没有接入任何第三方运动服务。

## 二、位置在变化，不等于身体在运动

### 2.1 一个位置对象里不只有经纬度

定位数据描述的是设备被报告在什么位置。它还带有时间、精度等信息，应用据此组织地图上的点。运动传感器则提供另一类测量：加速度计记录加速度，陀螺仪记录旋转变化，计步读数又有自己的含义。Android 的[运动传感器文档](https://developer.android.com/develop/sensors-and-location/sensors/sensors_motion)分别说明了这些数据。地图上出现一条线，不能替其他读数回答“人是否真的在跑”。

阅读 `Location` 时，除了坐标，还应看数据的新旧程度、提供者，以及 `hasAccuracy()`、`hasSpeed()` 这样的字段有效性检查。缺少速度与速度为零是两种状态，不能都填成 `0` 再比较。定位源之间的精度和更新行为也可能不同，坐标变化本身不足以描述整次测量。

`getAccuracy()` 表示以米计的水平精度估计半径，官方定义对应 68% 的置信水平；它不是“真实位置一定在这个圆里”的承诺。地图上的点和精度圆都应连同时间一起读，具体字段语义见 [`Location` 文档](https://developer.android.com/reference/android/location/Location#getAccuracy())。

模拟定位的标识也要按它本来的含义理解。官方对 [`Location.isMock()`](https://developer.android.com/reference/android/location/Location#isMock()) 的说明是：它返回这个位置是否被标记为模拟位置；对于框架提供的位置，这与测试位置提供者有关。这个接口的返回值本身，并不是对现实中某次运动的完整认证。

### 2.2 加速度、转动和步数不是同一种量

这次记录里就有这种分离：位置在地图上变化时，运动读数没有相应变化。后来，应用里的运动数值出现了，设备提供的计步读数却没有同步变化。它们表面上都与“走了多少”有关，实际并不是同一份测量结果。仅凭其中一个界面，无法确认其他数据的状态。

<div role="region" aria-label="运动传感器读数含义" tabindex="0" style="overflow-x: auto;">
<div style="min-width: 32rem;">

| 类型 | 读到的是什么 | 比较时要注意什么 |
|---|---|---|
| 加速度计 | 三轴加速度，单位 `m/s²`，包含重力分量 | 静放时不应期待三轴全为零 |
| 线性加速度 | 去除重力后的三轴加速度，单位 `m/s²` | 可能依赖融合估计，不等于另一颗独立芯片的原始值 |
| 重力传感器 | 估计的重力方向和大小，单位 `m/s²` | 设备姿态变化会改变各轴分量 |
| 陀螺仪 | 三轴角速度，单位 `rad/s` | 它描述转动，不能直接当成位移或步数 |
| 计步器 | `TYPE_STEP_COUNTER` 的累计步数 | 按官方定义自上次重启起、激活期间累计，不是当前页面的本次运动步数 |

</div>
</div>

传感器坐标通常固定在设备上，不能随着页面转成横屏就直接交换日志里的轴。比较两个时段时，要记录手机的放置方向；三轴向量的模长可以帮助排除部分姿态差异，但它会丢掉方向信息，也不能据此独立判定某种活动。

计步器还涉及会话边界：同一轮开机、有效采集区间内的两个累计值可以相减，重启前后的累计值则不能直接拼接。Android 10 及以上的计步访问还涉及 `ACTIVITY_RECOGNITION` 权限，设备是否支持也要先检查。本文下面的示例只读取加速度计和陀螺仪，不读取计步数据。

## 三、事件怎样从硬件到达应用

理解共享数据的影响范围，可以先看 AOSP 的[传感器栈](https://source.android.com/docs/core/interaction/sensors/sensor-stack)：

```text
物理传感器 / 可选的传感器中枢
              ↓
        设备实现与 HAL
              ↓
       Android 系统框架
              ↓
    应用的 SensorManager / 监听器
              ↓
       应用自己的计算和界面
```

HAL 是硬件抽象层，衔接设备实现与系统框架，并不等同于某一个驱动。框架负责协调多个应用的订阅；同一传感器可以同时服务不同应用，各应用的请求会影响底层采用的采样和交付安排。应用按 SDK 注册监听器，并不意味着它独占了那颗传感器。

“Android 传感器”也不都与一颗物理芯片一一对应。有的类型来自硬件，有的由其他测量值组合计算；具体架构由设备厂商选择，见 AOSP 的[传感器概述](https://source.android.com/docs/core/interaction/sensors)。所以，应用里的两个名称相近的读数，既可能来自不同计算，也可能共享上游测量，不能仅凭名称推断它们独立。

这也解释了为什么实验中应同时检查日常功能：应用自己的计算与共享系统链中的变化，影响范围可能完全不同。本次出现的自动旋转异常，需要作为设备整体状态的一部分记录。

## 四、采样时间与收到回调的时间

一次传感器回调至少涉及两个时刻：事件本身的 `timestamp`，以及应用实际处理它的时刻。前者以纳秒表示，与 `SystemClock.elapsedRealtimeNanos()` 使用相同时间基准；它不是日历时间，不能拿来直接减 `System.currentTimeMillis()`。同一设备、同一轮开机内，可以比较同一种传感器相邻事件的时间差，或计算回调读取时刻与事件时间戳之差，见 [`SensorEvent.timestamp`](https://developer.android.com/reference/android/hardware/SensorEvent#timestamp)。

两种差值回答不同问题：

```text
相邻事件间隔 = 当前事件 timestamp − 上一事件 timestamp
回调到达差值 = 回调中 elapsedRealtimeNanos() − 当前事件 timestamp
```

前者帮助观察实际采样间隔，后者还混合了传输、系统分发和应用排队等影响，不能直接称为传感器硬件延迟。定位对象的 `elapsedRealtimeNanos` 也适合在同一时间基准下比较新旧程度；跨设备、跨重启则需要另行对时。

例如，假设两条事件相隔 40 ms，却在一次排队之后近乎连续地到达回调。如果只按回调执行时刻计算频率，会把短暂的集中交付误认为采样突然变快。这里的数字只是解释时间差的例子，不是本次设备的测量结果。

注册时传入的 `samplingPeriodUs` 是请求间隔，`maxReportLatencyUs` 与允许批量交付的延迟有关，它们不是同一个参数；也不能认为所有设备都会严格按请求值交付。实际分析应使用事件时间戳。相关 API 语义见 [`SensorManager.registerListener()`](https://developer.android.com/reference/android/hardware/SensorManager#registerListener(android.hardware.SensorEventListener,android.hardware.Sensor,int,int))。

## 五、一个只读的前台观测示例

下面是一段补充教学代码，放在自己的 Android 测试工程中。新建 Kotlin 文件时保留自己工程的 `package` 声明，并按完整类名在 Manifest 声明这个 Activity。它只订阅加速度计与陀螺仪，把少量结果显示在当前页面内存中，不申请位置权限，不读取其他应用，也不把数据写入第三方服务。

```kotlin
import android.app.Activity
import android.hardware.*
import android.os.*
import android.widget.ScrollView
import android.widget.TextView

class MotionObserveActivity : Activity(), SensorEventListener {
    private lateinit var manager: SensorManager
    private lateinit var output: TextView
    private val mainHandler = Handler(Looper.getMainLooper())
    private val counts = mutableMapOf<Int, Int>()
    private val previous = mutableMapOf<Int, Long>()
    private var startedAt = 0L
    private var active = false
    private val names = mapOf(
        Sensor.TYPE_ACCELEROMETER to "accel",
        Sensor.TYPE_GYROSCOPE to "gyro"
    )

    override fun onCreate(state: Bundle?) {
        super.onCreate(state)
        manager = getSystemService(SENSOR_SERVICE) as SensorManager
        output = TextView(this).apply { textSize = 12f }
        setContentView(ScrollView(this).apply { addView(output) })
    }

    override fun onResume() {
        super.onResume()
        active = true
        counts.clear()
        previous.clear()
        startedAt = SystemClock.elapsedRealtimeNanos()
        output.text = "每种最多20条；accel:m/s²，gyro:rad/s；时间:ms\n"
        for ((type, name) in names) {
            val sensor = manager.getDefaultSensor(type)
            when {
                sensor == null -> output.append("$name: 设备不支持\n")
                !manager.registerListener(this, sensor,
                    SensorManager.SENSOR_DELAY_NORMAL, mainHandler) ->
                    output.append("$name: 注册失败\n")
                else -> output.append("$name: 已注册\n")
            }
        }
    }

    override fun onPause() {
        active = false
        manager.unregisterListener(this)
        super.onPause()
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (!active) return
        val type = event.sensor.type
        val count = counts[type] ?: 0
        if (count >= 20) return
        val vector = event.values.copyOf()
        val now = SystemClock.elapsedRealtimeNanos()
        val dt = previous.put(type, event.timestamp)?.let {
            (event.timestamp - it) / 1_000_000.0
        }
        output.append("${names[type]} elapsed=${(now - startedAt) / 1e6} " +
            "dt=${dt ?: "n/a"} lag=${(now - event.timestamp) / 1e6} " +
            "accuracy=${event.accuracy} xyz=${vector.take(3)}\n")
        counts[type] = count + 1
        if (count + 1 == 20) manager.unregisterListener(this, event.sensor)
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit
}
```

`elapsed` 是本次前台会话经过的时间，`dt` 是同一种传感器的相邻事件间隔，首条事件没有前项，因此显示 `n/a`；`lag` 是上节所说的回调到达差值。`accuracy` 是状态码，不是误差百分比。示例先复制 `values`，因为框架可能复用事件对象；把原数组直接存起来，可能在后面的回调中读到变化后的内容，见 [`SensorEventListener` 说明](https://developer.android.com/reference/android/hardware/SensorEventListener#onSensorChanged(android.hardware.SensorEvent))。

每种传感器最多显示 20 条后解除订阅，离开前台时再统一注销。回调只做短小的内存处理，不写文件或发网络请求；这也是为什么它没有后台采集服务。`getDefaultSensor()` 返回空和 `registerListener()` 返回失败都在界面明确显示，不能把“不支持”或“没有注册成功”误当成“数值一直为零”。

这个示例用于理解事件格式与生命周期，已做 Kotlin 与 Android SDK 的静态编译核对，尚未进行 APK 打包与真机采样验证，也没有测量原应用如何使用这些数据。它与前面描述的历史实验需要分开看。

## 六、没有观察到调用，能说明多少

排查时，我选过一些观察点，希望借调用情况理解应用如何处理数据。有的地方没有记录到调用，有的尝试则让应用弹出保护提示后退出。这些结果确实帮助我缩小了当时的排查范围，但不能据此还原应用的全部逻辑。

没有观察到调用，只说明那次运行、那个观察点和那段时间里没有捕获到它。条件分支没有走到、数据来自别的路径，或者观察方式本身没有覆盖到，都仍是可能性。原记录不足以把这些情况逐一排除。同样，遇到一次保护提示，可以确认那次尝试被拒绝，不能顺势推断其他路径就没有保护。

### 6.1 先确认观测程序本身工作正常

在自己的测试程序里，可以先检查传感器是否存在、注册是否成功、监听器是否仍处于前台，再讨论读数。否则“没有回调”可能只是监听器没注册；把它解释成设备没有生成数据，会跳过最前面的证据缺口。

随后做几个短小的对照：保持设备静置，记录轴向和时间；只改变放置方向，观察向量分量；再退出前台，确认自己的监听器注销。每次只改一个条件，保留相同的机型、系统版本和观测代码。静置、转动和生命周期是在验证不同问题，不应混在一次操作里再猜原因。

### 6.2 把现象与原因分列

下面按原记录中的现象列出待核实项，没有补造当时未保存的日志或测量：

<div role="region" aria-label="实验现象与待核实证据" tabindex="0" style="overflow-x: auto;">
<div style="min-width: 32rem;">

| 已记录的现象 | 还需要的证据 | 目前不能直接推出 |
|---|---|---|
| 应用数值变化，设备计步读数未同步变化 | 同一时间段的两侧读数、采集状态和会话起点 | 已经掌握完整的运动计算规则 |
| 结束工具后桌面重新加载 | 异常时段的进程、崩溃与开机时间记录 | 已确定某种内存失效机制 |
| 自动旋转出现异常 | 对照设备姿态、传感器事件与系统设置 | 单凭界面现象就定位到某个服务或芯片 |

</div>
</div>

这种写法能让下一次分析有明确目标。观察点没有命中、符号没有导出，或者某次运行没有提示异常，都应连同观测范围记录；它们本身不足以证明实现不存在或保护失效。

## 七、最值得留下的是系统出问题的那几次

### 7.1 桌面重载不等于已经证明整机重启

一次强行结束实验工具后，桌面重新加载，系统原先的运行状态也被打断。原记录把这次问题归因于运行时改动没有安全退出，但仅凭留下的现场描述，还不足以确认具体在哪一步失效。可以确认的是，影响已经超出了实验工具自身。

排查时应区分应用退出、系统进程重建和整机重启。应用 PID 变化只能说明该进程的身份变了；是否出现新的开机过程，还应对照系统开机计时和对应日志。视觉上同样回到桌面，背后的失效范围可能很不一样。工具界面消失、进程结束、运行时变化撤销，也分别需要证据。

### 7.2 从崩溃记录里找具体线索

Android 的 [`logcat`](https://developer.android.com/tools/logcat) 有环形缓冲区，旧记录可能被后续消息覆盖。对自己的测试应用，可以先在 Android Studio 选定对应进程和时间范围，区分普通应用日志、系统日志与 `crash` 缓冲区中的异常信息；“日志里没看到”还要结合过滤条件、权限和保存时机判断。

如果获得了相应权限范围内的原生崩溃记录，可以按下面顺序阅读：先确认进程、线程和发生时间，再看信号及附加消息，随后对应崩溃线程调用栈和匹配构建的符号信息。`SIGABRT` 常见于主动终止，`SIGSEGV` 指向内存访问类故障，但信号名称不是完整根因；调用栈也需要结合出错地址和现场解释。AOSP 的[原生崩溃诊断](https://source.android.com/docs/core/tests/debug/native-crash)展示了这些证据如何关联。

tombstone 比一行报错更详细，可能包含其他线程栈、内存映射和部分内存内容；能否取得它取决于设备构建和访问权限，本文不提供获取受限文件的绕过方法。本次原记录没有保存足够现场材料，因此不能把“工具结束以后出问题”进一步写成已证实的具体内存机制。

### 7.3 功能退化也属于结果

另一个明显副作用是屏幕自动旋转受到影响。运动读数之外的日常功能也出现异常，说明这次改动的影响范围超过了目标应用。共享的系统数据链会被其他功能使用，自动旋转异常就是这次记录里明确的稳定性退化。

系统中断以后还出现过状态错位：权限状态仍在，原先预期的数据变化却已经消失。重启之后，临时权限和运行环境又需要重新确认。这让我意识到，一个“已启动”或“权限正常”的状态并不足以概括设备当前的情况。权限是否存在、组件是否存活、数据是否到达，是不同的问题。

对于上面的只读示例，退出时注销监听器就是应用自身的收尾动作；历史实验涉及的共享运行环境是否恢复，则不能只靠一个按钮状态来判断。应分别检查组件是否存活、数据是否恢复、自动旋转等日常功能是否正常。本次记录没有覆盖跨机型验证，不能把这些现象扩展为所有 Android 设备的必然行为。

## 八、这份记录留下了什么

把这次过程压缩成“成功”两个字，会丢掉几项具体结果：应用里的运动数值与设备计步读数不一致；结束工具后发生过系统中断；自动旋转受到影响；部分运行时状态需要重新确认。

对于应用的内部判定，我也只能保留有限判断。界面接受了一条记录，不等于掌握了完整的判定规则；某次运行没有提示异常，不等于以后不会复核，更不能据此评价整个系统的防护能力。原记录没有覆盖的部分，就应当留空。

这些现象适合作为后续分析的线索。要解释它们，还需要对应时间段的日志、崩溃信息和各层读数；现有记录没有保存完整证据，具体失效原因也就只能保留为待确认问题。

公开技术记录时，接口语义、自己的观测代码和必要的异常摘要都可以讲清楚；针对真实服务的输入改写、规避实现与有效记录参数没有放进本文。是否涉及法律责任，需要结合具体行为判断，不能因删去名称就获得许可。现行《网络安全法》第 28、29 条涉及安全信息发布和危害网络安全行为，不能反过来概括成“读取自己手机上的普通传感器就违法”。

日志也不应整份上传。能够关联到个人的精确时间、位置、账号和行踪片段需要另行处理；《个人信息保护法》第 28 条将行踪轨迹列为敏感个人信息，是否属于个人信息还要结合第 4 条的可识别性判断。因此本文保留数据类型和相对时间的讲解，不公开个人活动轨迹或完整转储。

## 参考资料

- [Android Developers：Location](https://developer.android.com/reference/android/location/Location)
- [Android Developers：Motion sensors](https://developer.android.com/develop/sensors-and-location/sensors/sensors_motion)
- [Android Developers：Sensors overview](https://developer.android.com/develop/sensors-and-location/sensors/sensors_overview)
- [Android Developers：SensorEvent](https://developer.android.com/reference/android/hardware/SensorEvent)
- [Android Developers：SensorEventListener](https://developer.android.com/reference/android/hardware/SensorEventListener)
- [Android Developers：SensorManager](https://developer.android.com/reference/android/hardware/SensorManager)
- [Android 10：Physical activity recognition](https://developer.android.com/about/versions/10/privacy/changes#physical-activity-recognition)
- [Android Open Source Project：Sensor stack](https://source.android.com/docs/core/interaction/sensors/sensor-stack)
- [Android Open Source Project：Sensors](https://source.android.com/docs/core/interaction/sensors)
- [Android Developers：Logcat command-line tool](https://developer.android.com/tools/logcat)
- [Android Open Source Project：Diagnose native crashes](https://source.android.com/docs/core/tests/debug/native-crash)
- [《中华人民共和国网络安全法》（2025 年修正，国家互联网信息办公室公开全文）](https://www.cac.gov.cn/2025-12/29/c_1768735112911946.htm)
- [《中华人民共和国个人信息保护法》（国家互联网信息办公室公开全文）](https://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm)
