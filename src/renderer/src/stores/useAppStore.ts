import { create } from 'zustand'
import type { VideoFile, Series } from '../../../shared/types'

interface AppState {
  // Video directories
  videoDirectories: string[]
  setVideoDirectories: (dirs: string[]) => void

  // Scanned data
  videoFiles: VideoFile[]
  series: Series[]
  setVideoData: (files: VideoFile[], series: Series[]) => void

  // Loading state
  isScanning: boolean
  setIsScanning: (v: boolean) => void

  // Selected series filter
  selectedSeries: string | null
  setSelectedSeries: (name: string | null) => void

  // Category filter
  selectedCategory: string | null
  setSelectedCategory: (cat: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  videoDirectories: [],
  setVideoDirectories: (dirs) => set({ videoDirectories: dirs }),

  videoFiles: [],
  series: [],
  setVideoData: (files, series) => set({ videoFiles: files, series }),

  isScanning: false,
  setIsScanning: (v) => set({ isScanning: v }),

  selectedSeries: null,
  setSelectedSeries: (name) => set({ selectedSeries: name }),

  selectedCategory: null,
  setSelectedCategory: (cat) => set({ selectedCategory: cat })
}))
