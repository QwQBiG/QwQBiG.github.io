---
title: "运维"
date: 2025-11-18T12:00:00+08:00
tags: ["运维","k8s"]
categories: ["运维"]
---

# Kubernetes 第一周精细化学习笔记

## 核心思想篇：两大基石

### 1. 为何选择 Kubernetes？
单个 Docker 容器是孤立的。当容器数量增多，我们会面临一系列棘手的问题：

*   **故障恢复**：一个容器挂了怎么办？
*   **服务发现**：容器 B 如何找到容器 A 的 IP 地址？
*   **负载均衡**：如何将流量平均分配给多个相同的容器？
*   **扩缩容**：如何根据负载自动增加或减少容器数量？

Kubernetes (K8s) 就是一个**容器编排平台**，它以标准化的方式完美地解决了以上所有问题。

### 2. 命令式 vs. 声明式 (核心思想转变)
*   **命令式 (Imperative)**：你一步步告诉 K8s **“做什么”** (`kubectl create`, `kubectl scale`)。这就像手动驾驶，直观但难以追踪和重复。
*   **声明式 (Declarative)**：你向 K8s 提交一个 YAML 文件，告诉它你**“想要什么状态”**。这就像设定导航目的地，K8s 会自己想办法开车到达，并且如果偏离了航线（比如有 Pod 挂了），它会自动修正。**这是 K8s 的精髓，也是现代化的管理方式。**

---

## 环境搭建篇：Kind (Kubernetes in Docker)

在复杂的网络环境下，使用 Kind 搭建本地集群是最可靠、轻量且快速的方式。

### 1. 安装核心工具

1.  **安装 `kubectl` (K8s 命令行客户端)**
    ```bash
    # (根据官方文档，使用 apt 或其他包管理器安装)
    sudo apt-get update && sudo apt-get install -y kubectl
    ```

2.  **安装 Go 语言环境 (用于安装 Kind)**
    ```bash
    sudo apt-get install golang-go -y
    ```

3.  **设置 Go 国内代理并安装 `kind`**
    > 这是解决网络问题的关键，`goproxy.cn` 会加速模块下载。
    ```bash
    export GOPROXY=https://goproxy.cn,direct
    go install sigs.k8s.io/kind@v0.22.0
    sudo mv ~/go/bin/kind /usr/local/bin/
    ```
4.  **验证安装**
    ```bash
    kubectl version --client
    kind version
    ```

### 2. 编写 Kind 集群配置文件
这份文件解决了两个关键问题：**① K8s 核心组件镜像的拉取问题**；**② 虚拟机端口冲突问题**。

*   创建 `kind-config.yaml` 文件：
    ```bash
    nano kind-config.yaml
    ```
*   粘贴以下内容：
    ```yaml
    kind: Cluster
    apiVersion: kind.x-k8s.io/v1alpha4
    # 解决 K8s 核心组件镜像拉取问题
    kubeadmConfigPatches:
    - |
      apiVersion: kubeadm.k8s.io/v1beta3
      kind: ClusterConfiguration
      imageRepository: registry.aliyuncs.com/google_containers
    nodes:
    - role: control-plane
      kubeadmConfigPatches:
      - |
        kind: InitConfiguration
        nodeRegistration:
          kubeletExtraArgs:
            node-labels: "ingress-ready=true"
      # 解决宿主机端口占用问题，将 80/443 映射到高位端口
      extraPortMappings:
      - containerPort: 80
        hostPort: 52014
        protocol: TCP
      - containerPort: 443
        hostPort: 52015
        protocol: TCP
    ```

### 3. 启动与销毁集群

*   **启动集群**
    ```bash
    kind create cluster --config=kind-config.yaml
    ```
*   **验证集群就绪**
    ```bash
    kubectl get nodes
    # 预期输出一个名为 kind-control-plane 的节点，状态为 Ready
    ```
*   **销毁集群 (学习结束时)**
    ```bash
    kind delete cluster
    ```

---

## YAML 核心篇：Pod 的“蓝图”

### 1. YAML 四段式结构
*   `apiVersion`: API 版本，如 `v1`
*   `kind`: 资源类型，如 `Pod`
*   `metadata`: 元数据，包括 `name`, `namespace`, `labels`
*   `spec`: **期望状态**，定义了资源的核心属性

### 2. 单容器 Pod 示例
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-nginx-pod
spec:
  containers:
  - name: nginx-container
    image: nginx:1.22
    ports:
    - containerPort: 80
