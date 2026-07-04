import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import { usePlayerStore } from '../stores/usePlayerStore'
import VideoPlayer from '../components/VideoPlayer'
import VideoControls, { type VideoControlsHandle } from '../components/VideoControls'
import { Film } from '../components/Icons'
import type { WatchHistory } from '../../../shared/types'

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function PlayerPage(): JSX.Element {
  const { videoId } = useParams<{ videoId: string }>()
  const navigate = useNavigate()
  const { videoFiles, series } = useAppStore()
  const { currentTime, duration } = usePlayerStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<VideoControlsHandle>(null)

  // Resume dialog state
  const [resumeHistory, setResumeHistory] = useState<WatchHistory | null>(null)

  // Fullscreen sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Sync fullscreen state via native event
  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  // Navigate and close sidebar
  const handleEpisodeSelect = useCallback(
    (episodeId: string): void => {
      navigate(`/player/${episodeId}`)
      setSidebarOpen(false)
    },
    [navigate]
  )

  // Find the current video
  const video = useMemo(
    () => videoFiles.find((f) => f.id === videoId),
    [videoFiles, videoId]
  )

  // Find the series this video belongs to
  const currentSeries = useMemo(() => {
    if (!video) return null
    return series.find((s) => s.name === video.seriesName)
  }, [series, video])

  // All episodes from the same series (flattened across categories)
  const seriesEpisodes = useMemo(() => {
    if (!currentSeries) return []
    return currentSeries.categories.flatMap((c) =>
      c.episodes.map((ep) => ({ ...ep, _category: c.category }))
    )
  }, [currentSeries])

  // Navigate to another episode
  const handleEpisodeClick = useCallback(
    (episodeId: string): void => {
      navigate(`/player/${episodeId}`)
    },
    [navigate]
  )

  // Check for existing watch history on mount (resume prompt)
  useEffect(() => {
    if (!video) return
    ;(async () => {
      const history = await window.electronAPI.getWatchHistory(video.filePath)
      if (history && history.progress > 0 && !history.completed) {
        // Only prompt if progress is more than 30 seconds
        if (history.progress > 30 && history.duration > 0) {
          setResumeHistory(history)
        } else if (history.progress > 0) {
          // Auto-resume for small progress without prompt
          const v = videoRef.current
          if (v) {
            v.currentTime = history.progress
          }
        }
      }
    })()
  }, [video])

  // Handle resume choice
  const handleResumeYes = (): void => {
    const v = videoRef.current
    if (v && resumeHistory) {
      v.currentTime = resumeHistory.progress
    }
    setResumeHistory(null)
  }

  const handleResumeNo = (): void => {
    setResumeHistory(null)
  }

  // Periodic progress saving (every 5 seconds)
  useEffect(() => {
    if (!video) return

    const interval = setInterval(() => {
      const v = videoRef.current
      if (!v || !v.duration || !isFinite(v.duration)) return

      const completed = v.duration - v.currentTime < 60 // within 1 minute of end = completed

      window.electronAPI.saveWatchProgress({
        filePath: video.filePath,
        seriesName: video.seriesName,
        episodeNumber: video.episodeNumber,
        progress: v.currentTime,
        duration: v.duration,
        completed
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [video])

  // Save progress on unmount
  useEffect(() => {
    return () => {
      const v = videoRef.current
      if (!v || !video) return
      if (!v.duration || !isFinite(v.duration)) return

      window.electronAPI.saveWatchProgress({
        filePath: video.filePath,
        seriesName: video.seriesName,
        episodeNumber: video.episodeNumber,
        progress: v.currentTime,
        duration: v.duration,
        completed: v.duration - v.currentTime < 60
      })
    }
  }, [video])

  // Video not found
  if (!video) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <header className="flex items-center px-8 py-5 border-b border-gray-800 shrink-0">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            ← 返回首页
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Film className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">未找到该视频</p>
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
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <header className="flex items-center gap-6 px-8 py-4 border-b border-gray-800 shrink-0">
        <Link
          to={`/series/${encodeURIComponent(video.seriesName)}`}
          className="text-gray-400 hover:text-white transition-colors shrink-0"
        >
          ← {video.seriesName}
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold truncate">{video.episodeTitle}</h1>
          <p className="text-xs text-gray-500">{video.fileName}</p>
        </div>
      </header>

      {/* Main: Player + Sidebar */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Video area */}
        <div
          className={`flex-1 relative bg-black flex items-center justify-center video-area ${
            sidebarVisible ? '' : 'cursor-none'
          }`}
          onMouseMove={() => controlsRef.current?.wake()}
        >
          {/* Resume dialog — inside video-area so it's visible in fullscreen */}
          {resumeHistory && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
                <p className="text-lg font-bold mb-2">继续播放？</p>
                <p className="text-gray-400 text-sm mb-4">
                  上次看到 {formatTime(resumeHistory.progress)} /{' '}
                  {formatTime(resumeHistory.duration)}，是否从该位置继续？
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleResumeNo}
                    className="px-5 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    从头开始
                  </button>
                  <button
                    onClick={handleResumeYes}
                    className="px-5 py-2 text-sm bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors"
                  >
                    继续播放
                  </button>
                </div>
              </div>
            </div>
          )}

          <VideoPlayer key={video.filePath} ref={videoRef} filePath={video.filePath} />
          <VideoControls ref={controlsRef} videoRef={videoRef} onShowChange={setSidebarVisible} />

          {/* Fullscreen sidebar toggle + panel */}
          {isFullscreen && seriesEpisodes.length > 1 && (
            <>
              {/* Toggle button */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 w-8 h-20 bg-gray-900/80 hover:bg-gray-800/90 border border-gray-700/50 rounded-l-lg flex items-center justify-center transition-all duration-300 z-20 ${
                sidebarVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
              }`}
                  title="剧集列表"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                  </svg>
                </button>
              )}

              {/* Backdrop */}
              {sidebarOpen && (
                <div
                  className="absolute inset-0 bg-black/40 z-20"
                  onClick={() => setSidebarOpen(false)}
                />
              )}

              {/* Sidebar panel */}
              <aside
                className={`absolute right-0 top-0 bottom-0 w-64 bg-gray-950 border-l border-gray-800 overflow-y-auto z-30 transition-transform duration-300 ease-out ${
                  sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                  <span className="text-sm text-gray-400">
                    剧集 · {seriesEpisodes.length}
                  </span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>
                <div className="py-1">
                  {seriesEpisodes.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => handleEpisodeSelect(ep.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-800 ${
                        ep.id === videoId
                          ? 'bg-gray-800 text-primary-400 border-l-2 border-primary-500'
                          : 'text-gray-400 border-l-2 border-transparent'
                      }`}
                    >
                      <span className="text-xs text-gray-500 mr-2 tabular-nums">
                        {ep.episodeNumber > 0 ? `#${ep.episodeNumber}` : '-'}
                      </span>
                      <span className="truncate block">{ep.episodeTitle}</span>
                    </button>
                  ))}
                </div>
              </aside>
            </>
          )}
        </div>

        {/* Episode sidebar */}
        {seriesEpisodes.length > 1 && (
          <aside className="w-64 min-h-0 bg-gray-950 border-l border-gray-800 overflow-y-auto shrink-0">
            <div className="px-4 py-3 border-b border-gray-800 text-sm text-gray-400">
              同系列剧集 · {seriesEpisodes.length} 集
            </div>
            <div className="py-1">
              {seriesEpisodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => handleEpisodeClick(ep.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-800 ${
                    ep.id === videoId
                      ? 'bg-gray-800 text-primary-400 border-l-2 border-primary-500'
                      : 'text-gray-400 border-l-2 border-transparent'
                  }`}
                >
                  <span className="text-xs text-gray-500 mr-2 tabular-nums">
                    {ep.episodeNumber > 0 ? `#${ep.episodeNumber}` : '-'}
                  </span>
                  <span className="truncate block">{ep.episodeTitle}</span>
                </button>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
