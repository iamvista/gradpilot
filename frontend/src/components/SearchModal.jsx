import { useState, useEffect, useRef } from 'react'
import { Search, X, FileText, CheckSquare, Calendar, Tag } from 'lucide-react'
import { searchAPI } from '../services/api'

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ todos: [], notes: [] })
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const debounceTimer = useRef(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setResults({ todos: [], notes: [] })
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) {
      setResults({ todos: [], notes: [] })
      return
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await searchAPI.searchAll(query)
        setResults(response.data)
        setSelectedIndex(0)
      } catch (error) {
        console.error('搜索失敗:', error)
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
    const totalResults = results.todos.length + results.notes.length

    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % totalResults)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + totalResults) % totalResults)
    } else if (e.key === 'Enter' && totalResults > 0) {
      e.preventDefault()
      handleSelectResult(selectedIndex)
    }
  }

  const handleSelectResult = (index) => {
    const allResults = [
      ...results.todos.map(t => ({ type: 'todo', data: t })),
      ...results.notes.map(n => ({ type: 'note', data: n }))
    ]

    if (allResults[index]) {
      const item = allResults[index]
      console.log('選中項目:', item)
      onClose()
    }
  }

  const highlightText = (text, query) => {
    if (!query || !text) return text

    const regex = new RegExp(`(${query})`, 'gi')
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
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
  }

  if (!isOpen) return null

  const totalResults = results.todos.length + results.notes.length
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
        {/* 搜索框 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Search className="text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="搜索待辦事項和筆記... (Ctrl/Cmd + K)"
            className="flex-1 outline-none text-gray-900 placeholder-gray-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* 搜索結果 */}
        <div className="max-h-96 overflow-y-auto">
          {query && totalResults === 0 && !loading && (
            <div className="py-12 text-center text-gray-500">
              <Search size={48} className="mx-auto mb-3 text-gray-300" />
              <p>找不到相關結果</p>
            </div>
          )}

          {!query && (
            <div className="py-12 text-center text-gray-400">
              <Search size={48} className="mx-auto mb-3 text-gray-300" />
              <p>開始輸入以搜索內容</p>
            </div>
          )}

          {/* 待辦事項結果 */}
          {results.todos.length > 0 && (
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
                      isSelected ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-gray-50'
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
                              {highlightText(todo.tags, query)}
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
          {results.notes.length > 0 && (
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
                      isSelected ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-gray-50'
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
                              {highlightText(note.tags, query)}
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
    </div>
  )
}

export default SearchModal
