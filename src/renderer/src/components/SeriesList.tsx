import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Series } from '../../../shared/types'

interface Props {
  series: Series[]
}

export default function SeriesList({ series }: Props): JSX.Element {
  const navigate = useNavigate()
  const [coverUrls, setCoverUrls] = useState<Map<string, string | null>>(new Map())

  // Load cover images for all series on mount
  useEffect(() => {
    ;(async () => {
      const map = new Map<string, string | null>()
      await Promise.all(
        series.map(async (s) => {
          const url = await window.electronAPI.getCoverUrl(s.name)
          map.set(s.name, url)
        })
      )
      setCoverUrls(map)
    })()
  }, [series])

  if (series.length === 0) {
    return (
      <p className="text-gray-500 text-center py-16">暂无系列，请先配置视频目录并扫描</p>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {series.map((s) => {
        const totalEpisodes = s.categories.reduce((sum, c) => sum + c.episodes.length, 0)
        const coverUrl = coverUrls.get(s.name)

        return (
          <button
            key={s.name}
            onClick={() => navigate(`/series/${encodeURIComponent(s.name)}`)}
            className="group relative overflow-hidden rounded-xl border border-gray-800 hover:border-primary-700 h-56 text-left transition-all duration-200 hover:scale-[1.02]"
          >
            {/* Background: cover image or solid fallback */}
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={s.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-900 group-hover:bg-gray-800 transition-colors" />
            )}

            {/* Bottom gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" />

            {/* Text overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-bold text-base mb-1 group-hover:text-primary-400 transition-colors truncate">
                {s.name}
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                共 {totalEpisodes} 集
              </p>
              <div className="flex flex-wrap gap-1.5">
                {s.categories.map((c) => (
                  <span
                    key={c.category}
                    className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300"
                  >
                    {c.category} {c.episodes.length}
                  </span>
                ))}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
