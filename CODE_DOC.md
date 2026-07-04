# 假面骑士播放器 — 代码文档

> 最后更新：2026-07-04

---

## 协作规范

> **重要：** 每次开发新功能前，先向用户描述方案（涉及哪些文件、数据流、UI交互），获得确认后再开始编写代码。开发完成后同步更新本文档的开发进度和文件详解。

> **文档同步规范：** 每个功能模块开发完成后，必须执行以下步骤：
> 1. 使用 `find` 扫描 `src/` 目录，列出所有源文件
> 2. 逐文件对比本文档，检查：是否有新增文件未记录、是否有已删除/重构的文件残留、是否有函数/Props/状态描述与实际代码不一致
> 3. 修正发现的问题后，更新"开发进度"章节，标记完成
> 4. 运行 `npm run build` 验证构建通过

## 零、开发进度

### 已完成 ✅

| 阶段 | 内容 | 涉及文件 |
|------|------|----------|
| 项目脚手架 | Electron 33 + React 18 + Vite 5 + TypeScript 5 + Tailwind 3 + Zustand 5 | `package.json`, `electron.vite.config.ts`, `tsconfig*.json`, `tailwind.config.js` |
| 主进程框架 | 窗口创建 (1200×800)、Preload 注入、IPC 注册入口 | `src/main/index.ts` |
| 类型定义 | 7 个导出（2 常量 + 1 联合类型 + 4 interface） | `src/shared/types.ts` |
| 剧集标题库 | 假面骑士W 全49话 + 假面骑士时王 全49话 + `lookupTitle`/`hasSeriesTitles` 查询函数（大小写不敏感） | `src/shared/episode-titles.ts` |
| 视频扫描器 | 递归扫描 → 目录结构解析系列/分类/集数 → 纯数字文件名自动补全标题 | `src/main/scanner.ts` |
| JSON 存储 | 配置持久化 + 观看历史增删改查 | `src/main/storage.ts` |
| IPC 通信 | 9 个通道：扫描、配置(读/写)、历史(单条/全部/保存)、视频路径、目录选择、封面图片 | `src/main/ipc-handlers.ts` |
| Preload 桥梁 | 9 个 API 方法暴露 + 全局类型注入 | `src/preload/index.ts`, `src/renderer/src/env.d.ts` |
| React 路由 | HashRouter 4 条路由 | `src/renderer/src/App.tsx` |
| 状态管理 | useAppStore（6字段） + usePlayerStore（8字段） | `src/renderer/src/stores/` |
| 首页 | 三态切换（空配置/无视频/系列浏览）+ Header + 目录配置弹窗 | `src/renderer/src/pages/HomePage.tsx` |
| 目录配置 | 原生系统文件夹选择器 + 目录增删 + 保存并触发扫描 | `src/renderer/src/components/DirectoryConfig.tsx` |
| 系列列表 | 响应式卡片网格 + 分类标签 | `src/renderer/src/components/SeriesList.tsx` |
| 系列详情页 | 分类标签切换 + 剧集列表 + 系列未找到提示 | `src/renderer/src/pages/SeriesPage.tsx` |
| 劇集列表 | 编号 + 标题 + 文件名，点击进入播放 | `src/renderer/src/components/EpisodeList.tsx` |
| 视频播放器 | HTML5 `<video>` 封装 + 事件同步 store + `absolute inset-0` 定位 | `src/renderer/src/components/VideoPlayer.tsx` |
| 播放控制栏 | 播放/暂停、进度条、时间、音量、倍速、全屏 + 键盘快捷键 | `src/renderer/src/components/VideoControls.tsx` |
| 播放页 | 播放器 + 控制栏 + 剧集侧边栏 + 断点续播 + 每5秒自动保存进度 | `src/renderer/src/pages/PlayerPage.tsx` |
| 观看历史 | 按时间倒序列表 + 进度条 + 相对时间 + 点击跳转 | `src/renderer/src/pages/HistoryPage.tsx` |
| Bug修复：file:// URL | Windows 路径转合法 file:// URL（反斜杠→正斜杠 + 三斜杠 + encodeURIComponent） | `src/renderer/src/components/VideoPlayer.tsx` |
| Bug修复：RMVB扫描 | VIDEO_EXTENSIONS 新增 `.rmvb`，修复大量 RMVB 文件扫描不到的问题 | `src/shared/types.ts` |
| Bug修复：标题不匹配 | `lookupTitle`/`hasSeriesTitles` 改为大小写不敏感，修复目录名与数据库 key 大小写不一致 | `src/shared/episode-titles.ts` |
| Bug修复：列表无法滚动 | Flexbox `min-height: auto` 导致 flex 子元素高度被内容撑开而无法滚动，所有可滚动 flex 子区域加 `min-h-0` | SeriesPage/PlayerPage/HomePage |
| Bug修复：视频偏位+控件不浮现+双击全屏 | 视频改为 flex 居中定位；控件鼠标唤醒从自身 onMouseMove 改为父容器 onMouseMove → ref.wake()；新增双击全屏 | VideoPlayer/VideoControls/PlayerPage |
| Bug修复：历史记录导航失败 | HistoryPage 原先用 `item.filePath`（完整路径）作为路由参数跳转播放页，但 PlayerPage 用 `f.id`（MD5 哈希）匹配，导致始终"未找到该视频"。改用 `videoIdByPath` Map 反查 VideoFile.id 导航 | HistoryPage |
| Bug修复：窗口化 + 全屏视频缩放异常 | PlayerPage 根容器漏加 `min-h-0`，flex `min-height: auto` 导致视频 intrinsic size 撑破高度约束。分两步修复：① PlayerPage 两处根 div 加 `min-h-0` 贯通高度链；② VideoPlayer `<video>` 从 `max-w-full max-h-full` 改为 `w-full h-full object-contain`（高度链贯通后 100% 解析正确，窗口化不溢出、全屏铺满） | PlayerPage, VideoPlayer |
| Bug修复：系列详情页剧集列表无法滚动 | SeriesPage 根容器漏加 `min-h-0 overflow-hidden`，flex `min-height: auto` 导致内容撑破视口，overflow-y-auto 在 `<main>` 上生效，高度链断开滚轮事件不穿透。两处根 div 加 `min-h-0 overflow-hidden` | SeriesPage |
| Bug修复：全屏黑屏（sidebarVisible 未定义） | 清理自动隐藏逻辑时删除了 `sidebarVisible` 状态变量，但全屏按钮 className 模板中仍引用该变量，进入全屏渲染时抛出 `ReferenceError` 导致 PlayerPage 组件崩溃 → 黑屏。临时移除残留引用恢复功能，后续通过 `onShowChange` 机制重新实现正确的自动隐藏 | PlayerPage |
| Bug修复：全屏切换剧集不弹续播对话框 | 续播对话框原先渲染在 `.video-area` 外部（PlayerPage 外层 flex 容器），全屏时只有 `.video-area` 子树可见，对话框被遮挡不可见。将续播对话框移入 `.video-area` 内部，使全屏和窗口模式下均能正常显示 | PlayerPage |
| 全屏侧边栏按钮自动隐藏 | 与 VideoControls 进度条共用显隐逻辑：VideoControls 新增 `onShowChange` 回调 prop，`show` 变化时通知 PlayerPage 同步 `sidebarVisible` 状态，全屏侧边栏按钮与下方控件栏一同淡入淡出（播放时 3 秒无操作隐藏，暂停时始终显示） | VideoControls, PlayerPage |
| 系列封面图片 | 首页卡片支持封面图片展示（封面图 + 渐变遮罩 + 文字叠加），无封面时降级为纯色背景。新增 `series-covers.ts` 映射文件 + `get-cover-url` IPC 通道 + `getCoverUrl` Preload API | series-covers.ts, ipc-handlers, preload, SeriesList |
| "上次看到"剧集标记 | 进入系列详情页时自动查询观看历史，高亮标记该系列最近播放的剧集（主色左边框 + 编号/标题着色 + "上次"标签）。SeriesPage 通过 `getAllWatchHistory` 过滤查找并传给 EpisodeList | SeriesPage, EpisodeList |
| RMVB 转码脚本 | 新增 `scripts/convert-rmvb.js` + `npm run convert <目录>` 命令，递归扫描目录中所有 `.rmvb` 文件 → ffmpeg 批量转 H.264 MP4，解决 Chromium 不支持 RealMedia 解码的兼容问题 | scripts/convert-rmvb.js |
| UI/UX 规范化 | 全应用 emoji 替换为 SVG 图标（新增 `Icons.tsx`）、添加 aria-label、全局 focus-visible 焦点环、尊重 prefers-reduced-motion、修复文字对比度、补全 cursor-pointer | Icons.tsx, main.css, tailwind.config.js, HomePage/PlayerPage/SeriesPage/HistoryPage/VideoControls/DirectoryConfig/SeriesList |

