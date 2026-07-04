import { forwardRef, useEffect, useCallback } from 'react'
import { usePlayerStore } from '../stores/usePlayerStore'

interface Props {
  filePath: string
}

/**
 * Convert a Windows file path to a valid file:// URL that Chromium can load.
 * D:\videos\01.mp4 → file:///D:/videos/01.mp4
 * /home/user/videos/01.mp4 → file:///home/user/videos/01.mp4
 */
function toFileUrl(filePath: string): string {
  // Replace backslashes with forward slashes, then encodeURI to handle special chars
  const normalized = filePath.replace(/\\/g, '/')
  // encodeURI preserves : / and other URL-significant chars
  const encoded = normalized
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
  return `file:///${encoded}`
}

const VideoPlayer = forwardRef<HTMLVideoElement, Props>(function VideoPlayer(
  { filePath },
  ref
) {
  const { setIsPlaying, setTime, setVolume, setPlaybackRate } = usePlayerStore()
  const fileUrl = toFileUrl(filePath)

  // When filePath changes, force reload the video element
  const setRef = useCallback(
    (el: HTMLVideoElement | null) => {
      if (!el) return
      // Assign ref
      if (typeof ref === 'function') {
        ref(el)
      } else if (ref) {
        ;(ref as React.MutableRefObject<HTMLVideoElement | null>).current = el
      }
      // Force load the new source
      el.load()
    },
    [ref]
  )

  // Sync video element events back to store
  useEffect(() => {
    const video = typeof ref === 'function' ? null : ref?.current
    if (!video) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTimeUpdate = () => {
      if (video.duration && !isNaN(video.duration)) {
        setTime(video.currentTime, video.duration)
      }
    }
    const onLoadedMetadata = () => {
      setTime(video.currentTime, video.duration)
    }
    const onVolumeChange = () => setVolume(video.volume)
    const onRateChange = () => setPlaybackRate(video.playbackRate)

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('volumechange', onVolumeChange)
    video.addEventListener('ratechange', onRateChange)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('volumechange', onVolumeChange)
      video.removeEventListener('ratechange', onRateChange)
    }
  }, [filePath, ref, setIsPlaying, setTime, setVolume, setPlaybackRate])

  return (
    <video
      ref={setRef}
      src={fileUrl}
      autoPlay
      className="w-full h-full object-contain"
      onClick={(e) => {
        const v = e.currentTarget
        v.paused ? v.play() : v.pause()
      }}
      onDoubleClick={() => {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          document.querySelector('.video-area')?.requestFullscreen()
        }
      }}
    />
  )
})

export default VideoPlayer
