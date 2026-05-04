import { useState } from 'react'
import { useStore } from '../stores/useStore'
import {
  Globe,
  Key,
  CreditCard,
  FileText,
  Terminal,
  Award,
  Star,
  Eye,
  EyeOff,
  Copy,
  Edit,
  Trash2,
  Clock,
} from 'lucide-react'
import { SecretType } from '../types'

const typeIcons: Record<SecretType, React.ComponentType<{ className?: string }>> = {
  website: Globe,
  api_key: Key,
  bank_card: CreditCard,
  secure_note: FileText,
  ssh_key: Terminal,
  license: Award,
}

const fieldLabels: Record<string, Record<string, string>> = {
  website: {
    url: '网址',
    username: '用户名',
    password: '密码',
  },
  api_key: {
    service: '服务名称',
    key: 'API Key',
    note: '备注',
  },
  bank_card: {
    bank: '银行名称',
    card_number: '卡号',
    holder: '持卡人',
    expiry: '有效期',
    cvv: 'CVV',
  },
  secure_note: {
    content: '内容',
  },
  ssh_key: {
    title: '标题',
    private_key: '私钥',
    public_key: '公钥',
    note: '备注',
  },
  license: {
    software: '软件名称',
    license_key: '许可证密钥',
    email: '邮箱',
    note: '备注',
  },
}

const sensitiveFields = ['password', 'key', 'private_key', 'cvv', 'card_number', 'license_key']

export default function SecretDetail() {
  const { selectedSecret, updateSecret, deleteSecret, setEditingSecret } = useStore()
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({})
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!selectedSecret) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>选择一个条目查看详情</p>
        </div>
      </div>
    )
  }

  const Icon = typeIcons[selectedSecret.secret_type] || FileText
  const labels = fieldLabels[selectedSecret.secret_type] || {}

  const toggleSensitive = (field: string) => {
    setShowSensitive((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const copyToClipboard = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const toggleFavorite = () => {
    updateSecret({
      id: selectedSecret.id,
      favorite: !selectedSecret.favorite,
    })
  }

  const handleDelete = () => {
    deleteSecret(selectedSecret.id)
    setShowDeleteConfirm(false)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN')
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Icon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedSecret.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getSecretTypeLabel(selectedSecret.secret_type)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  selectedSecret.favorite
                    ? 'text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={selectedSecret.favorite ? '取消收藏' : '添加收藏'}
              >
                <Star
                  className={`w-5 h-5 ${selectedSecret.favorite ? 'fill-yellow-500' : ''}`}
                />
              </button>
              <button
                onClick={() => setEditingSecret(selectedSecret)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
                title="编辑"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                title="删除"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tags */}
          {selectedSecret.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedSecret.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Fields */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            详细信息
          </h2>
          <div className="space-y-4">
            {Object.entries(selectedSecret.fields).map(([key, value]) => {
              const isSensitive = sensitiveFields.includes(key)
              const isVisible = showSensitive[key]
              const label = labels[key] || key

              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {label}
                    </label>
                    <div className="flex items-center gap-2">
                      <code
                        className={`flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono ${
                          isSensitive && !isVisible
                            ? 'text-gray-400 dark:text-gray-500'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {isSensitive && !isVisible
                          ? '••••••••••••••••'
                          : value}
                      </code>
                      {isSensitive && (
                        <button
                          onClick={() => toggleSensitive(key)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {isVisible ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => copyToClipboard(value, key)}
                        className={`p-2 transition-colors ${
                          copiedField === key
                            ? 'text-green-500'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                        title="复制"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            元数据
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>创建时间: {formatDate(selectedSecret.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>更新时间: {formatDate(selectedSecret.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                确认删除
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                确定要删除 "{selectedSecret.title}" 吗？此操作无法撤回。
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getSecretTypeLabel(type: SecretType): string {
  const labels: Record<SecretType, string> = {
    website: '网站账号',
    api_key: 'API Key',
    bank_card: '银行卡',
    secure_note: '安全笔记',
    ssh_key: 'SSH 密钥',
    license: '软件许可证',
  }
  return labels[type] || type
}