### 进行中 🔧

_当前无进行中任务_

### 待实现 ⏳

| 优先级 | 任务 | 涉及文件 | 说明 |
|--------|------|----------|------|
| — | _基础功能已完成，可直接 `npm run dev` 使用_ | — | — |

### 关键决策记录

| 决策 | 原因 |
|------|------|
| 数据存储用 JSON 文件而非 SQLite | `better-sqlite3` 需要原生编译，当前 VS2019 缺少 ClangCL 工具链导致无法安装，临时改用 `fs` 模块读写 JSON 文件 |
| 前端路由用 HashRouter | Electron 加载 `file://` 协议，BrowserRouter 不兼容，HashRouter 无需服务端配置 |
| `webSecurity: false` | 允许 Chromium 加载本地 `file://` 路径的视频文件 |
| `sandbox: false` | Preload 脚本需要访问 Node.js API |
| 扫描使用栈式迭代 | 避免深层目录递归导致栈溢出 |
| `toFileUrl()` 路径编码 | Windows 路径 `D:\videos\01.mp4` 直接拼接 `file://` 得到非法 URL，需转正斜杠 + `encodeURIComponent` + 三斜杠格式 `file:///` |
| `.rmvb` 加入扫描但不支持播放 | 用户实际视频大量为 RMVB 格式（RealMedia），Chromium HTML5 video 不支持解码。扫描器收录 `.rmvb` 以便在列表中可见，实际播放需用 ffmpeg 转码为 H.264 MP4 |
| `lookupTitle` 大小写不敏感 | 目录名可能为 `假面骑士w` 而数据库 key 为 `假面骑士W`，精确匹配失败后做 `toLowerCase()` 回退查找 |
| Flexbox 滚动需 `min-h-0` | Flex 子元素默认 `min-height: auto`，会被内容撑开导致 `overflow-y-auto` 失效。所有可滚动的 flex 子元素必须加 `min-h-0` 强制高度由 flex 约束 |
| `html,body{height:100%}` | Electron 28 内嵌 Chromium 中 `overflow:hidden` 会拦截鼠标滚轮事件，加 `html,body{height:100%}` 确保高度链从根元素贯通，滚轮事件穿透到子滚动容器 |

