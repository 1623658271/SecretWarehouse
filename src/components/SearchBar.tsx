import { useState, useCallback, useEffect } from 'react'
import { useStore } from '../stores/useStore'
import { Search, X, CheckSquare } from 'lucide-react'

export default function SearchBar() {
  const {
    searchQuery, searchSecrets, setSearchQuery, fetchSecrets, selectedTag,
    isSelectionMode, setSelectionMode, clearSelection
  } = useStore()
  const [localQuery, setLocalQuery] = useState(searchQuery)

  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  const handleSearch = useCallback(() => {
    if (localQuery.trim()) {
      searchSecrets(localQuery)
    } else {
      fetchSecrets(selectedTag || undefined)
    }
  }, [localQuery, searchSecrets, fetchSecrets, selectedTag])

  const handleClear = useCallback(() => {
    setLocalQuery('')
    setSearchQuery('')
    fetchSecrets(selectedTag || undefined)
  }, [setSearchQuery, fetchSecrets, selectedTag])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      clearSelection()
    } else {
      setSelectionMode(true)
    }
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700/40 px-6 py-3">
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索密码、标签..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-11 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          {localQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Multi-select button */}
        <button
          onClick={toggleSelectionMode}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isSelectionMode
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>{isSelectionMode ? '取消选择' : '多选'}</span>
        </button>
      </div>
    </div>
  )
}
