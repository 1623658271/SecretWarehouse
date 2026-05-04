import { useStore } from '../stores/useStore'
import {
  Globe,
  Key,
  CreditCard,
  FileText,
  Terminal,
  Award,
  Plus,
  Star,
  Layers,
} from 'lucide-react'

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  website: Globe,
  api_key: Key,
  bank_card: CreditCard,
  secure_note: FileText,
  ssh_key: Terminal,
  license: Award,
}

export default function Sidebar() {
  const { secretTypes, selectedType, selectType, setShowForm } = useStore()

  const handleTypeClick = (typeName: string | null) => {
    selectType(typeName)
  }

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          SecretWarehouse
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          密码管理器
        </p>
      </div>

      {/* Add Button */}
      <div className="p-4">
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增条目
        </button>
      </div>

      {/* Categories */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="space-y-1">
          {/* All Items */}
          <button
            onClick={() => handleTypeClick(null)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedType === null
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            全部条目
          </button>

          {/* Favorites */}
          <button
            onClick={() => handleTypeClick('favorite')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedType === 'favorite'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <Star className="w-4 h-4" />
            收藏
          </button>
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

        {/* Secret Types */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            分类
          </p>
          {secretTypes.map((type) => {
            const Icon = typeIcons[type.type_name] || FileText
            return (
              <button
                key={type.type_name}
                onClick={() => handleTypeClick(type.type_name)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedType === type.type_name
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
