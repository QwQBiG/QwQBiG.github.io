---
title: "我の组会"
date: 2025-11-14T15:00:00+08:00
tags: ["组会","日记","运维"]
categories: ["运维"]
---

## 组会报告 1

容我想想上几周我干了什么：

首先在最开始，我搞了一个VMware开始玩弄Ubuntu，这个时候，我是在有这个项目通知之前，到货了一个鸿蒙系统的平板（书接上回），凭借“来都来了”与“捣鼓捣鼓”的心态，我开始安装搞termux和X11，想着搞个linux终端玩玩，但是因为鸿蒙，所以是无法启动的，但是我都看了好几个视频了，还是想试试linux，所以从电脑装了VMware，我这边是跟着千峰的（BV1VH1aBtEz2 ）视频来的，主要学的是虚拟机相关内容，同时包括一些Ubuntu命令：基础的ls,apt,tree,cd,pwd,cat,管道，重定向等，安装了插件：vmtools,samba,一些命令提示组件啥的（还有TheFuck，白月光），接触了主要是用SSH协议的Xshell远程终端（最后扔了）。算是对linux的Ubuntu发行版有了基础认识哈。（千峰的东西还是太过时了qwq）

然后就是新机必做的美化，有道是：”用着爽不一定真爽，但看着爽一定是真爽。“终端是块黑黢黢的方块，字体是被压缩成俄式比例的，那确实很可怕了...那时还没找毛学长，没搞zsh，终端还是bash，此时搞了个kitty图形化终端，以此来搞出来壁纸画面；之后开始使用oh my zsh和字体pl10k，搞出了jb momo（全拼一直忘）和代码高亮，和右键补全，这时的我受到豆沙包和臭鲸鱼的极致恶心，所幸镜像一天10次对话的ChatGPT还像是个人...但是还是让我感觉出，整这种相对完整的内容，还是博客、论坛、b站（一般）啥的好一些，我的美化，是跟着收藏的一篇CSDN的文章搞得（安装oh-my-zsh，配置命令行高亮，命令提示，打造高效终端_oh my zsh-CSDN博客）。终于，也是有了一个好看些的Ubuntu。

或许，我们感觉美化有点搞偏了，但是也可以学到pip,git一些下载、拉镜像源的方法，比如说找马云对吧（Gitee）。就像是孔老二说的可以“兴观群怨”的《诗经》，退一步说，这也算是一种识字教育，见识这些奇怪的”鸟兽草木之名“，也有帮助。

之后，我深刻的了解到、并可以熟练进行Ubuntu的紧急操作界面的恢复...因为可能是我把第二个开的虚拟机，放到了第一个虚拟机没有清理完全的文件夹，导致lvm卷他找不到，那两天左右，我大概有20次以上的重启到紧急模式到好了到测试的经历，可以说是十分熟练（酸爽）了。

然后转折点：毛学长给我分了一块实验室服务器的Ubuntu，所以开始搞远程终端的美化：

最终是扔了Xshell，用了开源的Tabby Terminal，如下图（还没整）哈，这么多好用的远程，难道主要是因为这个有壁纸插件吗？还真是。插件好啊，点下安装就让用。

然后，在我回宿舍路上，想要点开终端fuck一下，猛然发现连接寄掉了，原因都知道，这是在实验室的内网，问学长让我瞅瞅内网穿透，我听着有点高级哈，”穿透“，像是网安的词。当我下载、点开樱花穿透后：发现，这不是我的世界联机用的吗hh。由此，以及后来用的panel.frplients，以及学长给到的http协议的代理，都是，额，应该是计算机网络都要学的内容，TCP/SSH/HTTP/HTTPS这些协议嗯。以及一点防火墙的设置，都有学到。

在这些内容的中间，从linux(BV1cq421w72c )到docker（BV14s4y1i7Vf ）（BV1THKyzBER6 ）的基础视频，我是跟着敲了的。当然docker pull 不了镜像，问ai快给我俩问四了，发现是另有缘由是吧（当然有了代理，一路畅通）。

看的相关的科普视频关于docker,k8s,k3s,docker compose,docker swarm...比较杂...

然后就是调教ai（为了多玩玩docker），想搞个网站，一开始是吧，docker建了个文件夹搞点html,css做了个界面，发现内网...然后拉了一个wordpress是个动态网站，依旧内网...再看域名，看累了没搞，之后还想内网穿透，结果https...相关视频看了大概，网络协议也是大概学到了一些...

