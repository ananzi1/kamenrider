import { useState, useEffect } from 'react'
import { useAppStore } from '../stores/useAppStore'
import { X, Plus } from './Icons'

interface Props {
  open: boolean
  onClose: () => void
}

export default function DirectoryConfig({ open, onClose }: Props): JSX.Element | null {
  const { videoDirectories, setVideoDirectories, setIsScanning, setVideoData } = useAppStore()
  const [dirs, setDirs] = useState<string[]>(videoDirectories)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDirs(videoDirectories)
  }, [videoDirectories, open])

  if (!open) return null

  const handleAdd = async (): Promise<void> => {
    const selected = await window.electronAPI.selectDirectory()
    if (selected && !dirs.includes(selected)) {
      setDirs([...dirs, selected])
    }
  }

  const handleRemove = (dir: string): void => {
    setDirs(dirs.filter((d) => d !== dir))
  }

  const handleSave = async (): Promise<void> => {
    setSaving(true)
    setVideoDirectories(dirs)
    await window.electronAPI.setConfig('videoDirectories', dirs)

    // Trigger scan
    setIsScanning(true)
    const result = await window.electronAPI.scanVideos()
    setVideoData(result.files, result.series)
    setIsScanning(false)

    onClose()
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass rounded-2xl w-[520px] max-h-[80vh] flex flex-col shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-lg font-bold">配置视频目录</h2>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X />
          </button>
        </div>

        {/* Directory List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {dirs.length === 0 ? (
            <p className="text-gray-400 text-center py-8">尚未添加任何目录</p>
          ) : (
            dirs.map((dir) => (
              <div
                key={dir}
                className="flex items-center justify-between bg-white/[0.03] border border-white/[0.04] rounded-lg px-4 py-3"
              >
                <span className="text-sm text-gray-300 truncate flex-1 mr-3">{dir}</span>
                <button
                  onClick={() => handleRemove(dir)}
                  className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 px-2 py-1 rounded text-sm transition-colors shrink-0"
                >
                  移除
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg text-sm transition-colors flex items-center gap-1.5"
          >
            <Plus /> 添加目录
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? '扫描中…' : '保存并扫描'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
