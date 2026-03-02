# 项目概述

## 项目简介

这是一个基于 Hugo 静态网站生成器的个人博客项目，使用 PaperMod 主题进行深度定制。

## 技术栈

- **静态生成器**: Hugo v0.152.2+
- **主题**: PaperMod (自定义版本)
- **前端**: HTML5, CSS3, JavaScript (ES5+)
- **部署**: GitHub Pages (通过 GitHub Actions)
- **评论系统**: Giscus (GitHub Discussions)

## 项目特点

1. **双主题支持**: 浅色/深色模式自动切换
2. **彩虹进度条**: 阅读进度可视化
3. **猫咪钢琴**: 互动式页脚组件
4. **代码高亮**: 优化的代码块样式
5. **响应式设计**: 适配各种设备

## 目录结构

```
MyBlog/
├── archetypes/          # 文章模板
├── assets/              # 自定义资源
│   ├── css/            # 样式文件
│   ├── js/             # 脚本文件
│   └── modules/        # 功能模块
├── content/            # 文章内容
│   ├── cs/            # 计算机科学
│   ├── games/         # 游戏
│   └── poetry/        # 诗词
├── layouts/           # 页面模板
├── static/            # 静态文件
├── docs/              # 项目文档
└── .github/           # GitHub 配置
```

## 快速开始

### 本地开发

```bash
# 启动开发服务器
hugo server -D --bind 0.0.0.0 --port 1313

# 访问 http://localhost:1313
```

### 构建

```bash
# 构建站点
hugo --minify

# 输出到 public/ 目录
```

## 主题定制

- 主色调: 粉色 `#e84a7a` (浅色) / 紫罗兰 `#bd93f9` (深色)
- 字体: Noto Sans SC
- 动画: CSS3 动画 + JavaScript

## 维护者

- 作者: QwQBiG
- 仓库: https://github.com/QwQBiG/QwQBiG.github.io
