import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import DirectoryConfig from '../components/DirectoryConfig'
import SeriesList from '../components/SeriesList'
import { FolderOpen, Search } from '../components/Icons'

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
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.05] bg-gray-950/80 backdrop-blur-md shrink-0">
        <h1 className="text-xl font-bold tracking-tight">假面骑士播放器</h1>
        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            观看历史
          </Link>
          <button
            onClick={() => setConfigOpen(true)}
            className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg text-sm transition-colors"
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
            <div className="w-10 h-10 border-[3px] border-primary-500/20 border-t-primary-500 rounded-full animate-spin-slow" />
            <p className="text-gray-400 text-sm">
              {isScanning ? '正在扫描视频文件…' : '加载中…'}
            </p>
          </div>
        ) : !hasDirs ? (
          /* Empty state - no directories */
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <FolderOpen className="text-gray-700 opacity-40" />
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-3">欢迎使用假面骑士播放器</h2>
              <p className="text-gray-400 max-w-md leading-relaxed">
                请先配置视频目录，应用将自动扫描并分类您的假面骑士视频文件
              </p>
            </div>
            <button
              onClick={() => setConfigOpen(true)}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl text-base font-medium transition-colors shadow-glow-primary-sm hover:shadow-glow-primary"
            >
              开始配置
            </button>
          </div>
        ) : !hasVideos ? (
          /* Has directories but no videos found */
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <Search className="text-gray-700 opacity-40" />
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">未找到视频文件</h2>
              <p className="text-gray-400 leading-relaxed">
                在已配置的目录中未发现视频文件，请检查目录或添加新目录
              </p>
            </div>
            <button
              onClick={() => setConfigOpen(true)}
              className="px-6 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-colors"
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
