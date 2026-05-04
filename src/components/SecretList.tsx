import { useStore } from '../stores/useStore'
import { Globe, Key, CreditCard, FileText, Terminal, Award, Star } from 'lucide-react'
import { SecretType } from '../types'

const typeIcons: Record<SecretType, React.ComponentType<{ className?: string }>> = {
  website: Globe,
  api_key: Key,
  bank_card: CreditCard,
  secure_note: FileText,
  ssh_key: Terminal,
  license: Award,
}

export default function SecretList() {
  const { secrets, selectedSecret, selectSecret, isLoading } = useStore()

  if (isLoading) {
    return (
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      {secrets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <FileText className="w-12 h-12 mb-2 opacity-50" />
          <p>暂无条目</p>
          <p className="text-sm">点击右上角按钮添加</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {secrets.map((secret) => {
            const Icon = typeIcons[secret.secret_type] || FileText
            const isSelected = selectedSecret?.id === secret.id

            return (
              <li key={secret.id}>
                <button
                  onClick={() => selectSecret(secret)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {secret.title}
                      </h3>
                      {secret.favorite && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {getSubtitle(secret)}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function getSubtitle(secret: { secret_type: SecretType; fields: Record<string, string> }): string {
  switch (secret.secret_type) {
    case 'website':
      return secret.fields.url || secret.fields.username || ''
    case 'api_key':
      return secret.fields.service || ''
    case 'bank_card':
      return secret.fields.bank || ''
    case 'license':
      return secret.fields.software || ''
    case 'ssh_key':
      return secret.fields.title || ''
    default:
      return ''
  }
}
