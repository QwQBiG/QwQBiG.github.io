---
title: "运维"
date: 2025-11-18T12:00:00+08:00
tags: ["运维","k8s"]
categories: ["运维"]
---

# Kubernetes 学习笔记 1

## 核心思想篇：两大基石

### 1. 为何选择 Kubernetes？
单个 Docker 容器是孤立的。当容器数量增多，我们会面临一系列棘手的问题：

*   **故障恢复**：一个容器挂了怎么办？
*   **服务发现**：容器 B 如何找到容器 A 的 IP 地址？
*   **负载均衡**：如何将流量平均分配给多个相同的容器？
*   **扩缩容**：如何根据负载自动增加或减少容器数量？

Kubernetes (K8s) 就是一个**容器编排平台**，它以标准化的方式完美地解决了以上所有问题。

### 2. 命令式 vs. 声明式 (转变)
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

1.  -   `kubectl get` : 快速查看资源列表和状态。
    -   `kubectl get pods`: 查看当前命名空间的 Pod。
    -   `kubectl get pods -n <命名空间>`: 查看指定命名空间的 Pod。
    -   `kubectl get pods -A`: 查看所有命名空间的 Pod。
    -   `kubectl get pods -o wide`: 查看更多信息（IP, 所在节点）。

2.  -   `kubectl describe` : 查看资源的详细信息和事件日志。
    -   `kubectl describe pod <pod名>`
    > **排错关键**：永远第一时间查看最下方的 `Events` 部分，它记录了 Pod 创建过程中的所有成功和失败信息。

3.  -   `kubectl logs` : 查看容器内部的标准输出日志。
    -   `kubectl logs <pod名>`
    -   `kubectl logs <pod名> -c <容器名>`: 查看多容器 Pod 中特定容器的日志。
    -   `kubectl logs <pod名> --previous`: 查看上一次崩溃退出的容器的日志。

### 3. 交互命令

-   `kubectl exec` : 进入一个正在运行的容器内部。
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

### 方案二：(极端网络环境) 本地加载

当所有镜像源都无法从 Kind 节点内部访问时，采用“主机下载，加载进集群”的策略。

1.  **在主机 (Ubuntu VM) 上拉取镜像**

    ```bash
    docker pull m.daocloud.io/docker.io/library/redis:7.0
    ```

2.  **为镜像打上官方标签 (关键)**
    > K8s Pod 的 YAML 里使用的是官方短名称，所以必须打这个标签。

    ```bash
    docker tag m.daocloud.io/docker.io/library/redis:7.0 redis:7.0
    ```

3.  **将打好标签的镜像加载进 Kind 集群**

    ```bash
    kind load docker-image redis:7.0
    ```

4.  **最后，使用包含官方短名称 (`image: redis:7.0`) 的 YAML 文件进行部署。** K8s 会直接使用节点上的本地镜像，不再进行网络拉取。

---

# Kubernetes 学习周报 2

## 核心主题：从"裸砖"到"自动化建筑" - Pod 的高级管理

从管理单个、脆弱的 Pod，过渡到使用 Deployment 和 Service 来部署、管理和暴露真正健壮、高可用的应用。

## 第一部分：环境搭建与镜像管理（基础）

### 1. 搭建本地 Kubernetes (Kind) 环境

**目标：** 在本地快速搭建一个功能完整的 K8s 集群用于学习和实验。

**工具：** Kind (Kubernetes in Docker)，它将 K8s 节点作为 Docker 容器运行，启动快，资源占用少。

**关键步骤：**

**安装 kind CLI：**

```bash
# 推荐：为 Go 语言设置国内代理，然后通过 go install 安装
export GOPROXY=https://goproxy.cn,direct
go install sigs.k8s.io/kind@v0.22.0
sudo mv ~/go/bin/kind /usr/local/bin/
```

> **备注：** 这是解决国内网络环境下 kind 程序下载困难的最佳实践。GOPROXY 环境变量是关键。

