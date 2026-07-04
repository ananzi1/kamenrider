import { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef, type RefObject } from 'react'
import { usePlayerStore } from '../stores/usePlayerStore'
import { Volume, Play, Pause, FullscreenEnter, FullscreenExit } from './Icons'

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>
  onShowChange?: (show: boolean) => void
}

export interface VideoControlsHandle {
  wake: () => void
}

// Playback rate options
const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

// Skip intro seconds
const SKIP_SECONDS = 75

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const VideoControls = forwardRef<VideoControlsHandle, Props>(function VideoControls(
  { videoRef, onShowChange },
  ref
) {
  const { isPlaying, currentTime, duration, volume, playbackRate, isFullscreen } =
    usePlayerStore()

  const onShowChangeRef = useRef(onShowChange)
  onShowChangeRef.current = onShowChange

  const [show, setShow] = useState(true)
  const [wakeKey, setWakeKey] = useState(0)
  const [seeking, setSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)
  const [showRateMenu, setShowRateMenu] = useState(false)
  const [volumeOsd, setVolumeOsd] = useState(false)
  const volumeOsdTimer = useRef<ReturnType<typeof setTimeout>>()

  const video = videoRef.current

  // Expose wake() so parent can trigger show on mouse move
  const wake = useCallback(() => {
    setShow(true)
    setWakeKey((k) => k + 1)
  }, [])

  useImperativeHandle(ref, () => ({ wake }), [wake])

  // Auto-hide after 3s when playing; wakeKey resets the timer
  useEffect(() => {
    if (isPlaying && show) {
      const t = setTimeout(() => {
        if (!seeking && !showRateMenu) setShow(false)
      }, 3000)
      return () => clearTimeout(t)
    } else if (!isPlaying) {
      setShow(true)
    }
  }, [isPlaying, show, wakeKey, seeking, showRateMenu])

  // Notify parent when controls visibility changes (for syncing sidebar button)
  useEffect(() => {
    onShowChangeRef.current?.(show)
  }, [show])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const v = video
      if (!v) return

      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          v.paused ? v.play() : v.pause()
          break
        case 'ArrowLeft':
          e.preventDefault()
          v.currentTime = Math.max(0, v.currentTime - 5)
          break
        case 'ArrowRight':
          e.preventDefault()
          v.currentTime = Math.min(v.duration || Infinity, v.currentTime + 5)
          break
        case 'ArrowUp':
          e.preventDefault()
          v.volume = Math.min(1, v.volume + 0.05)
          setVolumeOsd(true)
          clearTimeout(volumeOsdTimer.current)
          volumeOsdTimer.current = setTimeout(() => setVolumeOsd(false), 1200)
          break
        case 'ArrowDown':
          e.preventDefault()
          v.volume = Math.max(0, v.volume - 0.05)
          setVolumeOsd(true)
          clearTimeout(volumeOsdTimer.current)
          volumeOsdTimer.current = setTimeout(() => setVolumeOsd(false), 1200)
          break
        case 'KeyS':
          e.preventDefault()
          v.currentTime = Math.min(v.duration || Infinity, v.currentTime + SKIP_SECONDS)
          break
        case 'KeyF':
          e.preventDefault()
          if (document.fullscreenElement) {
            document.exitFullscreen()
          } else {
            v.parentElement?.requestFullscreen()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [video])

  if (!video) return <></>

  const handlePlayPause = (): void => {
    video.paused ? video.play() : video.pause()
  }

  const handleSeekStart = (): void => {
    setSeeking(true)
    setSeekValue(video.currentTime)
  }

  const handleSeekChange = (value: number): void => {
    setSeekValue(value)
  }

  const handleSeekEnd = (): void => {
    video.currentTime = seekValue
    setSeeking(false)
  }

  const handleVolumeChange = (value: number): void => {
    video.volume = value
  }

  const handleRateChange = (rate: number): void => {
    video.playbackRate = rate
    setShowRateMenu(false)
  }

  const handleFullscreen = (): void => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.parentElement?.requestFullscreen()
    }
  }

  const displayTime = seeking ? seekValue : currentTime
  const displayDuration = duration || 0
  const progress = displayDuration > 0 ? (displayTime / displayDuration) * 100 : 0

  return (
    <>
      {/* Volume OSD — centered glass overlay */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 z-40 ${
          volumeOsd ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <div className="glass rounded-2xl px-6 py-4 flex items-center gap-3 shadow-2xl">
          <Volume
            level={volume === 0 ? 'off' : volume < 0.5 ? 'low' : 'high'}
            className="text-white"
          />
          <span className="text-white font-bold text-2xl tabular-nums">
            {Math.round(volume * 100)}
          </span>
        </div>
      </div>

      {/* Controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-5 pt-16 pb-4 transition-opacity duration-300 ${
          show ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Seek bar */}
        <div className="mb-3 px-0.5">
          <input
            type="range"
            min={0}
            max={displayDuration || 1}
            step={0.1}
            value={displayTime}
            onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
            onMouseDown={handleSeekStart}
            onTouchStart={handleSeekStart}
            onMouseUp={handleSeekEnd}
            onTouchEnd={handleSeekEnd}
            style={{
              background: `linear-gradient(to right, #ef4221 0%, #ef4221 ${progress}%, rgba(255,255,255,0.12) ${progress}%, rgba(255,255,255,0.12) 100%)`
            }}
            className="w-full rounded-full cursor-pointer
              [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:h-[14px]
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(239,66,33,0.5)]
              [&::-webkit-slider-thumb]:opacity-0 [&:hover::-webkit-slider-thumb]:opacity-100
              [&::-webkit-slider-thumb]:transition-opacity [&::-webkit-slider-thumb]:mt-[-4px]"
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2 text-white">
          {/* Play / Pause */}
          <button
            onClick={handlePlayPause}
            aria-label={isPlaying ? '暂停' : '播放'}
            className="p-1.5 hover:scale-110 transition-transform"
          >
            {isPlaying ? (
              <Pause className="text-white" />
            ) : (
              <Play className="text-white" />
            )}
          </button>

          {/* Skip intro */}
          <button
            onClick={() => {
              if (video) video.currentTime = Math.min(video.duration || Infinity, video.currentTime + SKIP_SECONDS)
            }}
            aria-label="跳过片头"
            className="text-[11px] px-2.5 py-0.5 rounded-full border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all tabular-nums"
            title="跳过片头 (S)"
          >
            +{SKIP_SECONDS}s
          </button>

          {/* Time */}
          <span className="text-xs text-gray-300 tabular-nums min-w-[100px] ml-1">
            {formatTime(displayTime)} / {formatTime(displayDuration)}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Volume */}
          <div className="flex items-center gap-1.5 group">
            <Volume
              level={volume === 0 ? 'off' : volume < 0.5 ? 'low' : 'high'}
              className="text-gray-400 group-hover:text-white transition-colors"
            />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-none [&::-webkit-slider-thumb]:mt-[-4px]"
            />
          </div>

          {/* Playback Rate */}
          <div className="relative">
            <button
              onClick={() => setShowRateMenu(!showRateMenu)}
              className="text-xs px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors tabular-nums"
            >
              {playbackRate}x
            </button>
            {showRateMenu && (
              <div className="absolute bottom-full right-0 mb-2 glass rounded-xl py-1.5 shadow-xl z-50 animate-scale-in origin-bottom">
                {RATES.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`block w-full text-left px-4 py-1.5 text-xs hover:bg-white/8 transition-colors ${
                      playbackRate === rate ? 'text-primary-400 font-medium' : 'text-gray-300'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            aria-label={isFullscreen ? '退出全屏' : '全屏'}
            className="p-1.5 hover:scale-110 transition-transform"
          >
            {isFullscreen ? (
              <FullscreenExit className="text-white" />
            ) : (
              <FullscreenEnter className="text-white" />
            )}
          </button>
        </div>
      </div>
    </>
  )
})

export default VideoControls
