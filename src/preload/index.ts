import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const api = {
  // Scanner
  scanVideos: (directory?: string) => ipcRenderer.invoke('scan-videos', directory),
  getConfig: () => ipcRenderer.invoke('get-config'),
  setConfig: (key: string, value: unknown) => ipcRenderer.invoke('set-config', key, value),

  // Watch history
  getWatchHistory: (filePath: string) => ipcRenderer.invoke('get-watch-history', filePath),
  saveWatchProgress: (data: {
    filePath: string
    seriesName: string
    episodeNumber: number
    progress: number
    duration: number
    completed: boolean
  }) => ipcRenderer.invoke('save-watch-progress', data),
  getAllWatchHistory: () => ipcRenderer.invoke('get-all-watch-history'),

  // Video file - get local file path for src attribute
  getVideoPath: (relativePath: string) => ipcRenderer.invoke('get-video-path', relativePath),

  // Cover image
  getCoverUrl: (seriesName: string) => ipcRenderer.invoke('get-cover-url', seriesName),

  // Directory picker
  selectDirectory: () => ipcRenderer.invoke('select-directory')
}

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api
