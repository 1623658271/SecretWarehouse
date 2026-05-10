import { useState, useEffect } from 'react'
import { useStore } from '../stores/useStore'
import { Key, Lock, Star, Eye, EyeOff, Copy, Edit, Trash2, Clock, CheckCircle2, X } from 'lucide-react'
import { iconMap, iconColors } from '../constants/icons'

export default function SecretDetail() {
  const { selectedSecret, secrets, updateSecret, deleteSecret, setEditingSecret, selectSecret } = useStore()
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({})
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const currentSecret = selectedSecret
    ? secrets.find(s => s.id === selectedSecret.id) || selectedSecret
    : null

  useEffect(() => {
    setShowSensitive({})
    setCopiedField(null)
  }, [selectedSecret?.id])

  if (!currentSecret) return null

  const Icon = iconMap[currentSecret.icon] || Key
  const gradientColor = iconColors[currentSecret.icon] || 'from-yellow-400 to-amber-500'

  const toggleSensitive = (field: string) => {
    setShowSensitive((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const copyToClipboard = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const toggleFavorite = () => {
    updateSecret({ id: currentSecret.id, favorite: !currentSecret.favorite })
  }

  const handleDelete = () => {
    deleteSecret(currentSecret.id)
    setShowDeleteConfirm(false)
    selectSecret(null)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={() => selectSecret(null)}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-700/60 shadow-2xl animate-in slide-in-from-bottom-4 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-700/40">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientColor} flex items-center justify-center shadow-lg`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{currentSecret.title}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{Object.keys(currentSecret.fields).length} 个字段</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-xl transition-all hover:scale-110 ${
                currentSecret.favorite ? 'text-amber-500 bg-amber-100 dark:bg-amber-900/20' : 'text-slate-400 hover:text-amber-500'
              }`}
              title={currentSecret.favorite ? '取消收藏' : '添加收藏'}
            >
              <Star className={`w-5 h-5 ${currentSecret.favorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => setEditingSecret(currentSecret)}
              className="p-2 rounded-xl text-slate-400 hover:text-violet-500 transition-all hover:scale-110 hover:bg-violet-50 dark:hover:bg-violet-900/20"
              title="编辑"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 transition-all hover:scale-110 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="删除"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => selectSecret(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all hover:scale-110 hover:bg-slate-100 dark:hover:bg-slate-800 ml-2"
              title="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Description */}
          {currentSecret.description && (
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/30">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentSecret.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {currentSecret.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {currentSecret.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg">
                  <span className="text-violet-400">#</span>{tag}
                </span>
              ))}
            </div>
          )}

          {/* Fields */}
          <div className="space-y-4">
            {(currentSecret.fieldOrder || Object.keys(currentSecret.fields)).map((key, index) => {
              const value = currentSecret.fields[key]
              const isSensitive = currentSecret.sensitiveFields?.includes(key) || false
              const isVisible = showSensitive[key]

              return (
                <div
                  key={key}
                  className="animate-in slide-in-from-left-2 duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">{key}</label>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      isSensitive ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30' : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/40'
                    }`}>
                      {isSensitive && (
                        <div className="p-1 rounded bg-amber-100 dark:bg-amber-900/30">
                          <Lock className="w-3 h-3 text-amber-600 dark:text-amber-500" />
                        </div>
                      )}
                      <code className={`flex-1 text-sm font-mono break-all ${
                        isSensitive && !isVisible ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'
                      }`}>
                        {isSensitive && !isVisible ? '••••••••••••••••' : value}
                      </code>
                    </div>
                    <div className="flex items-center gap-1">
                      {isSensitive && (
                        <button
                          onClick={() => toggleSensitive(key)}
                          className={`p-2 rounded-lg transition-all hover:scale-110 ${
                            isVisible ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' : 'text-slate-400 hover:text-violet-500 dark:hover:text-violet-400'
                          }`}
                        >
                          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => copyToClipboard(value, key)}
                        className={`p-2 rounded-lg transition-all hover:scale-110 ${
                          copiedField === key ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400'
                        }`}
                        title="复制"
                      >
                        {copiedField === key ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Metadata */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/40">
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>创建: {formatDate(currentSecret.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>更新: {formatDate(currentSecret.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-in slide-in-from-bottom-4 zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center mb-4 shadow-lg">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">确认删除</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
                确定要删除 "<span className="font-semibold text-slate-700 dark:text-slate-300">{currentSecret.title}</span>" 吗？此操作无法撤回。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/25"
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
