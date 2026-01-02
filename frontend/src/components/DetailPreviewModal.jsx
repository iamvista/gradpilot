import { useState } from 'react'
import { X, Copy, Edit, Trash2, CheckCircle, Calendar, Tag, Clock } from 'lucide-react'

const DetailPreviewModal = ({ isOpen, onClose, item, type, onDelete, onUpdate }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !item) return null

  const handleCopy = (text, title = false) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(title ? 'title' : 'all')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleDelete = () => {
    if (window.confirm(`確定要刪除這個${type === 'todo' ? '待辦事項' : '筆記'}嗎？`)) {
      onDelete?.(item.id)
      onClose()
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const renderTodoContent = () => (
    <div className="space-y-4">
      {/* 標題 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle
              size={20}
              className={item.completed ? 'text-green-500' : 'text-gray-400'}
            />
            {item.title}
          </h3>
          <button
            onClick={() => handleCopy(item.title, true)}
            className="text-gray-400 hover:text-blue-500 transition"
            title="複製標題"
          >
            {copied === 'title' ? (
              <CheckCircle size={18} className="text-green-500" />
            ) : (
              <Copy size={18} />
            )}
          </button>
        </div>

        {/* 狀態標籤 */}
        <div className="flex items-center gap-2 flex-wrap">
          {item.completed && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
              已完成
            </span>
          )}
          {item.priority && (
            <span className={`px-2 py-1 text-xs rounded ${
              item.priority === 'high' ? 'bg-red-100 text-red-700' :
              item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {item.priority === 'high' ? '高優先級' :
               item.priority === 'medium' ? '中優先級' : '低優先級'}
            </span>
          )}
          {item.tags && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded flex items-center gap-1">
              <Tag size={12} />
              {Array.isArray(item.tags) ? item.tags.join(', ') : item.tags}
            </span>
          )}
        </div>
      </div>

      {/* 描述 */}
      {item.description && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">描述</h4>
          <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
            {item.description}
          </p>
        </div>
      )}

      {/* 截止日期 */}
      {item.due_date && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>截止日期：{formatDate(item.due_date)}</span>
        </div>
      )}

      {/* 建立時間 */}
      <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 flex items-center gap-2">
        <Clock size={14} />
        建立於 {formatDate(item.created_at)}
      </div>
    </div>
  )

  const renderNoteContent = () => (
    <div className="space-y-4">
      {/* 標題 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {item.title}
          </h3>
          <button
            onClick={() => handleCopy(item.title, true)}
            className="text-gray-400 hover:text-blue-500 transition"
            title="複製標題"
          >
            {copied === 'title' ? (
              <CheckCircle size={18} className="text-green-500" />
            ) : (
              <Copy size={18} />
            )}
          </button>
        </div>

        {/* 標籤 */}
        <div className="flex items-center gap-2 flex-wrap">
          {item.pinned && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
              📌 已置頂
            </span>
          )}
          {item.category && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
              {item.category}
            </span>
          )}
          {item.tags && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded flex items-center gap-1">
              <Tag size={12} />
              {Array.isArray(item.tags) ? item.tags.join(', ') : item.tags}
            </span>
          )}
        </div>
      </div>

      {/* 內容 */}
      {item.content && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">內容</h4>
          <div
            className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded max-h-96 overflow-y-auto"
            style={{ borderLeft: item.color ? `4px solid ${item.color}` : 'none' }}
          >
            {item.content}
          </div>
        </div>
      )}

      {/* 更新時間 */}
      <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 flex items-center gap-2">
        <Clock size={14} />
        最後更新於 {formatDate(item.updated_at)}
      </div>
    </div>
  )

  const getFullText = () => {
    if (type === 'todo') {
      const tags = Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '')
      return `${item.title}\n${item.description || ''}\n${tags}`.trim()
    } else {
      return `${item.title}\n\n${item.content || ''}`.trim()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* 標題列 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">
            {type === 'todo' ? '待辦事項詳情' : '筆記詳情'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* 內容區域 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {type === 'todo' ? renderTodoContent() : renderNoteContent()}
        </div>

        {/* 操作按鈕 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(getFullText())}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
            >
              {copied === 'all' ? (
                <>
                  <CheckCircle size={18} />
                  已複製
                </>
              ) : (
                <>
                  <Copy size={18} />
                  複製全部
                </>
              )}
            </button>

            {onUpdate && (
              <button
                onClick={() => onUpdate(item)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
              >
                <Edit size={18} />
                編輯
              </button>
            )}
          </div>

          {onDelete && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
            >
              <Trash2 size={18} />
              刪除
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetailPreviewModal
