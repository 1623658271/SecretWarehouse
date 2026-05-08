import { useEffect } from 'react'
import { useStore } from '../stores/useStore'
import { X, Plus, Trash2, Edit2, FileText, Key } from 'lucide-react'
import { iconMap, iconColors } from '../constants/icons'
import { Template } from '../types'

interface TemplateListProps {
  onSelectTemplate: (template: Template) => void
}

export default function TemplateList({ onSelectTemplate }: TemplateListProps) {
  const {
    templates, fetchTemplates, setShowTemplates, setShowTemplateForm,
    setEditingTemplate, deleteTemplate
  } = useStore()

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleEdit = (e: React.MouseEvent, template: Template) => {
    e.stopPropagation()
    setEditingTemplate(template)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('确定要删除这个模板吗？')) {
      await deleteTemplate(id)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-700/60 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700/40">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">选择模板</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplateForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建模板
            </button>
            <button
              onClick={() => setShowTemplates(false)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-400 dark:text-slate-600" />
              </div>
              <p className="text-base font-medium text-slate-600 dark:text-slate-400 mb-1">暂无模板</p>
              <p className="text-sm text-slate-500">点击"新建模板"创建你的第一个模板</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={onSelectTemplate}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface TemplateCardProps {
  template: Template
  onSelect: (template: Template) => void
  onEdit: (e: React.MouseEvent, template: Template) => void
  onDelete: (e: React.MouseEvent, id: string) => void
}

function TemplateCard({ template, onSelect, onEdit, onDelete }: TemplateCardProps) {
  const Icon = iconMap[template.icon] || Key
  const gradientColor = iconColors[template.icon] || 'from-yellow-400 to-amber-500'

  return (
    <div
      onClick={() => onSelect(template)}
      className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/50 hover:border-violet-300 dark:hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientColor} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{template.name}</h3>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => onEdit(e, template)}
                className="p-1.5 text-slate-400 hover:text-violet-500 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => onDelete(e, template.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {template.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{template.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-slate-400">{template.fields.length} 个字段</span>
            {template.tags.length > 0 && (
              <>
                <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                <span className="text-xs text-violet-500 dark:text-violet-400">
                  {template.tags.slice(0, 2).map(t => `#${t}`).join(' ')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
