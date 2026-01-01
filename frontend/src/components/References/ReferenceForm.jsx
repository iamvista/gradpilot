import { useState, useEffect } from 'react'
import { X, Save, Sparkles } from 'lucide-react'
import { referencesAPI } from '../../services/api'

const ReferenceForm = ({ reference, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    authors: [],
    year: '',
    journal: '',
    volume: '',
    issue: '',
    pages: '',
    publisher: '',
    doi: '',
    url: '',
    reference_type: 'article',
    tags: '',
    notes: ''
  })

  const [authorInput, setAuthorInput] = useState({ last: '', first: '' })
  const [loading, setLoading] = useState(false)
  const [parseText, setParseText] = useState('')
  const [parsing, setParsing] = useState(false)

  useEffect(() => {
    if (reference) {
      setFormData({
        title: reference.title || '',
        authors: reference.authors || [],
        year: reference.year || '',
        journal: reference.journal || '',
        volume: reference.volume || '',
        issue: reference.issue || '',
        pages: reference.pages || '',
        publisher: reference.publisher || '',
        doi: reference.doi || '',
        url: reference.url || '',
        reference_type: reference.reference_type || 'article',
        tags: reference.tags || '',
        notes: reference.notes || ''
      })
    }
  }, [reference])

  const handleParse = async () => {
    if (!parseText.trim()) return

    setParsing(true)
    try {
      const response = await referencesAPI.parse({
        text: parseText,
        enrich: true
      })

      const parsed = response.data.data

      setFormData({
        title: parsed.title || '',
        authors: parsed.authors || [],
        year: parsed.year || '',
        journal: parsed.journal || '',
        volume: parsed.volume || '',
        issue: parsed.issue || '',
        pages: parsed.pages || '',
        publisher: parsed.publisher || '',
        doi: parsed.doi || '',
        url: parsed.url || '',
        reference_type: parsed.type || 'article',
        tags: formData.tags,
        notes: formData.notes
      })

      setParseText('')
    } catch (error) {
      console.error('解析失敗:', error)
      alert('解析失敗，請檢查文獻格式')
    } finally {
      setParsing(false)
    }
  }

  const addAuthor = () => {
    if (authorInput.last.trim()) {
      setFormData({
        ...formData,
        authors: [...formData.authors, { ...authorInput }]
      })
      setAuthorInput({ last: '', first: '' })
    }
  }

  const removeAuthor = (index) => {
    setFormData({
      ...formData,
      authors: formData.authors.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (reference) {
        await referencesAPI.update(reference.id, formData)
      } else {
        await referencesAPI.create(formData)
      }

      onSave()
    } catch (error) {
      console.error('保存失敗:', error)
      alert('保存失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* 頭部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {reference ? '編輯文獻' : '新增文獻'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* 快速解析 */}
          {!reference && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-blue-600" />
                <h3 className="font-semibold text-blue-900">快速解析</h3>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                貼上完整的文獻引用，系統將自動解析並填入表單
              </p>
              <textarea
                value={parseText}
                onChange={(e) => setParseText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="例如：Smith, J. (2020). Title of Article. Journal Name, 12(3), 45-67. https://doi.org/10.1234/example"
              />
              <button
                type="button"
                onClick={handleParse}
                disabled={parsing || !parseText.trim()}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {parsing ? '解析中...' : '解析文獻'}
              </button>
            </div>
          )}

          <div className="space-y-4">
            {/* 基本資訊 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                標題 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* 作者 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作者
              </label>
              <div className="space-y-2">
                {formData.authors.map((author, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm">
                      {author.last}, {author.first}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="姓"
                    value={authorInput.last}
                    onChange={(e) => setAuthorInput({ ...authorInput, last: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                  <input
                    type="text"
                    placeholder="名（縮寫）"
                    value={authorInput.first}
                    onChange={(e) => setAuthorInput({ ...authorInput, first: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={addAuthor}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                  >
                    新增
                  </button>
                </div>
              </div>
            </div>

            {/* 類型和年份 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  類型
                </label>
                <select
                  value={formData.reference_type}
                  onChange={(e) => setFormData({ ...formData, reference_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="article">期刊文章</option>
                  <option value="book">書籍</option>
                  <option value="website">網站</option>
                  <option value="conference">會議論文</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年份
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="2024"
                />
              </div>
            </div>

            {/* 期刊資訊 */}
            {formData.reference_type === 'article' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    期刊名稱
                  </label>
                  <input
                    type="text"
                    value={formData.journal}
                    onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      卷號
                    </label>
                    <input
                      type="text"
                      value={formData.volume}
                      onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      期號
                    </label>
                    <input
                      type="text"
                      value={formData.issue}
                      onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      頁碼
                    </label>
                    <input
                      type="text"
                      value={formData.pages}
                      onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="123-145"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 出版商（書籍） */}
            {formData.reference_type === 'book' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  出版商
                </label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            {/* DOI 和 URL */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DOI
                </label>
                <input
                  type="text"
                  value={formData.doi}
                  onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="10.1234/example"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* 標籤 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                標籤（逗號分隔）
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="machine learning, deep learning"
              />
            </div>

            {/* 個人筆記 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                個人筆記
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="你對這篇文獻的筆記和想法..."
              />
            </div>
          </div>

          {/* 按鈕 */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReferenceForm
