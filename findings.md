# 发现与决策

## 需求
- 假面骑士爱好者使用的本地视频播放器
- 支持按系列/分类自动整理视频文件
- 断点续播 + 观看历史
- 键盘快捷键操作

## 研究发现
- Electron file:// 协议需要使用 HashRouter
- Chromium 不支持 RMVB 解码，需 ffmpeg 转码
- Windows 路径中的反斜杠需转为正斜杠才能构造合法 file:// URL
- Tailwind 的 `hoverOnlyWhenSupported` 可优雅处理触屏设备 hover 问题
- Emoji 在不同 OS/字体下渲染不一致，应使用 SVG 图标

## 技术决策
| 决策 | 理由 |
|------|------|
| 栈式迭代扫描目录 | 避免深层目录递归导致栈溢出 |
| `toFileUrl()` 路径编码 | 反斜杠→正斜杠 + encodeURIComponent + 三斜杠格式 |
| 扫描时收录 .rmvb | 用户实际视频大量为 RMVB，Chromium 不支持播放但列表中可见 |
| lookupTitle 大小写不敏感 | 目录名与数据库 key 大小写可能不一致 |
| html,body{height:100%} | Electron 28 内嵌 Chromium 中 overflow:hidden 会拦截鼠标滚轮 |
| 不引入图标库 | 保持零额外依赖，内联 SVG 风格统一 |
| 关闭按钮+图标按钮加 aria-label | WCAG 无障碍要求，屏幕阅读器需要 |

## 遇到的问题
| 问题 | 解决方案 |
|------|---------|
| better-sqlite3 原生编译失败 (缺少 ClangCL) | 改用 fs 模块读写 JSON 文件 |
| 夸克网盘劫持 HTTP/HTTPS 协议 | Windows 设置→默认应用→恢复浏览器默认 |
| D: 盘 16GB pagefile.sys 残留 | 系统只配置了 C: 盘页面文件，D: 盘文件可安全删除 |
| Git 安全目录错误 | `git config --global --add safe.directory F:/kamenrider` |
| npx skills add 未选 Claude Code | 交互界面需空格选中再回车 |

## 资源
- 项目仓库：https://github.com/ananzi1/kamenrider
- Skills 目录：`~/.claude/skills/`
- 已安装 Skills：superpowers, code-simplifier, ui-ux-pro-max, planning-with-files-zh, open-code-review

## 视觉/浏览器发现
- 暗色主题整体一致，但无亮色模式
- 封面图片展示 + 渐变遮罩效果良好
- 视频播放控制栏交互流畅
- UI/UX 审查完成，已修复 9 项问题

---
*每执行2次查看/浏览器/搜索操作后更新此文件*
*防止视觉信息丢失*
