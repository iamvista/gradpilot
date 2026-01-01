import { useState, useEffect } from 'react'
import { Plus, Check, Trash2, Circle, CheckCircle2 } from 'lucide-react'
import { todosAPI } from '../../services/api'

const TodoList = ({ onUpdate }) => {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, completed

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
    if (!newTodo.trim()) return

    try {
      await todosAPI.create({ title: newTodo.trim(), priority: 'medium' })
      setNewTodo('')
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
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="新增待辦事項..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
          <button
            type="submit"
            className="btn-primary py-2 px-4 flex items-center gap-1"
          >
            <Plus size={16} />
            <span>新增</span>
          </button>
        </div>
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
                    <p className="text-xs text-gray-500 mt-1">{todo.description}</p>
                  )}
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
