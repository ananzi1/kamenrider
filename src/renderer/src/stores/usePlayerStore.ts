import { create } from 'zustand'

interface PlayerState {
  // Current video
  currentVideoId: string | null
  currentFilePath: string | null
  setCurrentVideo: (id: string, filePath: string) => void

  // Playback state
  isPlaying: boolean
  setIsPlaying: (v: boolean) => void

  currentTime: number
  duration: number
  setTime: (current: number, dur: number) => void

  volume: number
  setVolume: (v: number) => void

  playbackRate: number
  setPlaybackRate: (rate: number) => void

  isFullscreen: boolean
  setIsFullscreen: (v: boolean) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentVideoId: null,
  currentFilePath: null,
  setCurrentVideo: (id, filePath) => set({ currentVideoId: id, currentFilePath: filePath }),

  isPlaying: false,
  setIsPlaying: (v) => set({ isPlaying: v }),

  currentTime: 0,
  duration: 0,
  setTime: (current, duration) => set({ currentTime: current, duration }),

  volume: 1,
  setVolume: (v) => set({ volume: v }),

  playbackRate: 1,
  setPlaybackRate: (rate) => set({ playbackRate: rate }),

  isFullscreen: false,
  setIsFullscreen: (v) => set({ isFullscreen: v })
}))
