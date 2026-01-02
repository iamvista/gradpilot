import { useState } from 'react'
import { Trash2, Edit2, Copy, FileText, ExternalLink, Tag, Calendar } from 'lucide-react'
import { referencesAPI } from '../../services/api'

const ReferenceCard = ({ reference, onUpdate, onDelete, onEdit }) => {
  const [copying, setCopying] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('apa')

  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Unknown'

    if (authors.length === 1) {
      const author = authors[0]
      return `${author.last}, ${author.first}.`
    } else if (authors.length === 2) {
      return `${authors[0].last}, ${authors[0].first}. & ${authors[1].last}, ${authors[1].first}.`
    } else {
      return `${authors[0].last}, ${authors[0].first}. et al.`
    }
  }

  const copyFormatted = async (style) => {
    setCopying(true)
    try {
      const response = await referencesAPI.format({
        reference: reference,
        style: style
      })

      await navigator.clipboard.writeText(response.data.formatted)
      setSelectedStyle(style)

      setTimeout(() => setCopying(false), 2000)
    } catch (error) {
      console.error('複製失敗:', error)
      setCopying(false)
    }
  }

  const handleDelete = () => {
    if (window.confirm('確定要刪除這條文獻嗎？')) {
      onDelete(reference.id)
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-700'
      case 'book': return 'bg-green-100 text-green-700'
      case 'website': return 'bg-purple-100 text-purple-700'
      case 'conference': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'article': return '期刊'
      case 'book': return '書籍'
      case 'website': return '網站'
      case 'conference': return '會議'
      default: return '其他'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
      {/* 頭部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(reference.reference_type)}`}>
              {getTypeLabel(reference.reference_type)}
            </span>
            {reference.enriched && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700">
                已補全
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {reference.title}
          </h3>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(reference)}
            className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded transition"
            title="編輯"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
            title="刪除"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* 作者和年份 */}
      <div className="text-gray-700 mb-3">
        <p className="font-medium">{formatAuthors(reference.authors)}</p>
        {reference.year && (
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <Calendar size={14} />
            {reference.year}
          </p>
        )}
      </div>

      {/* 期刊/出版資訊 */}
      {reference.journal && (
        <div className="text-sm text-gray-600 mb-3">
          <span className="italic">{reference.journal}</span>
          {reference.volume && <span>, {reference.volume}</span>}
          {reference.issue && <span>({reference.issue})</span>}
          {reference.pages && <span>, {reference.pages}</span>}
        </div>
      )}

      {/* DOI 和 URL */}
      <div className="space-y-1 mb-3">
        {reference.doi && (
          <a
            href={`https://doi.org/${reference.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <ExternalLink size={14} />
            DOI: {reference.doi}
          </a>
        )}
        {reference.url && !reference.doi && (
          <a
            href={reference.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <ExternalLink size={14} />
            {reference.url.substring(0, 50)}...
          </a>
        )}
      </div>

      {/* 標籤 */}
      {reference.tags && (
        <div className="flex items-center gap-2 mb-3">
          <Tag size={14} className="text-gray-400" />
          <div className="flex flex-wrap gap-1">
            {(typeof reference.tags === 'string' ? reference.tags.split(',') : []).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 個人筆記 */}
      {reference.notes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <FileText size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">{reference.notes}</p>
          </div>
        </div>
      )}

      {/* 引用格式複製按鈕 */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">複製引用：</span>
          <div className="flex gap-2 flex-wrap">
            {['apa', 'mla', 'chicago', 'harvard'].map((style) => (
              <button
                key={style}
                onClick={() => copyFormatted(style)}
                disabled={copying}
                className={`px-3 py-1 rounded text-xs font-medium transition ${
                  copying && selectedStyle === style
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {copying && selectedStyle === style ? (
                  <span className="flex items-center gap-1">
                    <Copy size={12} />
                    已複製
                  </span>
                ) : (
                  style.toUpperCase()
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 元數據 */}
      <div className="text-xs text-gray-400 mt-3 flex gap-4">
        <span>信心度: {(reference.confidence * 100).toFixed(0)}%</span>
        <span>完整度: {(reference.completeness * 100).toFixed(0)}%</span>
        <span>創建: {new Date(reference.created_at).toLocaleDateString('zh-TW')}</span>
      </div>
    </div>
  )
}

export default ReferenceCard