**编写 kind-config.yaml 配置文件：**

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  # 关键配置1: 端口映射，用于后续从主机访问 NodePort 服务
  extraPortMappings:
  - containerPort: 30007 # Kind 节点(容器)内部的端口
    hostPort: 8080      # 映射到宿主机(VM或物理机)的端口
    protocol: TCP
# 关键配置2: 指定 K8s 核心组件的镜像仓库
kubeadmConfigPatches:
- |
  apiVersion: kubeadm.k8s.io/v1beta3
  kind: ClusterConfiguration
  imageRepository: registry.aliyuncs.com/google_containers
```

**解释：**

- `extraPortMappings`：提前规划端口，解决 NodePort 服务在复杂网络环境下（如VM、远程服务器）难以直接访问的问题。
- `imageRepository`：将 K8s 核心组件的镜像源指向国内的阿里云，从根本上解决了因网络问题导致的集群创建失败。

**创建集群：**

```bash
kind create cluster --config=kind-config.yaml
```

## 2. 镜像管理：一劳永逸的"镜像预加载"SOP

**问题背景：** 在受限的网络环境中，K8s 节点（Kubelet）无法直接从 Docker Hub 等官方源拉取应用镜像，导致 Pod 状态卡在 ImagePullBackOff 或 ErrImagePull。

**核心思想：** 既然 K8s 节点自己"出不去"，我们就在网络通畅的主机上把镜像准备好，然后强行"塞"给它。

**标准操作流程 (SOP)：**

**【拉取】** 在主机终端，从可靠的国内镜像源（如 m.daocloud.io）拉取镜像。
```bash
docker pull m.daocloud.io/docker.io/library/nginx:1.22
```

**【标记】** 为拉取下来的镜像打上官方的"短名称"标签。这是为了让镜像名与 YAML 文件中的 image 字段完全匹配。
```bash
docker tag m.daocloud.io/docker.io/library/nginx:1.22 nginx:1.22
```

**【加载】** 使用 kind load 命令，将主机上的镜像复制到 Kind 集群的内部镜像仓库中。

```bash
kind load docker-image nginx:1.22
```

> **备注：** 养成习惯，在部署任何包含新镜像的应用前，都先执行此"三部曲"。这能 100% 避免因镜像拉取失败导致的部署问题，极大提高学习和实验效率。

## 第二部分：核心控制器 - Deployment

### 1. 为何需要 Deployment：告别"裸Pod"

**"裸Pod"的脆弱性：** 直接创建的 Pod，在被删除、所在节点宕机或自身进程崩溃后，会永久消失，导致服务中断。

**Deployment 的价值：**

- **高可用性 (自愈能力):** Deployment 通过管理 ReplicaSet，确保始终有预定数量的 Pod 副本在运行。当有 Pod 意外消失时，它会自动创建一个新的来替代。
- **可伸缩性:** 可以轻松地增加或减少 Pod 的副本数量，以应对流量变化。
- **声明式更新:** 提供强大的滚动更新和回滚机制，实现应用的平滑发布和快速修复。

### 2. 编写 Deployment YAML

```yaml
apiVersion: apps/v1 # Deployment 属于 apps API 组
kind: Deployment
metadata:
  name: my-app # Deployment 的名字
spec:
  replicas: 3   # 期望状态：需要 3 个 Pod 副本

  # selector: 定义了 Deployment 如何"识别"它应该管理的孩子(Pod)
  selector:
    matchLabels:
      app: my-app # 匹配所有带有 "app: my-app" 标签的 Pod

  # template: Pod 的"出生模板"
  template:
    metadata:
      # 关键：模板中的 Pod 必须带有能与 selector 匹配的标签
      labels:
        app: my-app
    spec:
      # 这里是标准的 Pod.spec 定义
      containers:
      - name: nginx
        image: nginx:1.22
        ports:
        - containerPort: 80