---

## 一、架构概览

```
┌──────────────────────────────────────────────────────────┐
│                      Electron App                        │
│                                                          │
│  ┌─── Main Process (Node.js) ──────────────────────┐    │
│  │                                                  │    │
│  │  index.ts ─── 应用入口，创建窗口                   │    │
│  │     └─ ipc-handlers.ts ─── IPC 路由注册           │    │
│  │           ├─ scanner.ts    ─── 视频文件扫描        │    │
│  │           │     └─ shared/episode-titles.ts       │    │
│  │           ├─ storage.ts    ─── JSON 文件读写       │    │
│  │           └─ shared/series-covers.ts ─── 封面映射  │    │
│  │                 └─ shared/types.ts                │    │
│  │                                                  │    │
│  └──────────────┬───────────────────────────────────┘    │
│                 │ IPC (invoke/handle)                    │
│  ┌──────────────┴───────────────────────────────────┐    │
│  │  Preload Layer (contextBridge)                   │    │
│  │  preload/index.ts ─── 安全 API 暴露               │    │
│  └──────────────┬───────────────────────────────────┘    │
│                 │ window.electronAPI                     │
│  ┌──────────────┴───────────────────────────────────┐    │
│  │  Renderer Process (Chromium + React)             │    │
│  │                                                  │    │
│  │  main.tsx → App.tsx (HashRouter)                 │    │
│  │    ├─ HomePage      → DirectoryConfig, SeriesList │    │
│  │    ├─ SeriesPage    → EpisodeList                 │    │
│  │    ├─ PlayerPage    → VideoPlayer, VideoControls  │    │
│  │    └─ HistoryPage                                 │    │
│  │                                                  │    │
│  │  Shared: Icons (SVG icon components)              │    │
│  │  State: useAppStore / usePlayerStore (Zustand)   │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 二、文件详解

### 层级关系

```
shared/          ← 纯类型与数据，被 main / renderer 共同引用
main/            ← 主进程，Node.js 环境，可访问 fs/dialog 等
preload/         ← 桥梁，用 contextBridge 暴露限定 API 给渲染进程
renderer/        ← 渲染进程，浏览器环境，React UI
```

---

### 1. `src/shared/types.ts` — 全局类型定义

| 导出 | 类型 | 说明 |
|------|------|------|
| `VIDEO_EXTENSIONS` | `string[]` | 支持的视频文件扩展名：`.mp4 .mkv .avi .ts .webm .mov .flv .rmvb`（注：`.rmvb` 可扫描但 Chromium 不支持播放，需转码为 MP4） |
| `SERIES_CATEGORIES` | 字面量数组 | 四种分类：`TV正片` `剧场版` `外传` `特别篇` |
| `SeriesCategory` | 联合类型 | `'TV正片' \| '剧场版' \| '外传' \| '特别篇'` |
| `VideoFile` | interface | 单个视频文件信息（id/filePath/fileName/seriesName/category/episodeNumber/episodeTitle/fileSize） |
| `Series` | interface | 系列信息（name + categories 数组，每个 category 包含 episodes） |
| `WatchHistory` | interface | 观看历史记录（id?/filePath/seriesName/episodeNumber/progress/duration/lastWatchedAt/completed） |
| `AppConfig` | interface | 应用配置（videoDirectories 字符串数组） |

**数据流转：**
```
AppConfig.videoDirectories → scanner.scanVideos() → { VideoFile[], Series[] }
WatchHistory → storage.saveProgress() → JSON 文件
```

---

### 2. `src/shared/episode-titles.ts` — 剧集标题数据库

| 导出 | 类型 | 说明 |
|------|------|------|
| `SeriesTitles` | interface | `{ [系列名]: { [集数]: "标题" } }` |
| `TITLES` | `SeriesTitles` | 标题数据（默认导出），当前收录 **假面骑士W 全49话** + **假面骑士时王 全49话** |
| `lookupTitle(seriesName, episodeNumber)` | 函数 → `string \| null` | 查询指定系列的指定集数标题，未找到返回 `null`。**大小写不敏感**：精确匹配失败后，忽略大小写回退查找 |
| `hasSeriesTitles(seriesName)` | 函数 → `boolean` | 判断是否有某系列的标题数据。**大小写不敏感** |

**扩展方式：** 在 `TITLES` 对象中按格式添加新系列即可：
```ts
const TITLES: SeriesTitles = {
  '假面骑士W': { 1: '...', 2: '...' },
  '假面骑士空我': { 1: '复活', 2: '变身' },  // 新增
}
```

---

### 2-bis. `src/shared/series-covers.ts` — 系列封面图片映射

| 导出 | 类型 | 说明 |
|------|------|------|
| `COVERS` | `Record<string, string>` | 系列名 → 封面图片文件名映射（默认导出），当前收录 **假面骑士W** + **假面骑士时王** |
| `getCoverFile(seriesName)` | 函数 → `string \| null` | 查询指定系列的封面图片文件名。**大小写不敏感** |
| `hasCover(seriesName)` | 函数 → `boolean` | 判断是否有某系列的封面图片 |

**图片文件：** 存放于 `resources/` 目录，WebP 格式，通过 `get-cover-url` IPC 通道转为 `file://` URL 供渲染进程加载。

