<div align="center">

<!-- 项目 Logo / 标题 -->
<img src="https://img.shields.io/badge/✨-MyBlog-Astro-ff69b4?style=for-the-badge&logo=astro&logoColor=white" alt="Project Title" />

<!-- 项目标语 -->
<p><strong>一个融合 3D 视觉、诗意表达与技术分享的个人博客</strong></p>

<!-- 项目徽章 -->
<p>
  <img src="https://img.shields.io/badge/Astro-5.5.0-BC52EE?style=flat-square&logo=astro" alt="Astro" />
  <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Three.js-0.183.2-000000?style=flat-square&logo=three.js" alt="Three.js" />
  <img src="https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
</p>

<!-- 部署状态 -->
<p>
  <img src="https://img.shields.io/badge/网站-iqwqi.win-00C7B7?style=flat-square" alt="Website" />
</p>

</div>

---

## 📖 项目简介

**MyBlog-Astro** 是一个基于 [Astro](https://astro.build/) 构建的现代化个人博客系统。它不仅仅是一个博客，更是一个融合了**3D 交互视觉**、**诗意文学表达**与**技术深度分享**的个人数字空间。

### 🎯 设计理念

- **视觉优先**：采用 Three.js 打造完美的 3D 体验，包括照片墙等
- **内容为主**：支持计算机技术文章与古典诗词双轨内容体系
- **极致性能**：利用 Astro 的零 JS 默认策略，实现静态生成与客户端交互的完美平衡
- **设计美学**：粉色系毛玻璃设计风格，打造温馨优雅的阅读体验

---

## ✨ 核心特性

### 🎨 视觉体验
- **2D 动漫角色展示**：基于 React Three Fiber 的实时渲染角色，支持鼠标交互与呼吸动画
- **音乐律动效果**：音乐播放器集成音频可视化效果
- **3D 散落照片墙**：可拖拽、可预览的交互式照片展示空间
- **毛玻璃设计**：全站统一的 Glassmorphism 视觉风格

### 📝 内容管理
- **双轨内容体系**：
  - 📚 计算机科学文章（算法、C++、嵌入式、运维等系列）
  - 🎭 古典诗词创作（词、赋、古文、现代诗等）
- **Astro Content Collections**：类型安全的内容管理
- **标签与归档系统**：灵活的内容组织与检索
- **系列文章支持**：专题化内容聚合展示

### ⚡ 技术亮点
- **Prism.js 代码高亮**：自定义 Catppuccin 主题，支持彩虹括号、代码折叠、复制按钮
- **Pagefind 站内搜索**：极速全文搜索体验
- **RSS 订阅**：自动生成 RSS Feed
- **响应式设计**：完美适配移动端与桌面端
- **音乐播放器**：集成音频播放与可视化效果

---

## 🛠️ 技术栈

### 核心框架
| 技术 | 版本 | 用途 |
|------|------|------|
| [Astro](https://astro.build/) | 5.5.0 | 静态站点生成器 |
| [React](https://react.dev/) | 19.2.4 | 交互式组件 |
| [TypeScript](https://www.typescriptlang.org/) | 5.8.2 | 类型安全 |

### 3D 与动画
| 技术 | 版本 | 用途 |
|------|------|------|
| [Three.js](https://threejs.org/) | 0.183.2 | 3D 图形渲染 |
| [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) | 9.5.0 | React Three.js 集成 |
| [@react-three/drei](https://github.com/pmndrs/drei) | 10.7.7 | Three.js 辅助组件 |
| [Framer Motion](https://www.framer.com/motion/) | 12.38.0 | 动画效果 |

### 样式与 UI
| 技术 | 版本 | 用途 |
|------|------|------|
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.17 | 原子化 CSS |
| [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography) | 0.5.16 | 排版样式 |

### 代码高亮
| 技术 | 版本 | 用途 |
|------|------|------|
| [Prism.js](https://prismjs.com/) | 1.30.0 | 语法高亮 |
| 自定义主题 | - | Catppuccin 优雅风格 |

---

## 📂 项目结构

```text
myblog-astro/
├── 📁 src/
│   ├── 📁 components/           # 组件目录
│   │   ├── 📁 3d/              # 3D 视觉组件
│   │   │   ├── AnimeCore.tsx       # 2D 动漫角色
│   │   │   ├── PhotoWall.tsx       # 3D 照片墙
│   │   │   ├── ParticleLifeCore.jsx # 粒子生命效果
│   │   │   └── FloatingIslandHome.tsx # 浮动岛屿首页
│   │   ├── 📁 ui/              # 基础 UI 组件
│   │   │   └── GlassCard.astro     # 毛玻璃卡片
│   │   ├── 📁 layout/          # 布局组件
│   │   │   ├── Header.astro        # 页面头部
│   │   │   ├── Footer.astro        # 页面底部
│   │   │   └── FloatingNavCard.astro # 浮动导航
│   │   ├── 📁 widgets/         # 功能小部件
│   │   │   ├── ClockWidget.astro   # 时钟组件
│   │   │   ├── CalendarWidget.astro # 日历组件
│   │   │   └── MusicWidget.astro   # 音乐播放器
│   │   └── 📁 content/         # 内容展示组件
│   │       ├── PostCard.astro      # 文章卡片
│   │       └── SeriesCard.astro    # 系列卡片
│   │
│   ├── 📁 content/              # 内容集合
│   │   ├── 📁 cs/              # 计算机科学文章
│   │   │   └── posts/              # 文章目录
│   │   │       ├── AlgorithmSeries/ # 算法系列
│   │   │       ├── CppSeries/      # C++ 系列
│   │   │       ├── EmbeddedSeries/ # 嵌入式系列
│   │   │       ├── TaoKeSeries/    # 逃课系列
│   │   │       └── YunWeiSeries/   # 运维系列
│   │   └── 📁 poetry/          # 诗词文章
│   │       └── posts/              # 诗词目录
│   │
│   ├── 📁 layouts/              # 页面布局
│   │   └── Layout.astro         # 基础布局
│   │
│   ├── 📁 pages/                # 路由页面
│   │   ├── index.astro          # 首页
│   │   ├── about.astro          # 关于页面
│   │   ├── gallery.astro        # 照片墙
│   │   ├── search.astro         # 搜索页面
│   │   ├── archives.astro       # 归档页面
│   │   ├── 404.astro            # 404 页面
│   │   ├── 📁 cs/              # 计算机文章路由
│   │   ├── 📁 poetry/          # 诗词路由
│   │   ├── 📁 tags/            # 标签路由
│   │   └── 📁 series/          # 合集路由
│   │
│   ├── 📁 styles/               # 全局样式
│   ├── 📁 types/                # TypeScript 类型
│   └── 📁 utils/                # 工具函数
│
├── 📁 public/                   # 静态资源
│   ├── 📁 images/               # 图片资源
│   ├── 📁 js/                   # JavaScript 文件
│   │   ├── prism.js             # Prism 核心
│   │   ├── prism-*.js           # 语言支持
│   │   └── prism-*.js           # 功能扩展
│   ├── 📁 styles/               # 样式文件
│   └── 📁 music/                # 音频文件
│
├── 📄 astro.config.mjs          # Astro 配置
├── 📄 tailwind.config.mjs       # Tailwind 配置
├── 📄 package.json              # 项目依赖
└── 📄 README.md                 # 项目文档
```

---

## 🚀 快速开始

### 环境要求

- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本（或 yarn/pnpm）

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/QwQBiG/myblog-astro.git
cd myblog-astro

# 安装依赖
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

### 启动开发服务器

```bash
# 启动开发服务器（默认端口 4321）
npm run dev

# 或使用 yarn
yarn dev

# 访问 http://localhost:4321
```

### 构建生产版本

```bash
# 构建静态站点
npm run build

# 预览生产构建
npm run preview
```

---

## 📖 使用说明

### 添加新文章

1. **计算机文章**：在 `src/content/cs/posts/` 下创建 `.md` 文件
   ```markdown
   ---
   title: "文章标题"
   description: "文章描述"
   date: 2024-01-01
   tags: ["tag1", "tag2"]
   series: ["系列名称"]
   draft: false
   ---
   
   文章内容...
   ```

2. **诗词文章**：在 `src/content/poetry/posts/` 下创建 `.md` 文件
   ```markdown
   ---
   title: "诗词标题"
   description: "诗词描述"
   date: 2024-01-01
   genre: "词"
   mood: ["抒情", "思乡"]
   draft: false
   ---
   
   诗词内容...
   ```

### 自定义配置

- **站点配置**: 修改 `astro.config.mjs` 中的 `site` 字段
- **主题颜色**: 编辑 `public/styles/prism-catppuccin.css`
- **Tailwind 配置**: 修改 `tailwind.config.mjs`

---

## 🌟 项目亮点

### 性能优化
- ⚡ **零 JS 默认**: Astro 仅在需要交互的组件加载 JavaScript，首屏加载极速
- 🖼️ **图片优化**: 自动图片压缩与懒加载
- 📦 **代码分割**: 自动路由级代码分割

### 可访问性
- ♿ **键盘导航**: 完整的键盘操作支持
- 🔍 **语义化 HTML**: 良好的屏幕阅读器支持
- 🎨 **色彩对比**: 符合 WCAG 标准的色彩对比度

### SEO 优化
- 📝 **自动元数据**: 每页自动生成 SEO 友好的元数据
- 🗺️ **站点地图**: 自动生成 sitemap.xml
- 📡 **RSS 订阅**: 自动生成 RSS Feed

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证开源。

---

## 🙏 致谢

- [Astro](https://astro.build/) - 极速静态站点生成器
- [Three.js](https://threejs.org/) - 强大的 3D 图形库
- [Tailwind CSS](https://tailwindcss.com/) - 实用的 CSS 框架
- [Catppuccin](https://catppuccin.com/) - 舒适的配色方案

---

<div align="center">

**Made with 💖 by [iqwqi](https://iqwqi.win)**

<p>
  <a href="https://github.com/QwQBiG"><img src="https://img.shields.io/badge/GitHub-QwQBiG-181717?style=flat-square&logo=github" alt="GitHub" /></a>
  <a href="https://leetcode.cn/u/iqwqi/"><img src="https://img.shields.io/badge/LeetCode-iqwqi-FFA116?style=flat-square&logo=leetcode" alt="LeetCode" /></a>
  <a href="https://space.bilibili.com/3546921071282890"><img src="https://img.shields.io/badge/Bilibili-iqwqi-00A1D6?style=flat-square&logo=bilibili" alt="Bilibili" /></a>
</p>

</div>
