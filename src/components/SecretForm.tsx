import { useState, useEffect } from 'react'
import { useStore } from '../stores/useStore'
import { X, RefreshCw } from 'lucide-react'
import { SecretType, CreateSecretRequest } from '../types'

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

const passwordFields = ['password', 'cvv', 'license_key']

export default function SecretForm() {
  const { secretTypes, editingSecret, setShowForm, createSecret, updateSecret, generatePassword } =
    useStore()

  const [secretType, setSecretType] = useState<SecretType>(
    (editingSecret?.secret_type as SecretType) || 'website'
  )
  const [title, setTitle] = useState(editingSecret?.title || '')
  const [fields, setFields] = useState<Record<string, string>>(
    editingSecret?.fields || { url: '', username: '', password: '' }
  )
  const [tags, setTags] = useState(editingSecret?.tags.join(', ') || '')
  const [generatingField, setGeneratingField] = useState<string | null>(null)

  useEffect(() => {
    if (!editingSecret) {
      const defaultFields: Record<string, string> = {}
      const fields = fieldLabels[secretType] || {}
      Object.keys(fields).forEach((key) => {
        defaultFields[key] = ''
      })
      setFields(defaultFields)
    }
  }, [secretType, editingSecret])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingSecret) {
      await updateSecret({
        id: editingSecret.id,
        title,
        fields,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      })
    } else {
      const req: CreateSecretRequest = {
        secret_type: secretType,
        title,
        fields,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }
      await createSecret(req)
    }
  }

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  const handleGeneratePassword = async (field: string) => {
    setGeneratingField(field)
    try {
      const password = await generatePassword(16)
      handleFieldChange(field, password)
    } catch (err) {
      console.error('Failed to generate password:', err)
    }
    setGeneratingField(null)
  }

  const labels = fieldLabels[secretType] || {}

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingSecret ? '编辑条目' : '新增条目'}
          </h2>
          <button
            onClick={() => setShowForm(false)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selector (only for new entries) */}
          {!editingSecret && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                类型
              </label>
              <select
                value={secretType}
                onChange={(e) => setSecretType(e.target.value as SecretType)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {secretTypes.map((type) => (
                  <option key={type.type_name} value={type.type_name}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="输入标题..."
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Dynamic Fields */}
          {Object.entries(labels).map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
              </label>
              <div className="flex gap-2">
                {key === 'content' || key === 'private_key' || key === 'note' ? (
                  <textarea
                    value={fields[key] || ''}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    rows={4}
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                ) : (
                  <>
                    <input
                      type={passwordFields.includes(key) && !showPassword ? 'password' : 'text'}
                      value={fields[key] || ''}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      placeholder={`输入${label}...`}
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {passwordFields.includes(key) && (
                      <button
                        type="button"
                        onClick={() => handleGeneratePassword(key)}
                        disabled={generatingField === key}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="生成随机密码"
                      >
                        <RefreshCw
                          className={`w-5 h-5 ${generatingField === key ? 'animate-spin' : ''}`}
                        />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              标签 (用逗号分隔)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="例如: 工作, 个人, 重要..."
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingSecret ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Helper to check if we should show password field in plain text
const showPassword = true // Can be toggled with a state if needed
