// Video file types supported
export const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.ts', '.webm', '.mov', '.flv', '.rmvb']

// Series categories
export const SERIES_CATEGORIES = ['TV正片', '剧场版', '外传', '特别篇'] as const
export type SeriesCategory = (typeof SERIES_CATEGORIES)[number]

// Scanned video file info
export interface VideoFile {
  id: string // Unique identifier (file path hash)
  filePath: string // Absolute file path
  fileName: string // File name with extension
  seriesName: string // e.g., "假面骑士空我"
  category: SeriesCategory // TV正片 / 剧场版 / 外传 / 特别篇
  episodeNumber: number // Episode number, 0 for non-episodic content
  episodeTitle: string // Display title
  fileSize: number // File size in bytes
}

// Scanned series info
export interface Series {
  name: string
  categories: {
    category: SeriesCategory
    episodes: VideoFile[]
  }[]
}

// Watch history record
export interface WatchHistory {
  id?: number
  filePath: string
  seriesName: string
  episodeNumber: number
  progress: number // seconds
  duration: number // seconds
  lastWatchedAt?: string
  completed: boolean
}

// App configuration
export interface AppConfig {
  videoDirectories: string[]
}