```
### 3. 多容器 Pod (Sidecar 模式) 与数据共享

通过 `volumes` 和 `volumeMounts` 实现一个 Pod 内多个容器间的文件共享。

-   `spec.volumes`: 在 Pod 层面定义一个共享存储卷（“储藏室”）。
-   `spec.containers[].volumeMounts`: 在容器层面将共享卷挂载到容器内的特定路径（“开一扇门到储藏室”）。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-container-demo
spec:
  # 1. 定义一个名为 "shared-html" 的共享卷
  volumes:
  - name: shared-html
    emptyDir: {}

  containers:
    # 容器一：Nginx
    - name: nginx-container
      image: nginx:1.22
      # 2. 将共享卷挂载到 Nginx 的网站根目录
      volumeMounts:
      - name: shared-html
        mountPath: /usr/share/nginx/html

    # 容器二：Busybox (Sidecar)
    - name: sidecar-container
      image: busybox:1.35
      command: ["/bin/sh", "-c", "while true; do date >> /var/log/index.html; sleep 5; done"]
      # 3. 将同一个共享卷挂载到 Busybox 的日志目录
      volumeMounts:
      - name: shared-html
        mountPath: /var/log
```

## 日常操作与调试篇 (`kubectl`)

### 1. 核心管理命令

-   **应用配置**: `kubectl apply -f [文件名.yaml]`
-   **删除资源**: `kubectl delete -f [文件名.yaml]` 或 `kubectl delete pod [pod名]`

### 2. 状态检查“三板斧”

1.  **`kubectl get` **: 快速查看资源列表和状态。
    -   `kubectl get pods`: 查看当前命名空间的 Pod。
    -   `kubectl get pods -n <命名空间>`: 查看指定命名空间的 Pod。
    -   `kubectl get pods -A`: 查看所有命名空间的 Pod。
    -   `kubectl get pods -o wide`: 查看更多信息（IP, 所在节点）。

2.  **`kubectl describe` **: 查看资源的详细信息和事件日志。
    -   `kubectl describe pod <pod名>`
    > **排错关键**：永远第一时间查看最下方的 `Events` 部分，它记录了 Pod 创建过程中的所有成功和失败信息。

3.  **`kubectl logs` : 查看容器内部的标准输出日志。
    -   `kubectl logs <pod名>`
    -   `kubectl logs <pod名> -c <容器名>`: 查看多容器 Pod 中特定容器的日志。
    -   `kubectl logs <pod名> --previous`: 查看上一次崩溃退出的容器的日志。

### 3. 交互命令

-   **`kubectl exec` **: 进入一个正在运行的容器内部。
    ```bash
    kubectl exec -it <pod名> -c <容器名> -- /bin/bash
    ```

### 4. 资源组织

-   **Namespace (文件夹)**: 用于逻辑隔离。
    -   创建: `kubectl create namespace <命名空间名>`
    -   删除: `kubectl delete namespace <命名空间名>` (会删除其内部所有资源)

-   **Labels & Selectors (标签与筛选器)**: 用于对资源进行分组和筛选。
    -   在 `metadata.labels` 中定义键值对。
    -   使用 `-l` 参数进行筛选: `kubectl get pods -l app=my-app,env=prod`

---

## 实战排错篇：网络问题终极方案

### 问题现象: `ImagePullBackOff` / `ErrImagePull`

Pod 状态显示拉取镜像失败，`describe` 事件中提示 `i/o timeout` 或 `not found`。

### 方案一：(推荐) 修改 YAML，使用国内镜像源

直接在 YAML 的 `image` 字段中使用国内的、可访问的镜像地址。

```yaml
spec:
  containers:
  - name: redis-container
    # 原镜像: image: redis:7.0
    # 修改后:
    image: m.daocloud.io/docker.io/library/redis:7.0
```

### 方案二：(极端网络环境下的杀手锏) 本地加载

当所有镜像源都无法从 Kind 节点内部访问时，采用“主机下载，加载进集群”的策略。

1.  **在主机 (Ubuntu VM) 上拉取镜像**

    ```bash
    docker pull m.daocloud.io/docker.io/library/redis:7.0
    ```

2.  **为镜像打上官方标签 (关键步骤！)**
    > K8s Pod 的 YAML 里使用的是官方短名称，所以必须打这个标签。

    ```bash
    docker tag m.daocloud.io/docker.io/library/redis:7.0 redis:7.0
    ```

3.  **将打好标签的镜像加载进 Kind 集群**

    ```bash
    kind load docker-image redis:7.0
    ```

4.  **最后，使用包含官方短名称 (`image: redis:7.0`) 的 YAML 文件进行部署。** K8s 会直接使用节点上的本地镜像，不再进行网络拉取。