**扩展方式：** 将新封面图片放入 `resources/`，在 `COVERS` 中添加映射即可：
```ts
const COVERS: Record<string, string> = {
  '假面骑士时王': 'Zi-O_Poster.webp',
  '假面骑士W': 'W_Poster.webp',
  '假面骑士空我': 'Kuuga_Poster.webp',  // 新增
}
```

---

### 3. `src/main/scanner.ts` — 视频文件扫描器

运行在 **Main Process**，递归扫描目录，解析视频文件的元信息。

#### 常量

| 常量 | 类型 | 说明 |
|------|------|------|
| `CATEGORY_KEYWORDS` | `Record<string, SeriesCategory>` | 目录名关键词 → 分类映射：`'TV'/'正片'→TV正片`, `'剧场版'/'movie'→剧场版`, `'外传'→外传`, `'特别篇'/'SP'→特别篇` |

#### 内部函数（模块私有）

| 函数 | 签名 | 说明 |
|------|------|------|
| `detectCategory` | `(dirName: string) => SeriesCategory` | 根据目录名关键词识别分类，匹配不到默认返回 `TV正片`。支持中/英/日文关键词 |
| `extractEpisodeNumber` | `(fileName: string) => number` | 从文件名提取集数，支持 `01` / `第01话` / `EP01` / `#01` / `[01]` 等8种格式，解析失败返回 0 |
| `isVideoFile` | `(fileName: string) => boolean` | 通过扩展名判断是否是视频文件 |
| `isNumericOnly` | `(fileName: string) => boolean` | 判断文件名是否纯数字格式（无描述性文字），如 `01.mp4` → true，`01-复活.mp4` → false |
| `buildEpisodeTitle` | `(fileName, seriesName, episodeNumber) => string` | 构建剧集显示标题的核心逻辑（见下方） |
| `scanDirectory` | `(dir: string) => VideoFile[]` | 递归扫描单个目录，返回视频文件列表。使用栈式迭代（非递归函数调用） |

#### 导出函数

| 函数 | 签名 | 说明 |
|------|------|------|
| `scanVideos` | `(directories: string[]) => { files: VideoFile[]; series: Series[] }` | **扫描器唯一入口**。遍历所有目录，汇总文件 → 按系列名+集数排序 → 分组为 Series 结构 |

#### `buildEpisodeTitle` 逻辑

```
输入：fileName="01.mp4", seriesName="假面骑士W", episodeNumber=1

1. 查 episode-titles 数据库
   ├─ 有数据 → 返回 "第1话 W的检索／侦探是两位一体"
   └─ 无数据 →
         ├─ 文件名纯数字 → 返回 "第1集"
         └─ 文件名有描述 → 返回原始文件名（去扩展名）
```

#### 系列/分类解析逻辑

```
目录结构：    SeriesName / Category / episode.mp4
              SeriesName / episode.mp4        （分类默认为 TV正片）

解析过程：
  父目录名 → detectCategory()
    ├─ 匹配到分类 → 父目录=分类, 祖父目录=系列名
    └─ 未匹配    → 父目录=系列名, 分类=TV正片
```

---

### 4. `src/main/storage.ts` — JSON 文件存储

运行在 **Main Process**，负责持久化配置和观看历史。

**存储路径（懒加载函数，避免模块级调用 `app.getPath`）：**

| 函数 | 返回值 | 说明 |
|------|------|------|
| `dataDir()` | `{userData}/data` | 数据根目录（`%APPDATA%/kamenrider-player/data`） |
| `configFile()` | `{dataDir}/config.json` | 应用配置文件路径 |
| `historyFile()` | `{dataDir}/history.json` | 观看历史文件路径 |

| 文件 | 内容 | 对应类型 |
|------|------|----------|
| `config.json` | 应用配置 | `AppConfig` |
| `history.json` | 观看历史数组 | `WatchHistory[]` |

#### 内部函数

| 函数 | 说明 |
|------|------|
| `ensureDataDir()` | 确保数据目录存在，不存在则递归创建 |
| `readJSON<T>(filePath, fallback)` | 泛型读 JSON，文件不存在或损坏时返回 fallback |
| `writeJSON(filePath, data)` | 写 JSON 文件，自动缩进格式化 |

#### 导出函数 — 配置

| 函数 | 签名 | 说明 |
|------|------|------|
| `getConfig` | `() => AppConfig` | 读取应用配置 |
| `setConfig` | `(key, value) => void` | 按 key 设置配置项 |

#### 导出函数 — 历史

| 函数 | 签名 | 说明 |
|------|------|------|
| `getAllHistory` | `() => WatchHistory[]` | 获取全部观看历史 |
| `getHistory` | `(filePath: string) => WatchHistory \| null` | 按文件路径查单条历史，没找到返回 null |
| `saveProgress` | `(data: WatchHistory) => void` | 保存/更新进度。已存在则合并更新并刷新时间戳，不存在则新增 |

---

### 5. `src/main/ipc-handlers.ts` — IPC 通道注册

运行在 **Main Process**，注册所有 IPC 通道（9 个），桥接前端请求与后端逻辑。

| 导出函数 | 说明 |
|------|------|
| `registerIpcHandlers()` | 在 `app.whenReady()` 中调用一次，注册全部 IPC 通道 |

#### IPC 通道速查表

