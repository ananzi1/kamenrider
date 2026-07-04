/**
 * RMVB → MP4 批量转码脚本（假面骑士W 播放兼容修复）
 *
 * 用法：node scripts/convert-rmvb.js <视频目录>
 * 示例：node scripts/convert-rmvb.js "D:\KamenRider\假面骑士W"
 *
 * 前提：系统需安装 ffmpeg 并加入 PATH（https://ffmpeg.org/download.html）
 *
 * 转码参数：
 *   -c:v libx264    → H.264 视频编码（Chromium 原生支持）
 *   -c:a aac        → AAC 音频编码
 *   -preset medium  → 平衡速度与压缩率
 *   -crf 23         → 视觉无损级别（越小画质越好，18-28 常用）
 *   -b:a 128k       → 音频 128kbps
 *   -y              → 自动覆盖已存在的输出文件
 */

const { execSync } = require('child_process')
const { readdirSync, statSync, existsSync } = require('fs')
const { join, extname, basename } = require('path')

// ── 检查 ffmpeg ──
try {
  execSync('ffmpeg -version', { stdio: 'ignore' })
} catch {
  console.error('❌ 未检测到 ffmpeg，请先安装：https://ffmpeg.org/download.html')
  console.error('   安装后将 ffmpeg.exe 所在目录加入系统 PATH 环境变量')
  process.exit(1)
}

// ── 读取参数 ──
const dir = process.argv[2]
if (!dir) {
  console.error('用法: node scripts/convert-rmvb.js <视频目录>')
  console.error('示例: node scripts/convert-rmvb.js "D:\\KamenRider\\假面骑士W"')
  process.exit(1)
}
if (!existsSync(dir)) {
  console.error(`❌ 目录不存在: ${dir}`)
  process.exit(1)
}

// ── 递归查找 RMVB ──
function* findRMVB(root) {
  const entries = readdirSync(root, { withFileTypes: true })
  for (const e of entries) {
    const full = join(root, e.name)
    if (e.isDirectory()) {
      yield* findRMVB(full)
    } else if (e.isFile() && extname(e.name).toLowerCase() === '.rmvb') {
      yield full
    }
  }
}

const files = [...findRMVB(dir)]

if (files.length === 0) {
  console.log('✅ 未找到 .rmvb 文件，无需转换')
  process.exit(0)
}

// ── 执行转码 ──
console.log(`找到 ${files.length} 个 RMVB 文件:\n`)
files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`))
console.log(`\n开始转码…（大文件可能需要几分钟）\n`)

let done = 0
let failed = 0

for (const f of files) {
  const out = f.replace(/\.rmvb$/i, '.mp4')
  const name = basename(f)
  process.stdout.write(`[${++done}/${files.length}] ${name} → `)

  try {
    execSync(
      `ffmpeg -i "${f}" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -y "${out}"`,
      { stdio: 'pipe', timeout: 600000 } // 10 min timeout per file
    )
    console.log('✅')
  } catch (e) {
    console.log('❌')
    failed++
  }
}

// ── 结果 ──
console.log(`\n${'─'.repeat(50)}`)
console.log(`完成：${done - failed} 成功 / ${failed} 失败 / 共 ${done} 个`)

if (failed > 0) {
  console.log('\n失败的文件可能编码损坏，请检查原文件')
}
if (done - failed > 0) {
  console.log('\n转码后的 .mp4 已生成在原目录。确认播放正常后，可删除原 .rmvb 文件：')
  console.log(`  del "${dir}\\*.rmvb" /s`)
}
console.log('\n重新扫描视频目录即可在播放器中看到新文件。')