```

> **核心关系解释：** Deployment 通过 spec.selector 来找到并管理 Pods。ReplicaSet (由 Deployment 自动创建) 则根据 spec.template 来创建新的 Pod。template.metadata.labels 和 selector.matchLabels 之间的匹配是它们能协同工作的关键。

### 3. 核心运维操作

**部署与查看：**
```bash
kubectl apply -f <deployment.yaml>
kubectl get deployment
kubectl get replicaset # 查看 Deployment 创建的 rs
kubectl get pods       # 查看 rs 创建的 pods
```

**伸缩 (Scaling)：**

- **命令式 (快速):** `kubectl scale deployment my-app --replicas=5`
- **声明式 (推荐):** 修改 YAML 文件中的 `replicas` 字段，然后重新 `kubectl apply`

**滚动更新 (Rolling Update)：**

1. 修改 YAML 文件中的 `template.spec.containers[0].image` 字段为新版本
2. 执行 `kubectl apply -f <deployment.yaml>`
3. 监控更新过程：
```bash
# 实时观察 Pod 的增删交替过程
kubectl get pods -w
# 查看官方的滚动更新状态报告
kubectl rollout status deployment/my-app
```

**回滚 (Rollback)：**

- 查看历史版本：`kubectl rollout history deployment/my-app`
- 一键回滚到上一个版本：`kubectl rollout undo deployment/my-app`
- 回滚到指定版本：`kubectl rollout undo deployment/my-app --to-revision=<NUMBER>`

## 第三部分：服务发现 - Service

### 1. 为何需要 Service：解决 Pod 的"动态"问题

**问题背景：** Deployment 管理的 Pod IP 地址是动态的、不固定的，且 Pod 会随时被销毁和重建。应用之间无法直接通过 Pod IP 进行可靠通信。

**Service 的价值：** 为一组功能相同的 Pod 提供一个稳定、统一的访问入口。它有固定的虚拟 IP (ClusterIP) 和 DNS 名称，并能自动对后端的健康 Pod 进行负载均衡。

### 2. Service 类型与实践

#### ClusterIP (默认类型 - 对内交通)

**用途：** 用于集群内部服务之间的通信，是构建微服务架构的基础。

**YAML 示例：**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-svc # Service 的名字，也是内部的 DNS 名
spec:
  type: ClusterIP # 可省略
  # selector: Service 如何找到它要代理的 Pod
  selector:
    app: my-app # 匹配所有带 "app: my-app" 标签的 Pod
  ports:
  - port: 80         # Service 自身监听的端口
    targetPort: 80   # 转发到后端 Pod 容器的目标端口
```

**测试方法：** 启动一个临时的调试 Pod，通过 Service 的 DNS 名称访问。

```bash
# 启动临时 Pod 并进入 shell
kubectl run tester --rm -it --image=busybox:1.35 -- /bin/sh
# 在临时 Pod 内部访问
/ # wget -O- http://my-app-svc
```

#### NodePort (对外暴露 - 开发/测试用)

**用途：** 在 ClusterIP 的基础上，在集群的每个节点上都暴露一个相同的静态端口（30000-32767），从而允许从集群外部访问。

**YAML 示例 (在 ClusterIP 基础上修改)：**
```yaml
spec:
  type: NodePort # 明确指定类型
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30007 # 可选，手动指定一个端口方便访问
```

**测试方法：**
1. 获取节点的 IP 地址 (对于 Kind in VM，是 VM 的 IP)
2. 在本地浏览器中访问 `http://<Node-IP>:<NodePort>`

#### kubectl port-forward (终极调试工具)

**用途：** 当 NodePort 因复杂的网络环境（防火墙、云安全组）无法访问时，这是最可靠的本地调试方法。

**原理：** 在本地机器和指定的 Pod/Service 之间建立一个安全的流量转发隧道。

**使用方法：**
```bash
# 在一个终端中运行，它会阻塞
kubectl port-forward svc/my-app-svc 8888:80
# 在另一个终端中，访问本地的 8888 端口
curl http://localhost:8888
```

---

# Kubernetes 学习周报 3

