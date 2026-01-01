import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 驗證密碼
    if (formData.password !== formData.confirmPassword) {
      setError('兩次輸入的密碼不一致')
      return
    }

    if (formData.password.length < 6) {
      setError('密碼長度至少 6 個字元')
      return
    }

    setLoading(true)

    const result = await register(formData.username, formData.email, formData.password)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10">
      <div className="max-w-md w-full mx-4">
        <div className="card">
          {/* Logo 和標題 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">建立帳號</h1>
            <p className="text-gray-600">開始你的研究生學習之旅</p>
          </div>

          {/* 註冊表單 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用戶名稱
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="你的名字"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="至少 6 個字元"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                確認密碼
              </label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="再次輸入密碼"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
              {loading ? '註冊中...' : '註冊'}
            </button>
          </form>

          {/* 登入連結 */}
          <div className="mt-6 text-center text-sm text-gray-600">
            已經有帳號？{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              立即登入
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
