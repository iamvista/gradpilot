import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Key } from 'lucide-react'
import { authAPI } from '../services/api'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await authAPI.forgotPassword({ email })

      // 顯示重置 token
      setResetToken(response.data.reset_token)
      setMessage({
        type: 'success',
        text: '重置 token 已生成！請複製下方的 token 並前往重置密碼頁面。'
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || '請求失敗，請稍後再試'
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resetToken)
    setMessage({
      type: 'success',
      text: 'Token 已複製到剪貼板！'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 返回登入連結 */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition mb-6"
        >
          <ArrowLeft size={18} />
          <span>返回登入</span>
        </Link>

        {/* 主卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 圖標 */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Key className="text-primary" size={32} />
            </div>
          </div>

          {/* 標題 */}
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            忘記密碼
          </h1>
          <p className="text-center text-gray-600 mb-8">
            輸入您的郵箱地址，我們將為您生成重置 token
          </p>

          {/* 消息提示 */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {!resetToken ? (
            /* 郵箱輸入表單 */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  郵箱地址
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark transition font-medium disabled:opacity-50"
              >
                {loading ? '處理中...' : '獲取重置 Token'}
              </button>
            </form>
          ) : (
            /* Token 顯示區域 */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  重置 Token（有效期 15 分鐘）
                </label>
                <div className="relative">
                  <textarea
                    value={resetToken}
                    readOnly
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs"
                  />
                </div>
              </div>

              <button
                onClick={copyToClipboard}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition font-medium"
              >
                複製 Token
              </button>

              <Link
                to="/reset-password"
                className="block w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark transition font-medium text-center"
              >
                前往重置密碼
              </Link>

              <button
                onClick={() => {
                  setResetToken('')
                  setEmail('')
                  setMessage({ type: '', text: '' })
                }}
                className="w-full text-gray-600 hover:text-primary transition text-sm"
              >
                重新請求
              </button>
            </div>
          )}
        </div>

        {/* 提示信息 */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>記得密碼了？ <Link to="/login" className="text-primary hover:underline">立即登入</Link></p>
        </div>

        {/* 安全提示 */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>提示：</strong>重置 token 有效期為 15 分鐘。請妥善保管並及時使用。
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
