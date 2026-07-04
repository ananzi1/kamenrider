import { ipcMain, dialog, app } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { scanVideos } from './scanner'
import { getConfig, setConfig, getHistory, getAllHistory, saveProgress } from './storage'
import { getCoverFile } from '../shared/series-covers'

export function registerIpcHandlers(): void {
  // --- Scanner ---

  ipcMain.handle('scan-videos', async (_event, directory?: string) => {
    const config = getConfig()
    const dirs = directory ? [directory, ...config.videoDirectories] : config.videoDirectories

    if (dirs.length === 0) return { files: [], series: [] }

    const uniqueDirs = [...new Set(dirs.filter(Boolean))]
    const result = scanVideos(uniqueDirs)
    return result
  })

  // --- Config ---

  ipcMain.handle('get-config', async () => {
    return getConfig()
  })

  ipcMain.handle('set-config', async (_event, key: string, value: unknown) => {
    setConfig(key as 'videoDirectories', value)
    return getConfig()
  })

  // --- Watch History ---

  ipcMain.handle('get-watch-history', async (_event, filePath: string) => {
    return getHistory(filePath)
  })

  ipcMain.handle('get-all-watch-history', async () => {
    return getAllHistory()
  })

  ipcMain.handle('save-watch-progress', async (_event, data) => {
    saveProgress(data)
  })

  // --- Video Path (for src attribute) ---
  // Returns the absolute file path so renderer can load local files
  ipcMain.handle('get-video-path', async (_event, filePath: string) => {
    return filePath
  })

  // --- Directory Picker ---

  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  // --- Cover Image ---

  ipcMain.handle('get-cover-url', async (_event, seriesName: string) => {
    const coverFile = getCoverFile(seriesName)
    if (!coverFile) return null

    const coverPath = app.isPackaged
      ? join(process.resourcesPath, coverFile)
      : join(__dirname, '../../resources', coverFile)

    if (!existsSync(coverPath)) return null

    // Convert to file:// URL (same logic as VideoPlayer's toFileUrl)
    const normalized = coverPath.replace(/\\/g, '/')
    const encoded = normalized
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/')
    return `file:///${encoded}`
  })
}
