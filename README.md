# 假面骑士本地视频播放器 🎬

> Kamen Rider Local Video Player — Electron 桌面应用，专为假面骑士系列设计的本地视频管理与播放工具。

[![Electron](https://img.shields.io/badge/Electron-33-47848f?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

---

## 📖 项目简介

从百度网盘下载假面骑士视频到本地后，应用会自动扫描目录、按系列和类别分类展示。支持剧集切换、播放控制、断点续播、观看历史追踪等完整的视频播放体验。

### 核心功能

| 功能 | 说明 |
|------|------|
| 🔍 **自动扫描** | 递归扫描本地目录，从目录结构自动解析系列、分类（TV正片/剧场版/外传/特别篇）和集数 |
| 🎯 **智能标题** | 纯数字文件名（如 `01.mp4`）自动匹配剧集标题数据库，显示 "第X话 标题" |
| 🖼️ **系列封面** | 内置系列封面图，卡片式网格展示，一目了然 |
| ▶️ **视频播放** | HTML5 原生播放器，支持 MP4/MKV/WebM，控制栏 + 键盘快捷键 |
| ⏱️ **断点续播** | 每 5 秒自动保存播放进度，下次打开自动恢复 |
| 📜 **观看历史** | 时间倒序展示，进度条可视化，点击直接跳转继续播放 |
| 🎛️ **播放控制** | 播放/暂停、±5秒快进快退、倍速（0.5x–2x）、音量、全屏、跳过片头 |
| ⌨️ **键盘快捷键** | 空格（播放/暂停）、←→（快退/快进）、↑↓（音量）、F（全屏）、M（静音） |
| ♿ **无障碍** | SVG 图标、aria-label、焦点环、尊重系统 reduced-motion 偏好 |

---

## 🛠️ 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 桌面框架 | Electron | 33 | 基于 Chromium，内嵌视频解码 |
| 前端框架 | React | 18 | 函数组件 + Hooks |
| 类型系统 | TypeScript | 5 | 严格模式 |
| 构建工具 | Vite | 5 | electron-vite 三入口打包 |
| 样式方案 | Tailwind CSS | 3 | 暗色主题，响应式布局 |
| 状态管理 | Zustand | 5 | 轻量级，无 boilerplate |
| 路由 | react-router-dom | 6 | HashRouter（兼容 file:// 协议） |
| 数据存储 | JSON 文件 | — | Node.js fs 模块，存于 userData 目录 |
| 视频播放 | HTML5 `<video>` | — | 原生支持 MP4/MKV/WebM |

---

## 📁 项目结构

```
kamenrider/
├── README.md
├── CODE_DOC.md                   # 详细代码文档（架构、组件、数据流）
├── task_plan.md                  # 任务计划（阶段跟踪）
├── findings.md                   # 研究发现与决策记录
├── progress.md                   # 开发进度日志
├── package.json
├── electron.vite.config.ts       # electron-vite 构建配置
├── tsconfig.json                 # TypeScript 基础配置
├── tsconfig.node.json            # Main / Preload TS 配置
├── tsconfig.web.json             # Renderer TS 配置
├── tailwind.config.js            # Tailwind 自定义配置
├── postcss.config.js             # PostCSS 配置
├── .gitignore
├── scripts/
│   └── convert-rmvb.js           # RMVB → MP4 批量转码脚本
├── src/
│   ├── main/                     # Electron 主进程
│   │   ├── index.ts              # 窗口创建 + IPC 注册
│   │   ├── scanner.ts            # 视频文件递归扫描与解析
│   │   ├── storage.ts            # JSON 读写（配置 + 观看历史）
│   │   └── ipc-handlers.ts       # 9 个 IPC 通道处理器
│   ├── preload/
│   │   └── index.ts              # contextBridge 安全暴露 API
│   ├── renderer/                 # React 渲染进程
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx          # React 入口挂载
│   │       ├── App.tsx           # 根组件：HashRouter + 4 条路由
│   │       ├── env.d.ts          # 全局类型声明（window.electronAPI）
│   │       ├── assets/
│   │       │   └── main.css      # 全局样式 + Tailwind 指令
│   │       ├── pages/
│   │       │   ├── HomePage.tsx   # 首页：系列网格 + 目录配置
│   │       │   ├── SeriesPage.tsx # 系列详情：剧集列表 + 分类标签
│   │       │   ├── PlayerPage.tsx # 播放页：视频 + 侧边栏 + 续播
│   │       │   └── HistoryPage.tsx# 观看历史：倒序列表 + 进度条
│   │       ├── components/
│   │       │   ├── SeriesList.tsx     # 系列卡片网格（封面 + 渐变遮罩）
│   │       │   ├── EpisodeList.tsx    # 剧集列表（当前播放高亮）
│   │       │   ├── VideoPlayer.tsx    # HTML5 视频播放器核心
│   │       │   ├── VideoControls.tsx  # 播放控制栏（进度/音量/倍速/全屏）
│   │       │   ├── DirectoryConfig.tsx# 视频目录增删改配置弹窗
│   │       │   └── Icons.tsx          # 7 个 SVG 图标组件
│   │       └── stores/
│   │           ├── useAppStore.ts     # 应用状态（系列列表/目录/加载态）
│   │           └── usePlayerStore.ts  # 播放状态（进度/音量/倍速/全屏）
│   └── shared/                   # 主进程 ↔ 渲染进程 共享
│       ├── types.ts              # 核心类型定义（7 个导出）
│       ├── episode-titles.ts     # 剧集标题数据库（W 49话 + 时王 49话）
│       └── series-covers.ts      # 系列封面图片映射
└── resources/                    # 应用图标等静态资源
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Windows** 10/11（macOS/Linux 理论兼容，未测试）
- （可选）**ffmpeg** — 如需 RMVB 转码

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/ananzi1/kamenrider.git
cd kamenrider

# 2. 安装依赖
npm install

# 3. 启动开发模式（热重载）
npm run dev

# 4. 生产构建
npm run build

# 5. 打包 Windows 安装包
npm run package
```

### 视频目录准备

应用扫描器按以下目录结构解析系列、类型和集数：

```
你的视频目录/
├── 假面骑士空我/
│   ├── TV正片/
│   │   ├── 01.mp4
│   │   ├── 02.mp4
│   │   └── ...
│   └── 剧场版/
│       └── 剧场版XXX.mp4
├── 假面骑士W/
│   ├── 01.mp4              ← 无子目录则默认为 TV正片
│   ├── 02.mp4
│   └── ...
└── 假面骑士Ex-Aid/
    └── [字幕组][假面骑士ea][01][标题][1080p].mp4  ← 也支持含标签的文件名
```

启动应用后，在首页点击齿轮图标配置视频目录，点击扫描即可。

---

## ⌨️ 键盘快捷键

| 按键 | 功能 |
|------|------|
| `Space` | 播放 / 暂停 |
| `←` / `→` | 快退 / 快进 5 秒 |
| `↑` / `↓` | 音量增减 |
| `F` | 切换全屏 |
| `M` | 静音 / 取消静音 |
| `[` / `]` | 上一集 / 下一集 |
| `1` – `9` | 切换倍速（1=0.5x, 2=0.75x, 3=1x, 4=1.25x, 5=1.5x, 6=2x） |
| `S` | 跳过片头（可配置秒数） |
| `Esc` | 退出全屏 |

---

## 🔧 RMVB 转码

部分老旧假面骑士资源为 RMVB 格式，Chromium 不支持解码。使用内置转码脚本批量转换：

```bash
# 将指定目录下所有 .rmvb 转为 .mp4
npm run convert "D:/视频/假面骑士龙骑"
```

> 需要先安装 [ffmpeg](https://ffmpeg.org/download.html) 并加入 PATH。

---

## 🧩 扩展剧集标题

编辑 `src/shared/episode-titles.ts`，在 `TITLES` 对象中添加新系列：

```ts
export const TITLES: Record<string, Record<number, string>> = {
  '假面骑士W': {
    1: 'W的检索／侦探是两位一体',
    2: 'W的检索／让城市哭泣之物',
    // ... 全 49 话已收录
  },
  '假面骑士时王': {
    1: 'キングダム2068',
    // ... 全 49 话已收录
  },
  // 👇 添加新系列
  '假面骑士空我': {
    1: '复活',
    2: '变身',
    // ...
  },
}
```

添加封面图：将 `系列名_Poster.webp` 放入 `resources/covers/`，并在 `src/shared/series-covers.ts` 中注册映射。

---

## 📚 文档

| 文档 | 内容 |
|------|------|
| [CODE_DOC.md](CODE_DOC.md) | 完整代码文档：架构图、组件详解、数据流、IPC 通道 |
| [task_plan.md](task_plan.md) | 任务计划：6 阶段分解，决策记录 |
| [findings.md](findings.md) | 研究发现：技术决策、问题解决、资源链接 |
| [progress.md](progress.md) | 进度日志：会话记录、测试结果、错误追踪 |

---

## 📄 License

MIT
