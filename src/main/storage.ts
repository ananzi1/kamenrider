import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import type { AppConfig, WatchHistory } from '../shared/types'

// Lazy init — app.getPath must only be called after app.whenReady()
let _dataDir = ''
function dataDir(): string {
  if (!_dataDir) {
    _dataDir = join(app.getPath('userData'), 'data')
  }
  return _dataDir
}
function configFile(): string {
  return join(dataDir(), 'config.json')
}
function historyFile(): string {
  return join(dataDir(), 'history.json')
}

function ensureDataDir(): void {
  const dir = dataDir()
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function readJSON<T>(filePath: string, fallback: T): T {
  try {
    if (existsSync(filePath)) {
      return JSON.parse(readFileSync(filePath, 'utf-8')) as T
    }
  } catch {
    // file corrupted or unreadable, use fallback
  }
  return fallback
}

function writeJSON(filePath: string, data: unknown): void {
  ensureDataDir()
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

// --- App Config ---

export function getConfig(): AppConfig {
  return readJSON<AppConfig>(configFile(), { videoDirectories: [] })
}

export function setConfig(key: keyof AppConfig, value: unknown): void {
  const config = getConfig()
  ;(config as Record<string, unknown>)[key] = value
  writeJSON(configFile(), config)
}

// --- Watch History ---

export function getAllHistory(): WatchHistory[] {
  return readJSON<WatchHistory[]>(historyFile(), [])
}

export function getHistory(filePath: string): WatchHistory | null {
  const all = getAllHistory()
  return all.find((h) => h.filePath === filePath) ?? null
}

export function saveProgress(data: WatchHistory): void {
  const all = getAllHistory()
  const idx = all.findIndex((h) => h.filePath === data.filePath)
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...data, lastWatchedAt: new Date().toISOString() }
  } else {
    all.push({ ...data, lastWatchedAt: new Date().toISOString() })
  }
  writeJSON(historyFile(), all)
}
