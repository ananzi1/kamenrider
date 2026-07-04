import { useEffect, useState, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { WatchHistory } from '../../../shared/types'
import { useAppStore } from '../stores/useAppStore'
import { Tv } from '../components/Icons'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatProgress(progress: number, duration: number): string {
  if (!duration || duration <= 0) return '0%'
  const pct = Math.round((progress / duration) * 100)
  return `${pct}%`
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function HistoryPage(): JSX.Element {
  const navigate = useNavigate()
  const { videoFiles } = useAppStore()
  const [history, setHistory] = useState<WatchHistory[]>([])
  const [loading, setLoading] = useState(true)

  // Build filePath → videoId lookup map for navigation
  const videoIdByPath = useMemo(() => {
    const map = new Map<string, string>()
    for (const f of videoFiles) {
      map.set(f.filePath, f.id)
    }
    return map
  }, [videoFiles])

  // Navigate to player by history item, looking up the correct video ID
  const handleHistoryClick = useCallback(
    (item: WatchHistory): void => {
      const videoId = videoIdByPath.get(item.filePath)
      if (videoId) {
        navigate(`/player/${videoId}`)
      }
    },
    [navigate, videoIdByPath]
  )

  useEffect(() => {
    ;(async () => {
      const data = await window.electronAPI.getAllWatchHistory()
      // Sort by last watched descending
      data.sort((a, b) => {
        const da = a.lastWatchedAt ? new Date(a.lastWatchedAt).getTime() : 0
        const db = b.lastWatchedAt ? new Date(b.lastWatchedAt).getTime() : 0
        return db - da
      })
      setHistory(data)
      setLoading(false)
    })()
  }, [])

  // Loading
  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <header className="flex items-center px-8 py-5 border-b border-gray-800 shrink-0">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            ← 返回首页
          </Link>
          <h1 className="text-xl font-bold ml-4">观看历史</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    )
  }

  // Empty
  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <header className="flex items-center px-8 py-5 border-b border-gray-800 shrink-0">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            ← 返回首页
          </Link>
          <h1 className="text-xl font-bold ml-4">观看历史</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Tv className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">暂无观看记录</p>
            <p className="text-gray-500 text-sm mt-2">
              开始播放视频后，观看进度将自动记录
            </p>
            <Link
              to="/"
              className="mt-4 inline-block text-primary-400 hover:text-primary-300 text-sm"
            >
              返回首页浏览
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="flex items-center px-8 py-5 border-b border-gray-800 shrink-0">
        <Link to="/" className="text-gray-400 hover:text-white transition-colors">
          ← 返回首页
        </Link>
        <h1 className="text-xl font-bold ml-4">观看历史</h1>
        <span className="ml-3 text-sm text-gray-500">{history.length} 条记录</span>
      </header>

      {/* History list */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-2 max-w-4xl mx-auto">
          {history.map((item, idx) => {
            const available = videoIdByPath.has(item.filePath)
            return (
            <button
              key={idx}
              onClick={() => handleHistoryClick(item)}
              disabled={!available}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg text-left transition-colors group ${
                available
                  ? 'hover:bg-gray-800 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Episode info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-400">{item.seriesName}</span>
                  {item.episodeNumber > 0 && (
                    <span className="text-xs text-gray-600">第{item.episodeNumber}集</span>
                  )}
                  {item.completed && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-900/50 text-green-400">
                      已看完
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {/* Progress bar */}
                  <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden max-w-[200px]">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{
                        width: item.duration > 0
                          ? `${Math.min(100, (item.progress / item.duration) * 100)}%`
                          : '0%'
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 tabular-nums min-w-[80px]">
                    {item.completed
                      ? formatTime(item.duration)
                      : `${formatTime(item.progress)} / ${formatTime(item.duration)}`}
                  </span>
                </div>
              </div>

              {/* Time */}
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-500">
                  {item.lastWatchedAt ? formatDate(item.lastWatchedAt) : ''}
                </p>
              </div>
            </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
