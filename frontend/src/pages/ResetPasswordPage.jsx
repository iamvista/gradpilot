import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import { authAPI } from '../services/api'
import axios from 'axios'

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    reset_token: '',
    new_password: '',
    confirm_password: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    // 驗證密碼
    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: 'error', text: '新密碼與確認密碼不符' })
      return
    }

    if (formData.new_password.length < 6) {
      setMessage({ type: 'error', text: '密碼至少需要 6 個字符' })
      return
    }

    if (!formData.reset_token.trim()) {
      setMessage({ type: 'error', text: '請輸入重置 Token' })
      return
    }

    setLoading(true)

    try {
      // 使用重置 token 作為 Authorization header
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      await axios.post(
        `${API_URL}/auth/reset-password`,
        { new_password: formData.new_password },
        {
          headers: {
            'Authorization': `Bearer ${formData.reset_token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      setMessage({ type: 'success', text: '密碼重置成功！即將跳轉到登入頁面...' })

      // 2秒後跳轉到登入頁面
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error) {
      if (error.response?.status === 401) {
        setMessage({
          type: 'error',
          text: 'Token 無效或已過期，請重新獲取'
        })
      } else {
        setMessage({
          type: 'error',
          text: error.response?.data?.error || '重置失敗，請稍後再試'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setFormData({ ...formData, reset_token: text })
      setMessage({ type: 'success', text: 'Token 已從剪貼板貼上' })
    } catch (error) {
      setMessage({ type: 'error', text: '無法讀取剪貼板' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 返回連結 */}
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition mb-6"
        >
          <ArrowLeft size={18} />
          <span>返回上一步</span>
        </Link>

        {/* 主卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 圖標 */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Lock className="text-primary" size={32} />
            </div>
          </div>

          {/* 標題 */}
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            重置密碼
          </h1>
          <p className="text-center text-gray-600 mb-8">
            輸入重置 token 和新密碼
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

          {/* 表單 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  重置 Token
                </label>
                <button
                  type="button"
                  onClick={pasteFromClipboard}
                  className="text-sm text-primary hover:underline"
                >
                  從剪貼板貼上
                </button>
              </div>
              <textarea
                value={formData.reset_token}
                onChange={(e) => setFormData({ ...formData, reset_token: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-xs"
                placeholder="貼上從忘記密碼頁面獲得的 token"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新密碼
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={18} />
                </div>
                <input
                  type="password"
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="至少 6 個字符"
                  required
                  minLength="6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                確認新密碼
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={18} />
                </div>
                <input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="再次輸入新密碼"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark transition font-medium disabled:opacity-50"
            >
              {loading ? '重置中...' : '重置密碼'}
            </button>
          </form>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>沒有 token？ <Link to="/forgot-password" className="text-primary hover:underline">獲取重置 Token</Link></p>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
