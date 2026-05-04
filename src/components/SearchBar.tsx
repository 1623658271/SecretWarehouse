import { useState, useCallback } from 'react'
import { useStore } from '../stores/useStore'
import { Search, X } from 'lucide-react'

export default function SearchBar() {
  const { searchQuery, searchSecrets, setSearchQuery, fetchSecrets, selectedTag } = useStore()
  const [localQuery, setLocalQuery] = useState(searchQuery)

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

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 transition-colors">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="搜索..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-9 pr-9 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
