# 假面骑士本地视频播放器

## 项目简介

一个专为假面骑士系列设计的本地视频播放器桌面应用。从百度网盘下载视频到本地后，应用自动扫描、分类展示，支持剧集切换、播放控制和断点续播。

## 核心功能

### 1. 本地视频展示
- 读取本地目录中的视频文件并展示

### 2. 视频分类管理
- 按作品系列分类（如：空我、亚极陀、龙骑、555、剑、响鬼、甲斗、电王、Kiva、Decade、W、OOO、Fourze、Wizard、铠武、Drive、Ghost、Ex-Aid、Build、时王、Zero-One、Saber、Revice、Geats、Gotchard 等）
- 按类型分类（TV正片、剧场版、外传、特别篇 等）

### 3. 剧集切换
- 支持同一系列内切换上一集/下一集
- 支持按集数选择跳转

### 4. 播放控制
- 播放 / 暂停
- 快进 / 快退
- 倍速播放

### 5. 播放历史与进度记忆
- 记录观看历史（看过哪些剧集）
- 记忆每集的播放进度（看到哪个片段），下次继续播放时自动从上次位置恢复

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 桌面框架 | Electron 28 | 基于 Chromium，内嵌视频播放能力 |
| 前端框架 | React 18 + TypeScript 5 | 类型安全 |
| 构建工具 | Vite 5 + electron-vite | 三入口打包（main/preload/renderer） |
| 样式方案 | Tailwind CSS 3 | 原子化 CSS |
| 状态管理 | Zustand 5 | 轻量级 |
| 数据存储 | JSON 文件 | Node.js fs 模块，位于 userData 目录 |
| 视频播放 | HTML5 `<video>` | 原生支持 MP4/MKV/WebM |
| 路由 | react-router-dom 6 | Hash 路由 |
| 视频扫描 | 递归目录扫描 | 从目录结构自动解析系列/类型/集数 |

---

## 项目结构

```
kamenrider/
├── README.md                    # 工程文档
├── package.json                 # 依赖与脚本
├── electron.vite.config.ts      # electron-vite 构建配置
├── tsconfig.json                # TypeScript 配置
├── tsconfig.node.json           # Main/Preload TS 配置
├── tsconfig.web.json            # Renderer TS 配置
├── tailwind.config.js           # Tailwind 配置
├── postcss.config.js            # PostCSS 配置
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── index.ts             # 入口：创建窗口、注册 IPC
│   │   ├── scanner.ts           # 视频文件扫描与解析
│   │   ├── storage.ts           # JSON 文件读写（配置 + 历史）
│   │   └── ipc-handlers.ts      # IPC 通信处理器
│   ├── preload/
│   │   └── index.ts             # contextBridge 安全 API
│   ├── renderer/                # React 渲染进程
│   │   ├── index.html           # HTML 入口
│   │   └── src/
│   │       ├── main.tsx         # React 入口
│   │       ├── App.tsx          # 根组件 + 路由
│   │       ├── assets/main.css  # 全局样式
│   │       ├── env.d.ts         # 类型声明
│   │       ├── pages/           # 页面组件
│   │       ├── stores/          # Zustand 状态
│   │       └── components/      # 通用组件
│   └── shared/
│       └── types.ts             # 共享类型定义
│       └── episode-titles.ts    # 剧集标题数据库 (可扩展)
└── resources/                   # 应用图标等静态资源
```

---

## 实现进度

### 已完成 ✅
- [x] 项目脚手架：Electron + React + Vite + TypeScript + Tailwind
- [x] 主进程窗口创建与 Preload 脚本
- [x] 渲染进程 React 入口 + 路由 (HashRouter)
- [x] Zustand 状态管理 Store 定义
- [x] 视频文件扫描器 (scanner.ts)：递归目录 → 解析系列/类型/集数
- [x] 剧集标题自动匹配 (episode-titles.ts)：纯数字文件名自动补全标题（当前已收录：假面骑士W 全49话）
- [x] JSON 文件存储 (storage.ts)：应用配置 + 观看历史
- [x] IPC 通信 (ipc-handlers.ts)：扫描、配置、历史、视频路径
- [x] 首页：系列网格/列表展示 + 目录配置弹窗
- [x] 系列详情页：剧集列表 + 分类筛选标签
- [x] 视频播放器：VideoPlayer 组件 + 控制栏 + 键盘快捷键（±5秒快进退）
- [x] 播放页：剧集侧边栏 + 断点续播 + 每5秒自动保存进度
- [x] 播放历史页：时间倒序 + 进度条 + 相对时间 + 点击跳转
- [x] Windows 文件路径 → file:// URL 编码修复
- [x] 构建验证通过
- [x] RMVB 批量转码脚本（`npm run convert`，解决 Chromium 不支持 RealMedia 解码）

---

## 开发命令

```bash
npm install          # 安装依赖
npm run dev          # 启动开发模式
npm run build        # 编译构建
npm run package      # 构建 + 打包 Windows 安装包
npm run convert <目录> # RMVB → MP4 批量转码（需 ffmpeg）
```

## 视频目录结构约定

扫描器假定以下目录结构来解析系列、类型和集数：

```
KamenRider/
├── 假面骑士空我/
│   ├── TV/
│   │   ├── 01.mp4
│   │   ├── 02.mp4
│   │   └── ...
│   └── 剧场版/
│       └── 剧场版XXX.mp4
├── 假面骑士亚极陀/
│   ├── 01.mp4          ← 无分类子目录，默认为 TV正片
│   └── ...
```

## 剧集标题自动匹配

当视频文件名仅为纯数字（如 `01.mp4`）时，扫描器会自动查询 `episode-titles.ts` 中的标题数据库，生成"第X话 标题"格式的显示名称。

**示例：**
| 文件名 | 系列 | 显示标题 |
|--------|------|----------|
| `01.mp4` | 假面骑士W | 第1话 W的检索／侦探是两位一体 |
| `02.mp4` | 假面骑士W | 第2话 W的检索／让城市哭泣之物 |
| `01.mp4` | 假面骑士空我 | 第1集 *(暂无标题数据)* |

**扩展标题数据：** 编辑 `src/shared/episode-titles.ts`，在 `TITLES` 对象中添加新系列即可：
```ts
'假面骑士空我': {
  1: '复活',
  2: '变身',
  // ...
}
```