| 通道名 | 方向 | 参数 | 返回值 | 触发操作 |
|--------|------|------|--------|----------|
| `scan-videos` | Renderer→Main | `directory?: string` | `{ files, series }` | scanner.scanVideos() |
| `get-config` | Renderer→Main | — | `AppConfig` | storage.getConfig() |
| `set-config` | Renderer→Main | `key: string, value: unknown` | `AppConfig` | storage.setConfig() |
| `get-watch-history` | Renderer→Main | `filePath: string` | `WatchHistory \| null` | storage.getHistory() |
| `get-all-watch-history` | Renderer→Main | — | `WatchHistory[]` | storage.getAllHistory() |
| `save-watch-progress` | Renderer→Main | `WatchHistory` | — | storage.saveProgress() |
| `get-video-path` | Renderer→Main | `filePath: string` | `string` | 透传文件路径 |
| `select-directory` | Renderer→Main | — | `string \| null` | dialog.showOpenDialog() |
| `get-cover-url` | Renderer→Main | `seriesName: string` | `string \| null` | series-covers.getCoverFile() → file:// URL |

---

### 6. `src/main/index.ts` — 主进程入口

Electron 应用入口，在 `package.json` 中声明为 `"main"`。

#### `createWindow()` 窗口配置

| 配置项 | 值 | 说明 |
|------|------|------|
| `width` × `height` | 1200 × 800 | 默认窗口尺寸 |
| `minWidth` × `minHeight` | 900 × 600 | 最小窗口限制 |
| `show` | `false` | 初始隐藏，`ready-to-show` 事件触发后才显示，避免白屏闪烁 |
| `autoHideMenuBar` | `true` | 隐藏菜单栏 |
| `title` | `'假面骑士播放器'` | 窗口标题 |
| `webPreferences.preload` | `join(__dirname, '../preload/index.js')` | 注入 Preload 脚本 |
| `webPreferences.sandbox` | `false` | 允许 Preload 访问 Node.js API |
| `webPreferences.webSecurity` | `false` | 允许加载本地 `file://` 视频 |

**额外处理：**
- `setWindowOpenHandler`：外部链接用系统默认浏览器打开
- 开发模式检测 `ELECTRON_RENDERER_URL` → `loadURL`，生产模式 → `loadFile`

#### 生命周期

| 生命周期 | 行为 |
|------|------|
| `app.whenReady()` | 注册 IPC → 创建窗口 |
| `app.on('activate')` | macOS Dock 点击时若无窗口则重建 |
| `app.on('window-all-closed')` | 非 macOS 平台直接退出 |

---

### 7. `src/preload/index.ts` — Preload 桥梁

使用 `contextBridge.exposeInMainWorld` 将受限 API 暴露给渲染进程。

**暴露对象：** `window.electronAPI`（9 个方法）

| 方法 | 对应 IPC 通道 |
|------|---------------|
| `scanVideos(directory?)` | `scan-videos` |
| `getConfig()` | `get-config` |
| `setConfig(key, value)` | `set-config` |
| `getWatchHistory(filePath)` | `get-watch-history` |
| `getAllWatchHistory()` | `get-all-watch-history` |
| `saveWatchProgress(data)` | `save-watch-progress` |
| `getVideoPath(relativePath)` | `get-video-path` |
| `getCoverUrl(seriesName)` | `get-cover-url` |
| `selectDirectory()` | `select-directory` |

**类型导出：** `ElectronAPI` 类型用于 `src/renderer/src/env.d.ts` 中的全局类型注入。

---

### 8. `src/renderer/` — React 渲染进程

#### 8.1 `index.html` — HTML 入口
单 div `#root` + `<script type="module" src="./src/main.tsx">`

#### 8.2 `src/main.tsx` — React 入口
`createRoot` 挂载 `<App />` 到 `#root`，外层包裹 `<React.StrictMode>`

#### 8.3 `src/App.tsx` — 根组件
使用 `HashRouter`（兼容 Electron file:// 协议）定义 4 条路由：

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | `HomePage` | 首页 |
| `/series/:seriesName` | `SeriesPage` | 系列详情（分类标签 + 剧集列表） |
| `/player/:videoId` | `PlayerPage` | 播放页（视频播放器 + 控制栏 + 剧集侧边栏） |
| `/history` | `HistoryPage` | 观看历史（按时间倒序 + 进度条 + 点击跳转播放） |

#### 8.4 `src/assets/main.css` — 全局样式
Tailwind 指令 + 自定义滚动条 + 全局 reset

**全局规则：**

| 规则 | 值 | 说明 |
|------|------|------|
| `:focus-visible` | `outline: 2px solid #ef4221` | 键盘导航焦点环，所有可交互元素共用 |
| `@media (prefers-reduced-motion)` | 所有动画/过渡设为 0.01ms | 尊重系统"减少动画"设置，不影响交互逻辑 |
| `html, body, #root` | `height: 100%` | 确保高度链从根元素贯通，让滚轮事件穿透到子滚动容器 |
| `body { overflow: hidden }` | 隐藏页面级滚动条 | 配合 `height:100%` 让子容器 (`overflow-y-auto`) 独立接管滚动 |
| `body { user-select: none }` | 禁止文本选中 | 桌面应用 UI 体验 |
| `#root` | `width: 100vw` | 根容器占满视口宽度 |
| `::-webkit-scrollbar` | `width/height: 8px` | 自定义滚动条宽度 |
| `::-webkit-scrollbar-track` | `background: #1f2937` | 滚动条轨道色 |
| `::-webkit-scrollbar-thumb` | `background: #6b7280` | 滚动条滑块色 |