最终是用的Github Pages静态网站，不用自己搞sql、redis啥的，也不用搞安全，还是很爽的，加上Github Action 发布文章只要win终端git push一下就好了。

这边，主要是接触了git、前端代码、以及重要的shell内容。

https://qwqbig.github.io/

网址如上，里面有建站的全流程，想看的话。我应该有两天时间再干这个。

最后这两天就感到有点子无聊了，回到了STL 和 C++11以上的好的特性上去玩。

那我正好鼓捣k8s玩了，还以为要再docker几天的。

对了，我学过py（第一个学的就是py），脚本方面的接触在网站上建站过程中提及到了也。

本来我都想开始把原来做的题用cpp重写的，像是把这个世界用Rust重写一遍似的...(话说蟹教有干翻C++的未来吗，不清楚)。

写日记挺好玩的，我要同步到https://qwqbig.github.io/上hhh

欧克，完事了，bye~

## 组会报告 2

### 草稿施工：

安装核心工具 kubectl，下载 Google Cloud 公共签名密钥（什么用？），安装本地K8s集群Minikube（Minikube能在你的 Ubuntu 虚拟机里再创建一个小型的、单节点的 Kubernetes 集群。），使用 Docker 作为 Minikube 的驱动，专业开发者中非常流行的一种方式，它叫 Kind (Kubernetes in Docker)，把 Kubernetes 的节点（包括控制节点 Master 和工作节点 Node）不放在虚拟机里，而是直接运行在 Docker 容器里。这让启动和删除集群变得飞快，而且非常轻量。因为上一步的Minikube失败了哈哈，再次因为众所周知的原因，Kind我也下不了，最后是 export GOPROXY=https://goproxy.cn,direct 让Go语言用国内通道下载的Kind。

创建文件kind-config.yaml，配置好之后。运行 kind create cluster --config=kind-config.yaml，这个过程 Kind 会在后台运行 Docker，拉取镜像，并把 K8s 组件在容器里启动起来。（注意TCP端口，时不时的有占用）

kubectl cluster-info 查看集群信息，kubectl get nodes 查看节点信息 kubectl --help 或者 kubectl get --help 来查看提示

kubectl 语法（心中默念），在脑海里建立一个模型，几乎所有的 kubectl 命令都遵循这个格式：
kubectl [动作] [资源类型] [资源名字] [参数]

我们来命令 K8s 帮我们运行一个 Nginx 网页服务器。查看 Deployment 控制器 kubectl get deployments。Deployment 只是个“经理”，它会创建一个或多个 Pod（“员工”）来实际运行 Nginx，kubectl get pods，来看看真正工作的Pod。 kubectl get pods -o wide 来详细查看。

排错与详情：kubectl describe pod 我们的Pod名字 ，拉到最下面的 Events 部分查看。经过多次尝试，kubectl create deployment my-nginx --image=m.daocloud.io/docker.io/bitnami/nginx 这一条是可以成功的（真的很多次）。

kubectl exec -it 我们的Pod名字 -- /bin/bash ，进入我们的容器内部，运行ps aux查看工作进程。# Nginx 默认的网页根目录 ls /usr/share/nginx/html# 查看默认欢迎页的内容cat /usr/share/nginx/html/index.html

kubectl logs 我们的Pod名字 ，来查看日志。我们已经完成了对这个 Pod 的所有探索。现在，作为一名优秀的 K8s 管理员，我们要把实验环境清理干净。我们不直接删除 Pod，而是删除它的“老板”——Deployment。kubectl delete deployment my-nginx

原来的像是kubectl create deployment... 的一些操作，就像是命令。而YAML 文件是张“订单纸条”，让我们从命令转变为声明，而 kubectl apply 就是你“递交订单”的动作。好处有：YAML 文件可以像代码一样，存放在 Git 等版本控制系统中。同一份 YAML 文件，无论执行 apply 多少次，最终的结果都是一样的，这让自动化部署变得极其可靠。团队成员可以通过审查 YAML 文件（而不是一长串命令）来理解和修改系统配置。

nano first-pod.yaml ，在里面编辑内容后，使用kubectl apply -f first-pod.yaml 运行，（还是一样的，配置文件因为网络问题要特殊设置）。清理实验环境也变得非常简单，kubectl delete -f first-pod.yaml 

