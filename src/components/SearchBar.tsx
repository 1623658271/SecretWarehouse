import { useState, useCallback } from 'react'
import { useStore } from '../stores/useStore'
import { Search, X } from 'lucide-react'

export default function SearchBar() {
  const { searchQuery, searchSecrets, setSearchQuery, fetchSecrets, selectedType } = useStore()
  const [localQuery, setLocalQuery] = useState(searchQuery)

  const handleSearch = useCallback(() => {
    if (localQuery.trim()) {
      searchSecrets(localQuery)
    } else {
      fetchSecrets(selectedType || undefined)
    }
  }, [localQuery, searchSecrets, fetchSecrets, selectedType])

  const handleClear = useCallback(() => {
    setLocalQuery('')
    setSearchQuery('')
    fetchSecrets(selectedType || undefined)
  }, [setSearchQuery, fetchSecrets, selectedType])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="搜索条目..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
