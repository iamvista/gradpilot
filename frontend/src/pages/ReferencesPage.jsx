import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Download, Filter, Search, FileText, BookOpen } from 'lucide-react'
import { referencesAPI } from '../services/api'
import ReferenceCard from '../components/References/ReferenceCard'
import ReferenceForm from '../components/References/ReferenceForm'

const ReferencesPage = () => {
  const navigate = useNavigate()
  const [references, setReferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReference, setEditingReference] = useState(null)

  // 篩選和排序
  const [filters, setFilters] = useState({
    type: '',
    tags: '',
    search: '',
    sort: 'created_at',
    order: 'desc'
  })

  const [stats, setStats] = useState({
    total: 0,
    articles: 0,
    books: 0,
    websites: 0
  })

  useEffect(() => {
    fetchReferences()
  }, [filters])

  const fetchReferences = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.type) params.type = filters.type
      if (filters.tags) params.tags = filters.tags
      if (filters.search) params.search = filters.search
      params.sort = filters.sort
      params.order = filters.order

      const response = await referencesAPI.getAll(params)
      setReferences(response.data.references)

      // 計算統計
      const refs = response.data.references
      setStats({
        total: refs.length,
        articles: refs.filter(r => r.reference_type === 'article').length,
        books: refs.filter(r => r.reference_type === 'book').length,
        websites: refs.filter(r => r.reference_type === 'website').length
      })
    } catch (error) {
      console.error('獲取文獻失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await referencesAPI.delete(id)
      fetchReferences()
    } catch (error) {
      console.error('刪除失敗:', error)
      alert('刪除失敗，請稍後再試')
    }
  }

  const handleEdit = (reference) => {
    setEditingReference(reference)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingReference(null)
    fetchReferences()
  }

  const handleExportBibTeX = async () => {
    try {
      const response = await referencesAPI.export({ format: 'bibtex' })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `references_${new Date().toISOString().split('T')[0]}.bib`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('導出失敗:', error)
      alert('導出失敗，請稍後再試')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 頂部導航欄 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition"
              >
                <ArrowLeft size={20} />
                <span>返回儀表板</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                <BookOpen size={24} />
                文獻管理
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportBibTeX}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <Download size={18} />
                導出 BibTeX
              </button>
              <button
                onClick={() => {
                  setEditingReference(null)
                  setShowForm(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                <Plus size={18} />
                新增文獻
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">總計</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">期刊文章</p>
                <p className="text-2xl font-bold text-blue-700">{stats.articles}</p>
              </div>
              <FileText className="text-blue-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">書籍</p>
                <p className="text-2xl font-bold text-green-700">{stats.books}</p>
              </div>
              <BookOpen className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">網站</p>
                <p className="text-2xl font-bold text-purple-700">{stats.websites}</p>
              </div>
              <FileText className="text-purple-400" size={32} />
            </div>
          </div>
        </div>

        {/* 篩選和搜尋 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 搜尋 */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="搜尋標題、期刊、筆記..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* 類型篩選 */}
            <div>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">所有類型</option>
                <option value="article">期刊文章</option>
                <option value="book">書籍</option>
                <option value="website">網站</option>
                <option value="conference">會議論文</option>
              </select>
            </div>

            {/* 排序 */}
            <div>
              <select
                value={`${filters.sort}-${filters.order}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-')
                  setFilters({ ...filters, sort, order })
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="created_at-desc">最新添加</option>
                <option value="created_at-asc">最早添加</option>
                <option value="year-desc">年份（新到舊）</option>
                <option value="year-asc">年份（舊到新）</option>
                <option value="title-asc">標題（A-Z）</option>
                <option value="title-desc">標題（Z-A）</option>
              </select>
            </div>
          </div>
        </div>

        {/* 文獻列表 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        ) : references.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">
              {filters.search || filters.type || filters.tags
                ? '找不到符合條件的文獻'
                : '還沒有任何文獻'}
            </p>
            <button
              onClick={() => {
                setEditingReference(null)
                setShowForm(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              <Plus size={18} />
              新增第一條文獻
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {references.map((reference) => (
              <ReferenceCard
                key={reference.id}
                reference={reference}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onUpdate={fetchReferences}
              />
            ))}
          </div>
        )}
      </main>

      {/* 表單 Modal */}
      {showForm && (
        <ReferenceForm
          reference={editingReference}
          onSave={handleFormClose}
          onCancel={() => {
            setShowForm(false)
            setEditingReference(null)
          }}
        />
      )}
    </div>
  )
}

export default ReferencesPage
