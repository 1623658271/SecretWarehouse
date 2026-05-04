import { useStore } from '../stores/useStore'
import { useTheme } from './ThemeProvider'
import {
  Plus,
  Star,
  Layers,
  Shield,
  Tag,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'

export default function Sidebar() {
  const { allTags, selectedTag, selectTag, setShowForm, secrets } = useStore()
  const { theme, setTheme } = useTheme()

  const favoriteCount = secrets.filter(s => s.favorite).length

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: '浅色' },
    { value: 'dark' as const, icon: Moon, label: '深色' },
    { value: 'system' as const, icon: Monitor, label: '跟随系统' },
  ]

  return (
    <aside className="w-64 bg-slate-50 dark:bg-slate-800 flex flex-col border-r border-slate-200 dark:border-slate-700 transition-colors">
      {/* Logo */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">
            SecretWarehouse
          </h1>
        </div>
      </div>

      {/* Add Button */}
      <div className="p-3">
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增条目
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {/* All Items */}
        <button
          onClick={() => selectTag(null)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTag === null
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="flex-1 text-left">全部条目</span>
          <span className="text-xs text-slate-400">{secrets.length}</span>
        </button>

        {/* Favorites */}
        <button
          onClick={() => selectTag('favorite')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTag === 'favorite'
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Star className="w-4 h-4" />
          <span className="flex-1 text-left">收藏夹</span>
          <span className="text-xs text-slate-400">{favoriteCount}</span>
        </button>

        {/* Tags Divider */}
        {allTags.length > 0 && (
          <>
            <div className="my-3 px-3">
              <div className="h-px bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="flex items-center gap-1.5 px-3 mb-2">
              <Tag className="w-3 h-3 text-slate-400" />
              <span className="text-xs font-medium text-slate-400 uppercase">标签</span>
            </div>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => selectTag(tag)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedTag === tag
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className="text-slate-400">#</span>
                <span className="flex-1 text-left truncate">{tag}</span>
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Theme Switcher */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex gap-1 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
          {themeOptions.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                theme === value
                  ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title={label}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