#### 8.5 `src/env.d.ts` — 全局类型声明
将 `ElectronAPI` 类型注入 `Window` 接口，使 TS 能识别 `window.electronAPI`

---

### 9. `src/renderer/src/stores/` — 状态管理 (Zustand)

#### 9.1 `useAppStore.ts`

| 字段 | 类型 | 说明 |
|------|------|------|
| `videoDirectories` | `string[]` | 已配置的视频目录列表 |
| `videoFiles` | `VideoFile[]` | 扫描到的全部视频文件 |
| `series` | `Series[]` | 按系列分组的数据 |
| `isScanning` | `boolean` | 是否正在扫描 |
| `selectedSeries` | `string \| null` | 当前选中的系列（筛选用） |
| `selectedCategory` | `string \| null` | 当前选中的分类（筛选用） |

每个字段都有对应的 setter 函数。

#### 9.2 `usePlayerStore.ts`

| 字段 | 类型 | 说明 |
|------|------|------|
| `currentVideoId` | `string \| null` | 当前播放的视频 ID |
| `currentFilePath` | `string \| null` | 当前播放的视频文件路径 |
| `isPlaying` | `boolean` | 播放/暂停状态 |
| `currentTime` | `number` | 当前播放时间（秒） |
| `duration` | `number` | 视频总时长（秒） |
| `volume` | `number` | 音量 (0~1) |
| `playbackRate` | `number` | 播放倍速 |
| `isFullscreen` | `boolean` | 全屏状态 |

---

### 10. `src/renderer/src/components/` — 通用组件

#### 10.0 `Icons.tsx` — SVG 图标组件

提供应用内统一的 SVG 图标，替代跨平台不一致的 emoji。

| 组件 | Props | 说明 | 使用场景 |
|------|------|------|----------|
| `FolderOpen` | `className?` | 文件夹图标 | 首页空配置状态 |
| `Search` | `className?` | 搜索图标 | 首页无视频状态 |
| `Film` | `className?` | 胶片图标 | 播放页视频未找到 |
| `Tv` | `className?` | 电视图标 | 系列页/历史页空状态 |
| `X` | `className?` | 关闭图标 | 弹窗关闭按钮 |
| `Plus` | `className?` | 加号图标 | 添加按钮前缀 |
| `Volume` | `className?` + `level: 'off' \| 'low' \| 'high'` | 音量图标（三态） | 音量 OSD 面板 |

所有图标使用 `stroke` 而非 `fill` 绘制，与项目已有的播放/暂停/全屏 SVG 风格一致（strokeWidth 1.5~2.5，视图标尺寸调整）。

#### 10.1 `DirectoryConfig.tsx`

目录配置弹窗组件。

**Props：** `{ open: boolean; onClose: () => void }`

**内部状态：** `dirs`（编辑中的目录列表，弹窗打开时从 store 同步）、 `saving`（保存中标志）

**生命周期：** `useEffect([videoDirectories, open])` — 每次弹窗打开时，将 store 中的目录列表同步到本地编辑状态

| 内部逻辑 | 说明 |
|------|------|
| `handleAdd()` | 调用 `window.electronAPI.selectDirectory()` 弹出系统原生文件夹选择器，选中后去重添加到列表 |
| `handleRemove(dir)` | 从列表中移除指定目录 |
| `handleSave()` | ① 更新 store → ② IPC 持久化 `set-config` → ③ 触发 `scanVideos` → ④ 结果写入 store → ⑤ 关闭弹窗 |

**UI 结构：** 模态弹窗（头部标题 + X 关闭按钮 / 目录列表 + 移除按钮 / 底部 Plus 添加 + 保存按钮）

#### 10.2 `SeriesList.tsx`

系列卡片网格组件。

**Props：** `{ series: Series[] }`

**封面加载逻辑：**
- `useEffect` 在 `series` 变化时并行调用 `window.electronAPI.getCoverUrl()` 加载所有系列封面
- 结果存入 `coverUrls` Map（`Map<string, string | null>`）

**卡片渲染：**
- 有封面：展示封面图片（`object-cover` 填充）+ 底部渐变遮罩（`from-black/90 via-black/60 to-transparent`）+ 文字叠加
- 无封面：纯色 `bg-gray-900` 背景 + 文字，降级体验一致
- 卡片按钮 `cursor-pointer` + hover 微动效 `scale-[1.02]`
- 空数组时显示"暂无系列"提示（文字对比度已修正为 `text-gray-400`）
- 点击卡片跳转 `/series/:seriesName`

#### 10.3 `EpisodeList.tsx`

剧集列表组件。

**Props：** `{ episodes: VideoFile[]; seriesName: string; lastWatchedFilePath?: string | null }`  
> 注：`seriesName` 当前在接口中声明但组件体内未使用，保留用于未来扩展（如显示系列上下文）

- 空数组时显示"该分类下暂无剧集"
- 每行：集数标识（`第X集`）+ 标题 + 文件名（次要信息）
- 点击行跳转 `/player/:videoId`
- 标题过长自动截断 + 省略号
- **上次看到标记：** 当 `lastWatchedFilePath` 匹配某行 `ep.filePath` 时，该行显示主色左边框（`border-l-2 border-primary-500`）+ 编号/标题着色（`text-primary-400/300`）+ "上次"标签（`bg-primary-600/30 text-primary-400`）

#### 10.4 `VideoPlayer.tsx`

视频播放核心组件，封装 HTML5 `<video>` 元素。

