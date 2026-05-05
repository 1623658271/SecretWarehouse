import { useState, useEffect } from 'react'
import { useStore } from '../stores/useStore'
import { useTheme } from './ThemeProvider'
import { X, Sun, Moon, Monitor, Type, LayoutGrid, Space, RotateCcw, Maximize2, Minimize2, Check, GripVertical, Star, Eye, Key } from 'lucide-react'
import { appWindow } from '@tauri-apps/api/window'

export default function Settings() {
  const { showSettings, setShowSettings, settings, updateSettings, resetSettings } = useStore()
  const { theme, setTheme } = useTheme()
  const [showSaved, setShowSaved] = useState(false)

  // Show saved notification
  const handleUpdateSettings = (partial: Partial<typeof settings>) => {
    updateSettings(partial)
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 1500)
  }

  // Handle window size change
  const handleWindowSizeChange = async (size: 'small' | 'medium' | 'large' | 'maximized' | 'fullscreen') => {
    handleUpdateSettings({ windowSize: size })

    try {
      if (size === 'maximized') {
        await appWindow.maximize()
        await appWindow.setFullscreen(false)
      } else if (size === 'fullscreen') {
        await appWindow.setFullscreen(true)
        await appWindow.unmaximize()
      } else {
        await appWindow.setFullscreen(false)
        await appWindow.unmaximize()

        const sizes = {
          small: { width: 800, height: 600 },
          medium: { width: 1200, height: 800 },
          large: { width: 1600, height: 1000 },
        }

        const { width, height } = sizes[size]
        await appWindow.setSize({ type: 'Logical', width, height })
        await appWindow.center()
      }
    } catch (err) {
      console.error('Failed to resize window:', err)
    }
  }

  if (!showSettings) return null

  const fontSizes = [
    { value: 'small' as const, label: '小', size: '12px' },
    { value: 'medium' as const, label: '中', size: '14px' },
    { value: 'large' as const, label: '大', size: '16px' },
  ]

  const cardSizes = [
    { value: 'compact' as const, label: '紧凑', icon: '□' },
    { value: 'normal' as const, label: '标准', icon: '□□' },
    { value: 'comfortable' as const, label: '宽松', icon: '□□□' },
  ]

  const spacingOptions = [
    { value: 'tight' as const, label: '紧凑' },
    { value: 'normal' as const, label: '标准' },
    { value: 'relaxed' as const, label: '宽松' },
  ]

  const windowSizes = [
    { value: 'small' as const, label: '小窗口', desc: '800×600', icon: Minimize2 },
    { value: 'medium' as const, label: '中窗口', desc: '1200×800', icon: LayoutGrid },
    { value: 'large' as const, label: '大窗口', desc: '1600×1000', icon: Maximize2 },
    { value: 'maximized' as const, label: '最大化', desc: '窗口模式', icon: Maximize2 },
    { value: 'fullscreen' as const, label: '全屏', desc: '全屏模式', icon: Maximize2 },
  ]

  // Preview card styles
  const previewPadding = { compact: 'p-2', normal: 'p-3', comfortable: 'p-4' }[settings.cardSize]
  const previewIconSize = { compact: 'w-6 h-6', normal: 'w-8 h-8', comfortable: 'w-10 h-10' }[settings.cardSize]
  const previewGap = { tight: 'gap-1', normal: 'gap-2', relaxed: 'gap-3' }[settings.spacing]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl mx-4 h-[85vh] flex flex-col border border-slate-200 dark:border-slate-700/60 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700/40">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">设置</h2>
            {showSaved && (
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium animate-in slide-in-from-left-2 duration-200">
                <Check className="w-3 h-3" />
                已保存
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm"
              title="恢复默认设置"
            >
              <RotateCcw className="w-4 h-4" />
              <span>恢复默认</span>
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Settings Panel */}
          <div className="w-1/2 overflow-y-auto p-6 space-y-6 border-r border-slate-200 dark:border-slate-700/40">
            {/* Theme */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sun className="w-4 h-4 text-violet-500" />
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">主题模式</label>
              </div>
              <div className="flex gap-2">
                {[
                  { value: 'light' as const, icon: Sun, label: '浅色' },
                  { value: 'dark' as const, icon: Moon, label: '深色' },
                  { value: 'system' as const, icon: Monitor, label: '跟随系统' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      theme === value
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Window Size */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Maximize2 className="w-4 h-4 text-violet-500" />
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">窗口大小</label>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {windowSizes.map(({ value, label, desc, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => handleWindowSizeChange(value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      settings.windowSize === value
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{label}</span>
                    <span className="text-[10px] opacity-60">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Type className="w-4 h-4 text-violet-500" />
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">字体大小</label>
              </div>
              <div className="flex gap-2">
                {fontSizes.map(({ value, label, size }) => (
                  <button
                    key={value}
                    onClick={() => handleUpdateSettings({ fontSize: value })}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      settings.fontSize === value
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="font-bold" style={{ fontSize: size }}>{label}</span>
                    <span className="text-xs opacity-60">{size}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Size */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <LayoutGrid className="w-4 h-4 text-violet-500" />
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">卡片大小</label>
              </div>
              <div className="flex gap-2">
                {cardSizes.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    onClick={() => handleUpdateSettings({ cardSize: value })}
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      settings.cardSize === value
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-lg tracking-tight">{icon}</span>
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Spacing */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Space className="w-4 h-4 text-violet-500" />
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">间距</label>
              </div>
              <div className="flex gap-2">
                {spacingOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleUpdateSettings({ spacing: value })}
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      settings.spacing === value
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-8 h-1 bg-current rounded" />
                      <div className={`w-8 h-1 bg-current rounded ${value === 'tight' ? '-mt-0' : value === 'normal' ? 'mt-0.5' : 'mt-1'}`} />
                      <div className={`w-8 h-1 bg-current rounded ${value === 'tight' ? '-mt-0' : value === 'normal' ? 'mt-0.5' : 'mt-1'}`} />
                    </div>
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-800/50">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">实时预览</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">以下预览会根据您的设置实时变化</p>
            </div>

            {/* Preview Card */}
            <div className={`bg-white dark:bg-slate-900 rounded-2xl ${previewPadding} border border-slate-200 dark:border-slate-700/50 shadow-sm`}>
              <div className={`flex items-start ${previewGap}`}>
                <div className={`${previewIconSize} rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <Key className={`${settings.cardSize === 'compact' ? 'w-3 h-3' : settings.cardSize === 'normal' ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">示例密码</h3>
                    <Star className="w-4 h-4 text-amber-500 fill-current flex-shrink-0" />
                  </div>
                  <p className={`text-slate-500 dark:text-slate-400 truncate mt-1 ${settings.fontSize === 'small' ? 'text-xs' : settings.fontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                    username@example.com
                  </p>
                </div>
                <div className="opacity-50">
                  <Eye className="w-4 h-4 text-violet-500" />
                </div>
              </div>

              <div className={`flex items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/30 ${previewGap}`}>
                <span className={`text-slate-400 ${settings.fontSize === 'small' ? 'text-xs' : settings.fontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                  3 个字段
                </span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className={`text-violet-500 dark:text-violet-400 font-medium ${settings.fontSize === 'small' ? 'text-xs' : settings.fontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                  双击查看详情
                </span>
              </div>
            </div>

            {/* Multiple Cards Preview */}
            <div className={`mt-4 grid grid-cols-2 ${settings.spacing === 'tight' ? 'gap-2' : settings.spacing === 'relaxed' ? 'gap-4' : 'gap-3'}`}>
              {[1, 2].map((i) => (
                <div key={i} className={`bg-white dark:bg-slate-900 rounded-2xl ${previewPadding} border border-slate-200 dark:border-slate-700/50 shadow-sm`}>
                  <div className="flex items-center gap-2">
                    <div className={`${settings.cardSize === 'compact' ? 'w-6 h-6' : settings.cardSize === 'normal' ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center`}>
                      <Key className={`${settings.cardSize === 'compact' ? 'w-3 h-3' : settings.cardSize === 'normal' ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 dark:text-white truncate text-sm">卡片 {i}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">预览内容</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Text Size Preview */}
            <div className="mt-6 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">字体大小预览</h4>
              <div className="space-y-2">
                <p className={`text-slate-600 dark:text-slate-400 ${settings.fontSize === 'small' ? 'text-xs' : settings.fontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                  这是当前字体大小的示例文本，用于预览设置效果。
                </p>
                <p className={`text-slate-500 dark:text-slate-500 ${settings.fontSize === 'small' ? 'text-xs' : settings.fontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