边车Sidecar模式。构建一个 Pod：主容器 (nginx): 负责对外提供 Web 服务。边车容器 (busybox): 每隔 5 秒钟，就将当前的时间写入到一个日志文件中。共享存储: Nginx 将直接把这个由 busybox 生成的日志文件作为自己的网页内容展示出来。又因为网络问题，Pod自己拉取不行，只好本地加载。

理解了 ImagePullBackOff 和 CrashLoopBackOff 这两大错误的本质区别。建立了清晰的调试流程：遇到 ImagePullBackOff -> 首先想到 kubectl describe pod -> 去看 Events 日志。遇到 CrashLoopBackOff -> 首先想到 kubectl logs (和 kubectl logs --previous) -> 去看容器自己输出了什么错误信息

命名空间 (Namespace) Namespace 就是 Kubernetes 里的“文件夹”为什么需要 Namespace？避免命名冲突： 在不同的 Namespace 里，你可以创建同名的资源。比如，dev 命名空间里可以有一个叫 my-app 的 Deployment，prod 命名空间里也可以有一个，它们互不影响。资源隔离与配额： 你可以为每个 Namespace 设置资源配额（比如 CPU、内存的上限），防止某个项目（比如测试环境）耗尽整个集群的资源。权限控制： 你可以设置权限，让 A 团队只能访问 team-a 的 Namespace，B 团队只能访问 team-b 的 Namespace。kubectl get namespaces# 或者简写kubectl get ns ，看到：default: 如果你不指定，你创建的所有资源都会被放在这里。我们前几天的操作都是在这个 Namespace 里。kube-system: K8s 系统组件（比如 etcd, scheduler 等）自己住的地方，永远不要动这里的东西。kube-public, kube-node-lease: 其他一些系统用的 Namespace。

我们来创建一个专门用于开发的 Namespace，叫做 dev。kubectl create namespace dev 。要在 dev 这个“文件夹”里创建一个 Pod。这需要使用 -n (或者 --namespace) 参数。创建并配置文件nano pod-in-dev.yaml 。然后部署它 kubectl apply -f pod-in-dev.yaml -n dev 。

如果说 Namespace 是“文件夹”，那么 Labels (标签) 就是贴在文件上的“彩色便签”。一个资源可以贴任意多个标签。标签 是一个键值对 (key/value pair)，例如 app: my-backend, env: production, version: v1.2。选择器 (Selector) 就是“筛选条件”，可以告诉 kubectl：“把所有贴着 env: production 标签的 Pod 都给我找出来！”

可以创建文件，写上标签，找标签。

小总结：学到的所有知识和技能（环境搭建、kubectl、YAML、多容器、调试、命名空间、标签），完成一个完整的部署、验证和清理流程。

综合挑战任务：部署一个 Redis 缓存服务 Pod
背景： 你的团队需要一个 Redis 缓存服务用于新的项目 review-project。你需要在一个专用的环境中部署这个服务，确保它符合规范，并验证其功能。
任务要求清单：
启动环境： 确保你的 Kind 集群正在运行。
创建环境： 创建一个名为 week2-review 的新命名空间。
编写蓝图 (YAML)：
创建一个名为 redis-deployment.yaml 的文件。
在该文件中定义一个 Pod 资源。
这个 Pod 必须部署在 week2-review 命名空间内。
Pod 的名字应为 redis-cache。
为该 Pod 添加标签 project: review 和 component: cache。
Pod 内应包含一个名为 redis-container 的容器。
该容器使用的镜像是 redis:7.0。
部署应用： 使用你编写的 YAML 文件成功部署该 Pod。
验证部署：
确认 Pod 在 week2-review 命名空间中，并且状态为 Running，READY 状态为 1/1。
确认 Pod 已经正确地打上了 project: review 和 component: cache 这两个标签。
使用标签选择器，能够精准地筛选出这个 Pod。
功能验证：
进入 (exec) 该 Pod 的 redis-container 容器内部。
在容器内部，使用 Redis 客户端命令行工具 (redis-cli) 进行一次简单的缓存操作（例如，SET mykey "hello" 然后 GET mykey）。
查看 Pod 的日志，确认 Redis 服务正常启动。
清理环境：
删除 redis-cache 这个 Pod。
删除 week2-review 这个命名空间。
最后，关闭你的 Kind 集群。
