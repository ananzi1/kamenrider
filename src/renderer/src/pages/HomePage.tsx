import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import DirectoryConfig from '../components/DirectoryConfig'
import SeriesList from '../components/SeriesList'

export default function HomePage(): JSX.Element {
  const {
    videoDirectories,
    setVideoDirectories,
    series,
    videoFiles,
    setVideoData,
    isScanning,
    setIsScanning
  } = useAppStore()

  const [configOpen, setConfigOpen] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // On mount: load config and scan if directories exist
  useEffect(() => {
    ;(async () => {
      const config = await window.electronAPI.getConfig()
      setVideoDirectories(config.videoDirectories)

      if (config.videoDirectories.length > 0) {
        setIsScanning(true)
        const result = await window.electronAPI.scanVideos()
        setVideoData(result.files, result.series)
        setIsScanning(false)
      }

      setInitialized(true)
    })()
  }, [])

  const hasDirs = videoDirectories.length > 0
  const hasVideos = videoFiles.length > 0

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-800 shrink-0">
        <h1 className="text-xl font-bold">假面骑士播放器</h1>
        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            观看历史
          </Link>
          <button
            onClick={() => setConfigOpen(true)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
          >
            配置目录
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto p-8">
        {/* Loading */}
        {!initialized || isScanning ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">
              {isScanning ? '正在扫描视频文件…' : '加载中…'}
            </p>
          </div>
        ) : !hasDirs ? (
          /* Empty state - no directories */
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-6xl">📁</div>
            <h2 className="text-2xl font-bold">欢迎使用假面骑士播放器</h2>
            <p className="text-gray-400 text-center max-w-md">
              请先配置视频目录，然后应用将自动扫描并分类您的假面骑士视频文件
            </p>
            <button
              onClick={() => setConfigOpen(true)}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl text-lg font-medium transition-colors"
            >
              开始配置
            </button>
          </div>
        ) : !hasVideos ? (
          /* Has directories but no videos found */
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-5xl">🔍</div>
            <h2 className="text-xl font-bold">未找到视频文件</h2>
            <p className="text-gray-400 text-center max-w-md">
              在已配置的目录中未发现视频文件，请检查目录是否正确，或添加新的目录
            </p>
            <button
              onClick={() => setConfigOpen(true)}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              管理目录
            </button>
          </div>
        ) : (
          /* Series grid */
          <SeriesList series={series} />
        )}
      </main>

      {/* Directory config modal */}
      <DirectoryConfig open={configOpen} onClose={() => setConfigOpen(false)} />
    </div>
  )
}