## 核心思想：十二因子应用 (The Twelve-Factor App)

本周所有学习内容的理论基石，源于云原生开发的最佳实践，特别是第三条：**在环境中存储配置**。

**目标：** 将配置 (Config) 与代码/镜像彻底分离。

**优势：**
- **高效：** 修改配置无需重新构建镜像。
- **灵活：** 同一个镜像可以无缝部署到不同环境（开发、测试、生产）。
- **安全：** 敏感信息（如密码）不会被硬编码到镜像中。

**Kubernetes 解决方案：**
- 非敏感配置：**ConfigMap**
- 敏感配置：**Secret**
- 运行时数据/文件：**Volume**

## 一、ConfigMap：非敏感配置管理

ConfigMap 以键值对（key-value）的形式存储非敏感的配置数据。

### 1. 创建 ConfigMap

**方式A：从字面值创建** (适用于少量、简单的键值对)
```bash
# 格式: kubectl create configmap <NAME> --from-literal=<KEY1>=<VALUE1> ...
kubectl create configmap my-app-config --from-literal=APP_COLOR=blue --from-literal=APP_GREETING="Hello World"
```

**方式B：从文件创建** (适用于已有的配置文件)
```bash
# 1. 先创建本地文件
echo "APP_MODE=production" > app.properties

# 2. 从文件创建ConfigMap (文件名将作为key，文件内容作为value)
kubectl create configmap my-app-config-from-file --from-file=app.properties
```

## 2. 使用 ConfigMap

### 方式一：作为环境变量注入 Pod

这是最符合"十二因子"理念的方式。Kubelet 在启动容器前，会将指定的 ConfigMap 值设置为容器的环境变量。

**pod-with-cm-env.yaml 示例：**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-cm-env
spec:
  containers:
  - name: test-container
    image: busybox:1.35
    # 严谨的 echo 命令，用 \"...\" 包围变量以处理空格
    command: [ "/bin/sh", "-c", "echo The app color is $APP_COLOR and the greeting is \"$APP_GREETING\"; sleep 3600" ]
    env:
    - name: APP_COLOR      # 在容器中定义的环境变量名
      valueFrom:
        configMapKeyRef:   # 引用一个ConfigMap的key
          name: my-app-config # ConfigMap的名字
          key: APP_COLOR    # ConfigMap中的key
    - name: APP_GREETING
      valueFrom:
        configMapKeyRef:
          name: my-app-config
          key: APP_GREETING
```

**部署与验证：**
```bash
# 部署前，必须先创建依赖的ConfigMap
kubectl create configmap my-app-config --from-literal=APP_COLOR=blue --from-literal=APP_GREETING="Hello World"
# 部署Pod
kubectl apply -f pod-with-cm-env.yaml
# 查看日志验证
kubectl logs pod-cm-env
```
### 方式二：作为文件挂载到 Pod

适用于需要读取传统配置文件的应用。

**pod-with-cm-volume.yaml 示例：**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-cm-volume
spec:
  containers:
  - name: test-container
    image: busybox:1.35
    command: [ "/bin/sh", "-c", "cat /etc/config/app.properties; sleep 3600" ]
    # 步骤2: 把下面定义的Volume挂载到容器的指定路径
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
  # 步骤1: 在Pod层面定义一个Volume，数据来源是ConfigMap
  volumes:
  - name: config-volume
    configMap:
      name: my-app-config-from-file
```

## 二、Secret：敏感信息管理

Secret 专用于存储密码、API密钥等敏感数据。其使用方式与 ConfigMap 几乎完全一样，但有关键区别。

**核心区别：**
- **用途：** 专用于敏感数据。
- **编码：** 值默认进行 Base64 编码（注意：不是加密！）。
- **安全：** K8s 会对其提供更强的安全机制（如静态加密、访问控制、内存存储等）。