**Props：** `{ filePath: string }`  
**Ref 转发：** `forwardRef<HTMLVideoElement>` — 父组件通过 ref 操控视频元素

**内部函数：**
| 函数 | 说明 |
|------|------|
| `toFileUrl(filePath)` | 将 Windows 路径转为合法 file:// URL。`D:\videos\01.mp4` → `file:///D:/videos/01.mp4`，对路径片段做 `encodeURIComponent` 编码 |
| `<video>` 定位 | 使用 `w-full h-full object-contain` + `autoPlay`，进入播放页自动播放，撑满父容器并保持宽高比。父容器 `flex items-center justify-center` 居中；高度约束由 PlayerPage 的 `min-h-0` 保证，窗口化不溢出、全屏铺满屏幕 |

**事件处理：**
- `onClick`：单击视频画面切换播放/暂停
- `onDoubleClick`：双击切换全屏（`video-area` 元素进入/退出全屏）
- `play/pause` → store.isPlaying
- `timeupdate` → store.currentTime / store.duration
- `loadedmetadata` → store.duration
- `volumechange` → store.volume
- `ratechange` → store.playbackRate

**本地文件加载：** `src={toFileUrl(filePath)}` → 合法的 `file:///` URL

#### 10.5 `VideoControls.tsx`

悬浮式视频控制栏，叠加在 `VideoPlayer` 之上。

**Props：** `{ videoRef: RefObject<HTMLVideoElement | null>; onShowChange?: (show: boolean) => void }`  
**Ref 暴露：** `VideoControlsHandle { wake(): void }` — 父容器调用 `wake()` 恢复控件可见并重置3秒自动隐藏计时器。`onShowChange` 回调在控件可见性变化时通知父组件（用于同步侧边栏按钮显隐）

**核心功能：** 

| 功能 | 实现 |
|------|------|
| 自动隐藏 | 播放时 3 秒无操作自动淡出，暂停时始终显示，父容器 `onMouseMove` 调用 `wake()` 唤醒 |
| 播放/暂停 | 按钮（含 `aria-label="播放/暂停"`）+ 点击视频画面切换 |
| 进度条 | `<input range>` 自定义样式，主色渐变填充，拖拽 seek |
| 时间显示 | `m:ss` 格式，拖拽时实时更新 seek 预览 |
| 音量 | 滑块调节 (0~1) |
| 倍速 | 下拉菜单：0.5x / 0.75x / 1x / 1.25x / 1.5x / 2x |
| 全屏 | 按钮（含 `aria-label="全屏/退出全屏"`）+ 快捷键 `F` + 双击视频画面 |

**键盘快捷键：** `Space` 暂停/播放 | `←` 快退5秒 | `→` 快进5秒 | `↑` 音量+5% | `↓` 音量-5%（伴有居中 OSD 提示，1.2 秒自动消失） | `S` 跳过片头 +75 秒 | `F` 全屏

**跳过片头按钮：** 播放按钮右侧 `+85s` 按钮（含 `aria-label="跳过片头"`），点击或按 `S` 键 → `video.currentTime += 85`（上限不超过总时长），用于一键跳过片头曲

**音量 OSD：** 用方向键调节音量时，屏幕中央弹出半透明面板，显示 Volume 图标（三态：off/low/high）+ 当前音量百分比，1.2 秒无操作后自动淡出

### 11. `src/renderer/src/pages/` — 页面组件

#### 11.1 `HomePage.tsx`

首页，四种状态：

| 状态 | 条件 | 显示 |
|------|------|------|
| 加载中 | `!initialized \|\| isScanning` | 旋转加载动画 + 文字 |
| 空配置 | `initialized && !hasDirs` | `<FolderOpen>` 图标 + 引导文字 + "开始配置"按钮 |
| 无视频 | `hasDirs && !hasVideos` | `<Search>` 图标 + "未找到视频"提示 |
| 正常 | `hasVideos` | `<SeriesList>` 系列网格 |

**初始化流程：**
```
mount → getConfig() → 更新 store.videoDirectories
  → 如果有目录 → scanVideos() → 更新 store.series/videoFiles
```

顶部固定 Header：标题 + "观看历史"链接 + "配置目录"按钮

#### 11.2 `SeriesPage.tsx`

系列详情页，展示某系列下各分类的剧集列表。

**URL 参数：** `:seriesName`

**内部状态：** `activeCategory`（当前选中的分类标签）

**核心逻辑：**
- 根容器 `flex-1 flex flex-col min-h-0 overflow-hidden`，形成正确的高度约束链，确保剧集列表区域可滚动
- `useMemo` 从 store 中匹配系列（`decodeURIComponent` 解码 URL 编码的系列名）
- `useEffect` 在 `matched` 变化时调用 `getAllWatchHistory()` → 按系列名过滤 → 按 `lastWatchedAt` 降序 → 取第一条 `filePath` 作为 `lastWatchedFilePath` 传给 `EpisodeList`
- 分类标签从系列实际拥有的 `categories` 动态生成
- 默认选中第一个分类，切换标签时更新 `EpisodeList` 数据

**三种状态：**
| 状态 | 条件 | 显示 |
|------|------|------|
| 系列不存在 | `matched === undefined` | `<Tv>` 图标 + "未找到系列" + 返回链接 |
| 正常 | `matched` | Header（返回 + 系列名 + 统计）→ 分类标签栏 → 剧集列表 |

#### 11.3 `PlayerPage.tsx`

