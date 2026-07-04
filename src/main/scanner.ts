import { readdirSync, statSync } from 'fs'
import { join, basename, extname } from 'path'
import { createHash } from 'crypto'
import type { VideoFile, Series, SeriesCategory } from '../shared/types'
import { VIDEO_EXTENSIONS, SERIES_CATEGORIES } from '../shared/types'
import { lookupTitle } from '../shared/episode-titles'

const CATEGORY_KEYWORDS: Record<string, SeriesCategory> = {
  'TV': 'TV正片',
  'tv': 'TV正片',
  '正片': 'TV正片',
  '剧场版': '剧场版',
  '劇場版': '剧场版',
  'movie': '剧场版',
  'MOVIE': '剧场版',
  '外传': '外传',
  '外傳': '外传',
  '特别篇': '特别篇',
  '特別篇': '特别篇',
  'special': '特别篇',
  'SP': '特别篇'
}

function detectCategory(dirName: string): SeriesCategory {
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (dirName.includes(keyword)) {
      return category
    }
  }
  return 'TV正片' // default
}

function extractEpisodeNumber(fileName: string): number {
  // Match patterns like "01", "02", "第01话", "EP01", "E01", etc.
  const patterns = [
    /第\s*(\d+)\s*[话話集]/,
    /EP?\.?\s*(\d+)/i,
    /#(\d+)/,
    /\[(\d+)\]/,
    /\((\d+)\)/,
    /^(\d{1,3})/,
    /[^a-zA-Z](\d{1,3})[^a-zA-Z]/,
    /(\d{1,3})\s*$/  // trailing number
  ]

  for (const pattern of patterns) {
    const match = fileName.match(pattern)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > 0 && num < 1000) {
        return num
      }
    }
  }
  return 0
}

function isVideoFile(fileName: string): boolean {
  const ext = extname(fileName).toLowerCase()
  return VIDEO_EXTENSIONS.includes(ext)
}

/**
 * 判断文件名是否只有纯数字（无描述性标题）
 * 如 "01.mp4"、"02.mkv" → 纯数字
 *    "01 复活.mp4"、"第1话.mkv" → 有描述
 */
function isNumericOnly(fileName: string): boolean {
  const name = fileName.replace(extname(fileName), '').trim()
  // 只包含数字、前导零以及少量标点（空格、横线、点）
  return /^[\d\s.\-_]+$/.test(name)
}

/**
 * 构建剧集显示标题
 * 有标准标题数据 → "第X话 标题"
 * 无数据但文件名有描述 → 保留文件名
 * 无数据且纯数字文件名 → "第X集"
 */
/**
 * 从文件名中提取 KRL 字幕组格式的标题
 * 格式：[字幕组][系列名][集数][标题][分辨率].扩展名
 * 如：[KRL字幕組][Kamen Rider Ex-Aid][01][I'm a 假面騎士][720p].mp4
 * 返回第四段 [...] 的内容，不匹配则返回 null
 */
function extractBracketTitle(fileName: string): string | null {
  const match = fileName.match(/^\[[^\]]*\]\[[^\]]*\]\[\d+\]\[([^\]]+)\]/)
  return match ? match[1] : null
}

function buildEpisodeTitle(
  fileName: string,
  seriesName: string,
  episodeNumber: number
): string {
  const canonical = lookupTitle(seriesName, episodeNumber)

  if (canonical) {
    return `第${episodeNumber}话 ${canonical}`
  }

  // KRL 括号格式自动提取标题（优先级高于纯数字文件名兜底）
  const bracketTitle = extractBracketTitle(fileName)
  if (bracketTitle) {
    return `第${episodeNumber}话 ${bracketTitle}`
  }

  // 无标准标题，看文件名是否有描述
  if (episodeNumber > 0 && isNumericOnly(fileName)) {
    return `第${episodeNumber}集`
  }

  // 保留原始文件名（去掉扩展名）
  return fileName.replace(extname(fileName), '')
}

function scanDirectory(dir: string): VideoFile[] {
  const results: VideoFile[] = []
  const stack: string[] = [dir]

  while (stack.length > 0) {
    const current = stack.pop()!
    let entries: string[]

    try {
      entries = readdirSync(current)
    } catch {
      continue // skip unreadable directories
    }

    for (const entry of entries) {
      const fullPath = join(current, entry)
      let stat

      try {
        stat = statSync(fullPath)
      } catch {
        continue
      }

      if (stat.isDirectory()) {
        stack.push(fullPath)
      } else if (stat.isFile() && isVideoFile(entry)) {
        const relativePath = fullPath // We'll use full path for now
        const parentDir = basename(current) // immediate parent dir name
        const grandParentDir = basename(join(current, '..')) // series name candidate
        const fileName = entry

        // Determine series name and category from directory structure
        // Structure: SeriesName/Category/episode.mp4  OR  SeriesName/episode.mp4
        let seriesName = ''
        let category: SeriesCategory = 'TV正片'

        // Check if parent dir matches a category
        const parentCategory = detectCategory(parentDir)
        if (parentCategory !== 'TV正片' || SERIES_CATEGORIES.includes(parentDir as SeriesCategory)) {
          // Parent is a category folder, grandparent is series name
          category = parentCategory
          seriesName = grandParentDir
        } else {
          // Parent is series name, no category subfolder
          seriesName = parentDir
        }

        // If seriesName is empty or looks like root, use grandparent
        if (!seriesName || seriesName === basename(dir)) {
          seriesName = grandParentDir
        }

        const episodeNumber = extractEpisodeNumber(fileName)
        const episodeTitle = buildEpisodeTitle(fileName, seriesName, episodeNumber)

        results.push({
          id: createHash('md5').update(fullPath).digest('hex').substring(0, 12),
          filePath: fullPath,
          fileName,
          seriesName,
          category,
          episodeNumber,
          episodeTitle,
          fileSize: stat.size
        })
      }
    }
  }

  return results
}

export function scanVideos(directories: string[]): { files: VideoFile[]; series: Series[] } {
  const allFiles: VideoFile[] = []

  for (const dir of directories) {
    const files = scanDirectory(dir)
    allFiles.push(...files)
  }

  // Sort files: by series name, then by episode number
  allFiles.sort((a, b) => {
    if (a.seriesName !== b.seriesName) {
      return a.seriesName.localeCompare(b.seriesName, 'zh')
    }
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category, 'zh')
    }
    return a.episodeNumber - b.episodeNumber
  })

  // Group into series
  const seriesMap = new Map<string, Map<string, VideoFile[]>>()

  for (const file of allFiles) {
    if (!seriesMap.has(file.seriesName)) {
      seriesMap.set(file.seriesName, new Map())
    }
    const catMap = seriesMap.get(file.seriesName)!
    if (!catMap.has(file.category)) {
      catMap.set(file.category, [])
    }
    catMap.get(file.category)!.push(file)
  }

  const series: Series[] = []
  for (const [name, catMap] of seriesMap) {
    series.push({
      name,
      categories: Array.from(catMap.entries()).map(([category, episodes]) => ({
        category,
        episodes
      }))
    })
  }

  // Sort series by name
  series.sort((a, b) => a.name.localeCompare(b.name, 'zh'))

  return { files: allFiles, series }
}
