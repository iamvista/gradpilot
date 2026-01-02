import { useState, useEffect } from 'react'
import { Plus, Check, Trash2, Circle, CheckCircle2, ChevronDown, ChevronUp, Calendar, Tag } from 'lucide-react'
import { todosAPI } from '../../services/api'

const TodoList = ({ onUpdate }) => {
  const [todos, setTodos] = useState([])
  const [showFullForm, setShowFullForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    tags: '',
    due_date: ''
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchTodos = async () => {
    try {
      const response = await todosAPI.getAll()
      setTodos(response.data)
    } catch (error) {
      console.error('獲取待辦事項失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const handleAddTodo = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    try {
      const todoData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        tags: formData.tags.trim() || undefined,
        due_date: formData.due_date || undefined
      }

      await todosAPI.create(todoData)
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        tags: '',
        due_date: ''
      })
      setShowFullForm(false)
      fetchTodos()
      onUpdate?.()
    } catch (error) {
      console.error('創建待辦事項失敗:', error)
      alert('創建失敗，請稍後再試')
    }
  }

  const handleToggleTodo = async (todo) => {
    try {
      await todosAPI.update(todo.id, { completed: !todo.completed })
      fetchTodos()
      onUpdate?.()
    } catch (error) {
      console.error('更新待辦事項失敗:', error)
    }
  }

  const handleDeleteTodo = async (id) => {
    if (!window.confirm('確定要刪除此待辦事項嗎？')) return

    try {
      await todosAPI.delete(id)
      fetchTodos()
      onUpdate?.()
    } catch (error) {
      console.error('刪除待辦事項失敗:', error)
    }
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'pending') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const priorityColors = {
    high: 'border-red-400',
    medium: 'border-yellow-400',
    low: 'border-green-400'
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">待辦清單</h2>
        <div className="flex gap-2">
          {['all', 'pending', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-2 py-1 rounded ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '待辦' : '已完成'}
            </button>
          ))}
        </div>
      </div>

      {/* 新增待辦表單 */}
      <form onSubmit={handleAddTodo} className="mb-4">
        {/* 簡易輸入 */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="新增待辦事項..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
          <button
            type="button"
            onClick={() => setShowFullForm(!showFullForm)}
            className="btn-secondary py-2 px-3 flex items-center gap-1"
            title="展開完整表單"
          >
            {showFullForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            type="submit"
            className="btn-primary py-2 px-4 flex items-center gap-1"
          >
            <Plus size={16} />
            <span>新增</span>
          </button>
        </div>

        {/* 完整表單 */}
        {showFullForm && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {/* 描述 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="詳細描述待辦事項..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
              />
            </div>

            {/* 優先級和標籤 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  優先級
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  截止日期
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* 標籤 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                標籤 <span className="text-gray-500">(用逗號分隔，例如：論文,研究)</span>
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="論文, 研究, 重要"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 標籤可用於搜尋和分類待辦事項
              </p>
            </div>
          </div>
        )}
      </form>

      {/* 待辦清單 */}
      <div className="flex-1 overflow-y-auto space-y-2" style={{ maxHeight: '400px' }}>
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Circle size={48} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">
              {filter === 'pending' ? '沒有待辦事項' :
               filter === 'completed' ? '還沒有完成的事項' :
               '還沒有任何待辦事項'}
            </p>
          </div>
        ) : (
          filteredTodos.map(todo => (
            <div
              key={todo.id}
              className={`p-3 border-l-4 ${priorityColors[todo.priority]} bg-gray-50 rounded-lg hover:shadow-md transition`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleTodo(todo)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {todo.completed ? (
                    <CheckCircle2 size={20} className="text-green-600" />
                  ) : (
                    <Circle size={20} className="text-gray-400 hover:text-primary" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      todo.completed
                        ? 'line-through text-gray-500'
                        : 'text-gray-800 font-medium'
                    }`}
                  >
                    {todo.title}
                  </p>
                  {todo.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{todo.description}</p>
                  )}

                  {/* 標籤和截止日期 */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {todo.tags && (Array.isArray(todo.tags) ? todo.tags : todo.tags.split(',')).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        <Tag size={10} />
                        {typeof tag === 'string' ? tag.trim() : tag}
                      </span>
                    ))}
                    {todo.due_date && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                        <Calendar size={10} />
                        {formatDate(todo.due_date)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-600 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TodoList
