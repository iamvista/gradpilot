import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(formData.email, formData.password)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/10">
      <div className="max-w-md w-full mx-4">
        <div className="card">
          {/* Logo 和標題 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">GradPilot 2.0</h1>
            <p className="text-gray-600">研究生學習儀表板</p>
          </div>

          {/* 登入表單 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="your-email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  密碼
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  忘記密碼？
                </Link>
              </div>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登入中...' : '登入'}
            </button>
          </form>

          {/* 註冊連結 */}
          <div className="mt-6 text-center text-sm text-gray-600">
            還沒有帳號？{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              立即註冊
            </Link>
          </div>
        </div>

        {/* 測試帳號提示 */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>首次使用？註冊一個新帳號開始使用</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
