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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-[500px] max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-lg font-bold">配置视频目录</h2>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X />
          </button>
        </div>

        {/* Directory List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {dirs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">尚未添加任何目录</p>
          ) : (
            dirs.map((dir) => (
              <div
                key={dir}
                className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3"
              >
                <span className="text-sm text-gray-300 truncate flex-1 mr-3">{dir}</span>
                <button
                  onClick={() => handleRemove(dir)}
                  className="text-gray-500 hover:text-red-400 text-sm transition-colors shrink-0"
                >
                  移除
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-800">
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors flex items-center gap-1.5"
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