播放页容器，组合 `VideoPlayer` + `VideoControls` + 剧集侧边栏。

**URL 参数：** `:videoId`

**核心逻辑：**
- 根容器 `flex-1 flex flex-col min-h-0`，配合 content-row 的 `flex-1 min-h-0 overflow-hidden` 形成正确的高度约束链，确保视频不会撑破布局
- `useMemo` 从 `videoFiles` 查找当前视频，从 `series` 查找所属系列
- 将同系列所有分类的剧集扁平化为 `seriesEpisodes` 数组
- `useRef<HTMLVideoElement>` 桥接 `VideoPlayer` 和 `VideoControls`
- `useRef<VideoControlsHandle>` 父容器 `onMouseMove` 调用 `controlsRef.current.wake()` 唤醒隐藏的控件
- 视频容器 `flex items-center justify-center` 确保视频始终居中
- `VideoPlayer` 使用 `key={video.filePath}` 确保切换剧集时组件完全重新挂载
- 侧边栏仅在 `seriesEpisodes.length > 1` 时显示

**布局：**
```
Header（← 系列名 + 剧集标题）
┌──────────────────────┬──────────┐
│  [续播对话框 z-50]    │ 剧集列表  │
│    VideoPlayer       │ - #01  ..│
│    ┌──────────┐      │ - #02 ✓ │
│    │ Controls │      │ - #03 ..│
│    └──────────┘      │          │
└──────────────────────┴──────────┘
```

**侧边栏行为：** 窗口化时固定显示；全屏时右侧显示 `◂` 按钮（鼠标移动唤醒，播放时 3 秒无操作控件+侧边栏按钮+鼠标光标一同隐藏，暂停时均保持显示），点击展开浮层侧边栏，选剧后自动关闭 + 跳转。展开时左侧半透明遮罩，点击遮罩也可关闭

**断点续播：** mount 时查询该文件的观看历史，若 `progress > 30秒` 弹出确认框（"上次看到 XX:XX，是否继续？"），确认后 `video.currentTime = progress`；进度 ≤30秒则自动恢复不弹窗。

**自动保存：** `useEffect` 每 5 秒调用 `saveWatchProgress` 写入当前进度；组件卸载时 `return () => { saveProgress() }` 确保最后一次进度不丢失。

#### 11.4 `HistoryPage.tsx`

观看历史记录页。

**数据获取：** `mount` → `getAllWatchHistory()` → 按 `lastWatchedAt` 倒序排列  
**Store 依赖：** `useAppStore.videoFiles` → 构建 `videoIdByPath` Map（filePath → videoId），用于将历史记录中的文件路径映射为正确的路由参数

**内部辅助函数：**
| 函数 | 说明 |
|------|------|
| `formatDate(iso)` | 相对时间："刚刚" / "3 分钟前" / "2 小时前" / "5 天前" / 日期格式 |
| `formatProgress(progress, duration)` | 百分比计算 |
| `formatTime(seconds)` | `m:ss` 格式 |
| `handleHistoryClick(item)` | 通过 `videoIdByPath` 查找 videoId 后 `navigate(/player/:videoId)`；若文件已不在扫描目录中则不跳转 |

**三种状态：**
| 状态 | 显示 |
|------|------|
| 加载中 | 旋转加载动画 |
| 空记录 | `<Tv>` 图标 + "暂无观看记录" + 引导文字 + 返回链接 |
| 有记录 | Header（返回 + 标题 + 记录数）→ 历史列表 |

**列表每行：** 系列名 + 集数标识 + 进度条（主色填充）+ 时间信息 + 最后观看时间（相对时间）+ 已看完标记（绿色标签），点击跳转对应播放页。若视频文件已不在扫描目录中（`videoIdByPath` 未命中），按钮置灰 `opacity-50 cursor-not-allowed` 且禁用点击。

---

## 三、数据流

```
用户操作                     IPC                      后端处理
─────────                  ──────                    ────────

[首页加载]
getConfig()  ──────────→  get-config  ──────────→ storage.getConfig()
                          ←  { videoDirectories }

[扫描视频]
scanVideos() ──────────→  scan-videos  ─────────→ scanner.scanVideos()
                          ←  { files, series }        ├─ scanDirectory()
                                                      │    ├─ detectCategory()
                                                      │    ├─ extractEpisodeNumber()
                                                      │    └─ buildEpisodeTitle()
                                                      │         └─ lookupTitle()
                                                      └─ 分组 → Series[]

[保存进度]
saveWatchProgress() ───→  save-watch-progress  ──→ storage.saveProgress()
                                                    → 写入 history.json
```

---

## 四、IPC 通道速查

```
Renderer 调用                           Main 处理
════════════                            ══════════

window.electronAPI.getConfig()          ipcMain.handle('get-config')
window.electronAPI.setConfig(k,v)       ipcMain.handle('set-config')
window.electronAPI.scanVideos(dir?)     ipcMain.handle('scan-videos')
window.electronAPI.selectDirectory()    ipcMain.handle('select-directory')
window.electronAPI.getWatchHistory(fp)  ipcMain.handle('get-watch-history')
window.electronAPI.getAllWatchHistory() ipcMain.handle('get-all-watch-history')
window.electronAPI.saveWatchProgress(d) ipcMain.handle('save-watch-progress')
window.electronAPI.getVideoPath(fp)     ipcMain.handle('get-video-path')
window.electronAPI.getCoverUrl(name)    ipcMain.handle('get-cover-url')
```
