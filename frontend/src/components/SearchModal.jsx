import { useState, useEffect, useRef } from 'react'
import { Search, X, FileText, CheckSquare, Calendar, Tag, AlertCircle } from 'lucide-react'
import { searchAPI, todosAPI, notesAPI } from '../services/api'
import DetailPreviewModal from './DetailPreviewModal'

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ todos: [], notes: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [previewItem, setPreviewItem] = useState(null)
  const [previewType, setPreviewType] = useState(null)
  const inputRef = useRef(null)
  const debounceTimer = useRef(null)
  const abortController = useRef(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setResults({ todos: [], notes: [] })
      setError('')
      setSelectedIndex(0)
    }

    return () => {
      // 清理：取消未完成的請求
      if (abortController.current) {
        abortController.current.abort()
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [isOpen])

  useEffect(() => {
    // 清除錯誤訊息
    setError('')

    // 如果查詢為空，清空結果
    if (!query.trim()) {
      setResults({ todos: [], notes: [] })
      return
    }

    // 檢查最小長度（後端要求至少 2 個字元）
    if (query.trim().length < 2) {
      setResults({ todos: [], notes: [] })
      return
    }

    // 清除之前的定時器
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // 防抖搜尋
    debounceTimer.current = setTimeout(async () => {
      // 取消之前的請求
      if (abortController.current) {
        abortController.current.abort()
      }

      // 創建新的 AbortController
      abortController.current = new AbortController()

      setLoading(true)
      setError('')

      try {
        const response = await searchAPI.searchAll(query)

        // 檢查響應數據結構
        if (!response || !response.data) {
          throw new Error('無效的響應格式')
        }

        // 後端返回的格式是 { query, results: { todos, notes, total } }
        const searchResults = response.data.results || { todos: [], notes: [] }

        // 確保 todos 和 notes 是陣列
        setResults({
          todos: Array.isArray(searchResults.todos) ? searchResults.todos : [],
          notes: Array.isArray(searchResults.notes) ? searchResults.notes : []
        })
        setSelectedIndex(0)
      } catch (err) {
        // 忽略取消的請求
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          return
        }

        console.error('搜尋失敗:', err)

        // 設置用戶友好的錯誤訊息
        if (err.response?.status === 401) {
          setError('請先登入')
        } else if (err.response?.status === 400) {
          setError('搜尋關鍵字至少需要 2 個字元')
        } else if (err.code === 'ECONNABORTED') {
          setError('請求超時，請稍後再試')
        } else if (!err.response) {
          setError('無法連接到伺服器，請檢查網路連接')
        } else {
          setError('搜尋時發生錯誤，請稍後再試')
        }

        setResults({ todos: [], notes: [] })
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query])

  const handleKeyDown = (e) => {
    const totalResults = (results.todos?.length || 0) + (results.notes?.length || 0)

    if (e.key === 'Escape') {
      onClose()
    } else if (totalResults > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % totalResults)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + totalResults) % totalResults)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleSelectResult(selectedIndex)
      }
    }
  }

  const handleSelectResult = (index) => {
    const allResults = [
      ...(results.todos || []).map(t => ({ type: 'todo', data: t })),
      ...(results.notes || []).map(n => ({ type: 'note', data: n }))
    ]

    if (allResults[index]) {
      const item = allResults[index]
      setPreviewItem(item.data)
      setPreviewType(item.type)
    }
  }

  const handleClosePreview = () => {
    setPreviewItem(null)
    setPreviewType(null)
  }

  const handleDelete = async (id) => {
    try {
      if (previewType === 'todo') {
        await todosAPI.delete(id)
        // 從搜尋結果中移除
        setResults(prev => ({
          ...prev,
          todos: prev.todos.filter(t => t.id !== id)
        }))
      } else {
        await notesAPI.delete(id)
        setResults(prev => ({
          ...prev,
          notes: prev.notes.filter(n => n.id !== id)
        }))
      }
      handleClosePreview()
    } catch (err) {
      console.error('刪除失敗:', err)
      alert('刪除失敗，請稍後再試')
    }
  }

  const handleUpdate = (item) => {
    // TODO: 實現編輯功能
    console.log('編輯項目:', item)
    alert('編輯功能即將推出！')
  }

  const highlightText = (text, query) => {
    if (!query || !text) return text

    try {
      // 轉義特殊字元以避免正則表達式錯誤
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`(${escapedQuery})`, 'gi')
      const parts = text.split(regex)

      return parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 text-gray-900">
            {part}
          </mark>
        ) : (
          part
        )
      )
    } catch (err) {
      // 如果正則表達式出錯，直接返回原文
      console.error('高亮文字錯誤:', err)
      return text
    }
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

  if (!isOpen) return null

  const totalResults = (results.todos?.length || 0) + (results.notes?.length || 0)
  let currentIndex = 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* 搜尋框 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Search className="text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="搜尋待辦事項和筆記... (Ctrl/Cmd + K)"
            className="flex-1 outline-none text-gray-900 placeholder-gray-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* 搜尋結果 */}
        <div className="max-h-96 overflow-y-auto">
          {/* 錯誤提示 */}
          {error && (
            <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* 無結果 */}
          {query && query.trim().length >= 2 && totalResults === 0 && !loading && !error && (
            <div className="py-12 text-center text-gray-500">
              <Search size={48} className="mx-auto mb-3 text-gray-300" />
              <p>找不到相關結果</p>
              <p className="text-sm text-gray-400 mt-1">試試其他關鍵字</p>
            </div>
          )}

          {/* 提示訊息 */}
          {!query && (
            <div className="py-12 text-center text-gray-400">
              <Search size={48} className="mx-auto mb-3 text-gray-300" />
              <p>開始輸入以搜尋內容</p>
              <p className="text-sm mt-1">至少需要 2 個字元</p>
            </div>
          )}

          {/* 字數不足提示 */}
          {query && query.trim().length < 2 && (
            <div className="py-12 text-center text-gray-400">
              <Search size={48} className="mx-auto mb-3 text-gray-300" />
              <p>請輸入至少 2 個字元</p>
            </div>
          )}

          {/* 待辦事項結果 */}
          {results.todos && results.todos.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 flex items-center gap-2">
                <CheckSquare size={14} />
                待辦事項 ({results.todos.length})
              </div>
              {results.todos.map((todo) => {
                const index = currentIndex++
                const isSelected = index === selectedIndex

                return (
                  <div
                    key={todo.id}
                    onClick={() => handleSelectResult(index)}
                    className={`px-4 py-3 cursor-pointer transition ${
                      isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <CheckSquare
                        size={18}
                        className={todo.completed ? 'text-green-500' : 'text-gray-400'}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium ${todo.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {highlightText(todo.title, query)}
                        </h4>
                        {todo.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                            {highlightText(todo.description, query)}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          {todo.priority && (
                            <span className={`px-2 py-0.5 rounded ${
                              todo.priority === 'high' ? 'bg-red-100 text-red-700' :
                              todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
                            </span>
                          )}
                          {todo.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(todo.due_date)}
                            </span>
                          )}
                          {todo.tags && (
                            <span className="flex items-center gap-1">
                              <Tag size={12} />
                              {highlightText(Array.isArray(todo.tags) ? todo.tags.join(', ') : todo.tags, query)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 筆記結果 */}
          {results.notes && results.notes.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 flex items-center gap-2">
                <FileText size={14} />
                筆記 ({results.notes.length})
              </div>
              {results.notes.map((note) => {
                const index = currentIndex++
                const isSelected = index === selectedIndex

                return (
                  <div
                    key={note.id}
                    onClick={() => handleSelectResult(index)}
                    className={`px-4 py-3 cursor-pointer transition ${
                      isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FileText size={18} className="text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">
                          {highlightText(note.title, query)}
                        </h4>
                        {note.content && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {highlightText(note.content.substring(0, 150), query)}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          {note.category && (
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                              {note.category}
                            </span>
                          )}
                          {note.tags && (
                            <span className="flex items-center gap-1">
                              <Tag size={12} />
                              {highlightText(Array.isArray(note.tags) ? note.tags.join(', ') : note.tags, query)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 快捷鍵提示 */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
          <span><kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↑↓</kbd> 導航</span>
          <span><kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">Enter</kbd> 選擇</span>
          <span><kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">Esc</kbd> 關閉</span>
        </div>
      </div>

      {/* 詳情預覽 Modal */}
      <DetailPreviewModal
        isOpen={!!previewItem}
        onClose={handleClosePreview}
        item={previewItem}
        type={previewType}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </div>
  )
}

export default SearchModal