### 1. 创建 Secret
```bash
# 格式: kubectl create secret generic <NAME> --from-literal=<KEY1>=<VALUE1> ...
kubectl create secret generic db-credentials --from-literal=username=admin --from-literal=password='S3cr3tP@ssw0rd!'
```

## 2. 使用 Secret

与 ConfigMap 类似，仅需将 `configMapKeyRef` 替换为 `secretKeyRef`，或将 `configMap:` 替换为 `secret:`。

**pod-with-secret.yaml (环境变量注入) 示例：**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-secret
spec:
  containers:
  - name: test-container
    image: busybox:1.35
    command: [ "/bin/sh", "-c", "echo User is $DB_USER and Password is \"$DB_PASS\"; sleep 3600" ]
    env:
    - name: DB_USER
      valueFrom:
        secretKeyRef: # <-- 关键区别
          name: db-credentials
          key: username
    - name: DB_PASS
      valueFrom:
        secretKeyRef: # <-- 关键区别
          name: db-credentials
          key: password
```

**部署与验证：**
```bash
# 部署前，必须先创建依赖的Secret
kubectl create secret generic db-credentials --from-literal=username=admin --from-literal=password='S3cr3tP@ssw0rd!'
# 部署Pod
kubectl apply -f pod-with-secret.yaml
# 查看日志验证 (仅用于学习，生产环境严禁打印密码)
kubectl logs pod-with-secret
```

## 三、Volume：Pod 的存储卷

Volume 是连接外部存储和 Pod 的桥梁，其生命周期与 Pod 绑定（Pod 在，Volume 在）。

### 1. emptyDir：Pod 内的临时共享存储

**特性：**
- Pod 创建时，K8s 在节点上为其分配一个空目录。
- Pod 删除时，该目录及其内容被永久删除。
- 容器崩溃重启，数据不丢失。

**核心用途：** 同一个 Pod 内多个容器之间共享文件（Sidecar 模式）。

**Sidecar 示例 pod-with-emptydir.yaml:**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-server-pod
spec:
  volumes:
  - name: shared-html
    emptyDir: {} # 定义一个emptyDir类型的Volume
  containers:
  - name: web-server
    image: nginx
    volumeMounts: # 挂载Volume
    - name: shared-html
      mountPath: /usr/share/nginx/html
  - name: content-generator
    image: busybox
    command: ["/bin/sh", "-c", "while true; do echo \"Generated at $(date)\" > /html/index.html; sleep 5; done"]
    volumeMounts: # 挂载同一个Volume
    - name: shared-html
      mountPath: /html
```

**验证方法 (端口转发):**
```bash
# 在一个终端运行
kubectl port-forward pod/web-server-pod 8080:80
# 在另一个终端验证
curl http://localhost:8080
```

## 2. hostPath：与节点主机的存储交互

**特性：**
- 将 Node 主机上的文件或目录直接挂载到 Pod 中。
- 数据不会随 Pod 删除而消失。
- **重大风险：** 破坏 Pod 可移植性，带来严重安全风险。应极力避免在常规应用中使用。

**核心用途：** 日志收集、监控代理等需要访问节点底层资源的系统级应用。

**pod-with-hostpath.yaml 示例：**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-hostpath
spec:
  containers:
  - name: test-container
    image: busybox:1.35
    command: [ "/bin/sh", "-c", "cat /host-data/host-file.txt; sleep 3600" ]
    volumeMounts:
    - name: host-storage
      mountPath: /host-data
  volumes:
  - name: host-storage
    hostPath:
      path: /mnt/data # 指定要挂载的主机路径
      type: Directory
```

**验证方法：**
```bash
# 1. 进入Kind节点容器，创建文件
docker exec -it kind-control-plane /bin/bash
# root@kind-control-plane:/# mkdir /mnt/data
# root@kind-control-plane:/# echo "Hello from Host" > /mnt/data/host-file.txt
# root@kind-control-plane:/# exit
# 2. 部署Pod
kubectl apply -f pod-with-hostpath.yaml
# 3. 查看日志
kubectl logs pod-hostpath
```
