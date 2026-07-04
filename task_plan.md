# 任务计划：假面骑士本地视频播放器

## 目标
构建一个功能完整的 Electron 桌面视频播放器，用于管理和播放假面骑士系列视频文件。

## 当前阶段
基础功能已完成，持续改进中

## 各阶段

### 阶段 1：项目脚手架 ✅
- [x] Electron 33 + React 18 + Vite 5 + TypeScript 5 + Tailwind 3 + Zustand 5
- [x] 主进程窗口创建 (1200×800)
- [x] Preload 注入 + IPC 注册入口
- **状态：** complete

### 阶段 2：核心后端 ✅
- [x] 类型定义 (7 个导出)
- [x] 剧集标题库 (W 全49话 + 时王 全49话)
- [x] 视频扫描器 (递归扫描 → 系列/分类/集数解析)
- [x] JSON 存储 (配置 + 观看历史 CRUD)
- [x] IPC 通道 (9 个)
- **状态：** complete

### 阶段 3：前端页面 ✅
- [x] HashRouter 4 条路由
- [x] Zustand 状态管理 (useAppStore + usePlayerStore)
- [x] 首页 (三态切换 + Header)
- [x] 目录配置 (原生文件夹选择器 + 增删 + 保存扫描)
- [x] 系列列表 (响应式卡片网格 + 封面图片)
- [x] 系列详情页 (分类标签 + 剧集列表 + 上次看到标记)
- [x] 视频播放器 (HTML5 video + 事件同步)
- [x] 播放控制栏 (进度条/音量/倍速/全屏 + 键盘快捷键)
- [x] 播放页 (播放器 + 侧边栏 + 断点续播 + 自动保存)
- [x] 观看历史页 (倒序列表 + 进度条 + 相对时间)
- **状态：** complete

### 阶段 4：Bug 修复 ✅
- [x] file:// URL 路径编码
- [x] RMVB 扫描 + 转码脚本
- [x] 标题大小写不敏感匹配
- [x] Flexbox 滚动修复 (min-h-0)
- [x] 视频偏位 + 控件浮现 + 双击全屏
- [x] 历史记录导航失败
- [x] 全屏黑屏 (sidebarVisible)
- [x] 全屏续播对话框不可见
- [x] 全屏侧边栏按钮自动隐藏
- **状态：** complete

### 阶段 5：UI/UX 规范化 ✅
- [x] 全应用 emoji 替换为 SVG 图标 (Icons.tsx, 7 个组件)
- [x] 图标按钮添加 aria-label
- [x] 全局 focus-visible 焦点环
- [x] 尊重 prefers-reduced-motion
- [x] 文字对比度修正 (gray-500 → gray-400)
- [x] cursor-pointer 补全
- [x] 构建验证通过
- [x] CODE_DOC.md 同步更新
- **状态：** complete

### 阶段 6：后续改进
- [ ] 亮色模式支持
- [ ] 更多假面骑士系列标题数据
- [ ] 视频播放记忆优化
- [ ] 播放列表功能
- **状态：** pending

## 关键问题
1. 是否需要支持亮色/暗色主题切换？
2. 需要添加哪些新的假面骑士系列标题？

## 已做决策
| 决策 | 理由 |
|------|------|
| JSON 文件存储而非 SQLite | better-sqlite3 需要原生编译，当前环境缺少 ClangCL |
| HashRouter 而非 BrowserRouter | Electron file:// 协议不兼容 BrowserRouter |
| webSecurity: false | 允许加载本地 file:// 视频 |
| Flexbox 滚动需 min-h-0 | flex 子元素默认 min-height: auto 会导致 overflow 失效 |
| 不引入图标库，使用内联 SVG | 保持零额外依赖，与现有代码风格一致 |

## 遇到的错误
| 错误 | 尝试次数 | 解决方案 |
|------|---------|---------|
| better-sqlite3 原生编译失败 | 1 | 改用 fs 模块读写 JSON |
| GitHub push 权限拒绝 | 1 | 改用 HTTPS + token 认证 |
| D: pagefile.sys 权限删除失败 | 2 | 用 attrib -s -h 去系统属性后删除 |

## 备注
- GitHub 仓库：https://github.com/ananzi1/kamenrider
- 已安装 Skills：superpowers, code-simplifier, ui-ux-pro-max, planning-with-files-zh, open-code-review
- 每次修改后运行 `npm run build` 验证
- 同步更新 CODE_DOC.md
