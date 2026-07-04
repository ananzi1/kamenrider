import { useNavigate } from 'react-router-dom'
import type { VideoFile } from '../../../shared/types'

interface Props {
  episodes: VideoFile[]
  seriesName: string
  /** 上次观看的剧集文件路径，匹配到时高亮标记 */
  lastWatchedFilePath?: string | null
}

export default function EpisodeList({ episodes, seriesName, lastWatchedFilePath }: Props): JSX.Element {
  const navigate = useNavigate()

  if (episodes.length === 0) {
    return <p className="text-gray-400 text-center py-16">该分类下暂无剧集</p>
  }

  return (
    <div className="space-y-1">
      {episodes.map((ep) => {
        const isLastWatched = lastWatchedFilePath != null && ep.filePath === lastWatchedFilePath

        return (
        <button
          key={ep.id}
          onClick={() => navigate(`/player/${ep.id}`)}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/[0.04] text-left transition-colors group ${
            isLastWatched
              ? 'border-l-2 border-primary-500 bg-primary-500/5'
              : 'border-l-2 border-transparent'
          }`}
        >
          {/* Episode number badge */}
          <span className={`w-16 text-right text-sm shrink-0 tabular-nums py-0.5 rounded-md ${
            isLastWatched
              ? 'text-primary-400 bg-primary-500/10'
              : 'text-gray-500 group-hover:text-gray-300'
          }`}>
            {ep.episodeNumber > 0 ? `第${ep.episodeNumber}集` : '-'}
          </span>

          {/* Episode title */}
          <span className={`text-sm truncate flex-1 ${
            isLastWatched ? 'text-primary-300' : 'text-gray-300 group-hover:text-white'
          }`}>
            {ep.episodeTitle}
          </span>

          {/* File name hint */}
          <span className="text-xs text-gray-600 truncate max-w-[200px] shrink-0 hidden sm:block">
            {ep.fileName}
          </span>

          {/* Last watched tag */}
          {isLastWatched && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-400 shrink-0">
              上次看到
            </span>
          )}
        </button>
        )
      })}
    </div>
  )
}
