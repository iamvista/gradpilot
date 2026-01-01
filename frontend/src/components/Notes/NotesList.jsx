import { useState, useEffect } from 'react'
import { Plus, Pin, Trash2, Edit2, X, Save } from 'lucide-react'
import { notesAPI } from '../../services/api'

const NotesList = () => {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [formData, setFormData] = useState({ title: '', content: '', color: 'yellow' })

  const colors = [
    { name: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { name: 'blue', bg: 'bg-blue-50', border: 'border-blue-200' },
    { name: 'green', bg: 'bg-green-50', border: 'border-green-200' },
    { name: 'pink', bg: 'bg-pink-50', border: 'border-pink-200' },
    { name: 'purple', bg: 'bg-purple-50', border: 'border-purple-200' }
  ]

  const fetchNotes = async () => {
    try {
      const response = await notesAPI.getAll()
      setNotes(response.data)
    } catch (error) {
      console.error('獲取筆記失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    try {
      if (editingNote) {
        await notesAPI.update(editingNote.id, formData)
      } else {
        await notesAPI.create(formData)
      }
      setFormData({ title: '', content: '', color: 'yellow' })
      setShowForm(false)
      setEditingNote(null)
      fetchNotes()
    } catch (error) {
      console.error('保存筆記失敗:', error)
      alert('保存失敗，請稍後再試')
    }
  }

  const handleEdit = (note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content || '',
      color: note.color || 'yellow'
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除此筆記嗎？')) return

    try {
      await notesAPI.delete(id)
      fetchNotes()
    } catch (error) {
      console.error('刪除筆記失敗:', error)
    }
  }

  const handleTogglePin = async (note) => {
    try {
      await notesAPI.update(note.id, { pinned: !note.pinned })
      fetchNotes()
    } catch (error) {
      console.error('更新筆記失敗:', error)
    }
  }

  const getColorClasses = (colorName) => {
    const color = colors.find(c => c.name === colorName) || colors[0]
    return `${color.bg} ${color.border}`
  }

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">快速筆記</h2>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingNote(null)
            setFormData({ title: '', content: '', color: 'yellow' })
          }}
          className="btn-primary py-1.5 px-3 flex items-center gap-1 text-sm"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          <span>{showForm ? '取消' : '新增'}</span>
        </button>
      </div>

      {/* 新增/編輯表單 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="筆記標題..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            autoFocus
          />
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="筆記內容..."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {colors.map(color => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.name })}
                  className={`w-6 h-6 rounded-full ${color.bg} border-2 ${
                    formData.color === color.name ? 'border-primary' : 'border-gray-300'
                  } hover:scale-110 transition`}
                />
              ))}
            </div>
            <button type="submit" className="btn-primary py-1.5 px-4 text-sm flex items-center gap-1">
              <Save size={14} />
              <span>保存</span>
            </button>
          </div>
        </form>
      )}

      {/* 筆記列表 */}
      <div className="flex-1 overflow-y-auto space-y-3" style={{ maxHeight: '400px' }}>
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Edit2 size={48} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">還沒有任何筆記</p>
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className={`p-3 border-2 rounded-lg ${getColorClasses(note.color)} hover:shadow-md transition`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800 text-sm flex-1">
                  {note.pinned && <Pin size={14} className="inline mr-1 text-orange-600" />}
                  {note.title}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleTogglePin(note)}
                    className={`text-gray-400 hover:text-orange-600 transition ${
                      note.pinned ? 'text-orange-600' : ''
                    }`}
                  >
                    <Pin size={14} />
                  </button>
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-gray-400 hover:text-primary transition"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {note.content && (
                <p className="text-xs text-gray-600 line-clamp-3">{note.content}</p>
              )}
              {note.tags && note.tags.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {note.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotesList
