import { useMemo, useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import EpisodeList from '../components/EpisodeList'
import { Tv } from '../components/Icons'
import type { SeriesCategory } from '../../../shared/types'

export default function SeriesPage(): JSX.Element {
  const { seriesName } = useParams<{ seriesName: string }>()
  const { series } = useAppStore()

  const decodedName = decodeURIComponent(seriesName ?? '')

  // Find the matching series from store
  const matched = useMemo(
    () => series.find((s) => s.name === decodedName),
    [series, decodedName]
  )

  // Active category tab (default to first available)
  const [activeCategory, setActiveCategory] = useState<SeriesCategory | null>(null)
  const shownCategory =
    activeCategory ?? (matched ? matched.categories[0]?.category ?? null : null)

  // Episodes for current category
  const episodes = useMemo(() => {
    if (!matched) return []
    const cat = matched.categories.find((c) => c.category === shownCategory)
    return cat?.episodes ?? []
  }, [matched, shownCategory])

  // Find last watched episode for this series (for "上次看到" marker)
  const [lastWatchedFilePath, setLastWatchedFilePath] = useState<string | null>(null)
  useEffect(() => {
    if (!matched) return
    ;(async () => {
      const all = await window.electronAPI.getAllWatchHistory()
      const seriesHistory = all
        .filter((h) => h.seriesName === matched.name)
        .sort((a, b) => {
          const da = a.lastWatchedAt ? new Date(a.lastWatchedAt).getTime() : 0
          const db = b.lastWatchedAt ? new Date(b.lastWatchedAt).getTime() : 0
          return db - da
        })
      setLastWatchedFilePath(seriesHistory[0]?.filePath ?? null)
    })()
  }, [matched])

  // Series not found
  if (!matched) {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="flex items-center px-8 py-5 border-b border-white/[0.05] bg-gray-950/80 backdrop-blur-md shrink-0">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            ← 返回首页
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center flex flex-col items-center gap-5">
            <Tv className="text-gray-700 opacity-40" />
            <p className="text-gray-400 text-lg">未找到系列「{decodedName}」</p>
            <Link to="/" className="px-5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg text-sm transition-colors">
              返回首页浏览
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-6 px-8 py-5 border-b border-white/[0.05] bg-gray-950/80 backdrop-blur-md shrink-0">
        <Link to="/" className="text-gray-400 hover:text-white transition-colors shrink-0">
          ← 返回
        </Link>
        <div>
          <h1 className="text-xl font-bold">{matched.name}</h1>
          <p className="text-sm text-gray-500">
            {matched.categories.reduce((sum, c) => sum + c.episodes.length, 0)} 集 ·{' '}
            {matched.categories.length} 个分类
          </p>
        </div>
      </header>

      {/* Category tabs */}
      <nav className="flex gap-1 px-8 pt-4 shrink-0" role="tablist">
        {matched.categories.map((c) => (
          <button
            key={c.category}
            role="tab"
            onClick={() => setActiveCategory(c.category)}
            className={`relative px-4 py-2.5 text-sm rounded-t-lg transition-colors ${
              shownCategory === c.category
                ? 'bg-white/[0.03] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            {c.category}
            <span className={`ml-1.5 text-xs ${
              shownCategory === c.category ? 'text-gray-400' : 'text-gray-500'
            }`}>{c.episodes.length}</span>
            {shownCategory === c.category && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Episode list */}
      <main className="flex-1 min-h-0 overflow-y-auto mx-4 mb-4 rounded-lg bg-white/[0.02] border border-white/[0.03]">
        <div className="p-4">
          <EpisodeList
            episodes={episodes}
            seriesName={matched.name}
            lastWatchedFilePath={lastWatchedFilePath}
          />
        </div>
      </main>
    </div>
  )
}
