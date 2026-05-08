import { useState } from 'react'
import { useStore } from '../stores/useStore'
import { X, Plus, Trash2, Tag } from 'lucide-react'
import { ICON_OPTIONS } from '../types'
import { iconMap, iconColors } from '../constants/icons'

export default function TemplateForm() {
  const { editingTemplate, setEditingTemplate, setShowTemplateForm, createTemplate, updateTemplate } = useStore()

  const [name, setName] = useState(editingTemplate?.name || '')
  const [description, setDescription] = useState(editingTemplate?.description || '')
  const [fields, setFields] = useState<string[]>(
    editingTemplate?.fields.length ? editingTemplate.fields : ['']
  )
  const [tags, setTags] = useState<string[]>(editingTemplate?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [icon, setIcon] = useState(editingTemplate?.icon || 'key')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!name.trim() || isSubmitting) return

    setError(null)
    setIsSubmitting(true)

    try {
      const fieldsArray = fields.filter(f => f.trim())

      if (editingTemplate) {
        await updateTemplate({ id: editingTemplate.id, name, description, fields: fieldsArray, tags, icon })
      } else {
        await createTemplate({ name, description, fields: fieldsArray, tags, icon })
      }
      setEditingTemplate(null)
      setShowTemplateForm(false)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const addField = () => {
    setFields([...fields, ''])
  }

  const removeField = (index: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index))
    }
  }

  const updateField = (index: number, value: string) => {
    const newFields = [...fields]
    newFields[index] = value
    setFields(newFields)
  }

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-700/60 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700/40">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingTemplate ? '编辑模板' : '新建模板'}
          </h2>
          <button
            onClick={() => setShowTemplateForm(false)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">模板名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入模板名称..."
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="添加描述信息..."
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">图标</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(opt => {
                const IconComponent = iconMap[opt.name]
                const gradientColor = iconColors[opt.name] || 'from-yellow-400 to-amber-500'
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setIcon(opt.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      icon === opt.name
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25 scale-105'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${gradientColor} flex items-center justify-center`}>
                      {IconComponent && <IconComponent className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">字段名称</label>
              <button
                type="button"
                onClick={addField}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-lg transition-all hover:scale-105"
              >
                <Plus className="w-3 h-3" />
                添加字段
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={index} className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
                  <input
                    type="text"
                    value={field}
                    onChange={(e) => updateField(index, e.target.value)}
                    placeholder="字段名 (如: 用户名, 密码)"
                    className="flex-1 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="p-2.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl transition-all hover:scale-110 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              默认标签 <span className="font-normal text-slate-500">(回车添加)</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="输入标签后按回车添加..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
            {/* Added tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2.5 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-medium animate-in zoom-in duration-200"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="p-0.5 hover:bg-violet-200 dark:hover:bg-violet-800 rounded transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/40 flex gap-3">
          <button
            type="button"
            onClick={() => setShowTemplateForm(false)}
            className="flex-1 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="flex-1 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 shadow-lg shadow-violet-500/25 disabled:shadow-none"
          >
            {isSubmitting ? '保存中...' : (editingTemplate ? '保存修改' : '创建模板')}
          </button>
        </div>
      </div>
    </div>
  )
}
