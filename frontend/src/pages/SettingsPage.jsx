import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Lock, Save, Download, Database } from 'lucide-react'
import { authAPI, exportAPI } from '../services/api'

const SettingsPage = () => {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  // 個人資料表單
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    timezone: '',
    pomodoro_duration: 25,
    break_duration: 5
  })

  // 修改密碼表單
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
        timezone: user.timezone || 'Asia/Taipei',
        pomodoro_duration: user.pomodoro_duration || 25,
        break_duration: user.break_duration || 5
      })
    }
  }, [user])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await authAPI.updateProfile(profileForm)
      updateUser(response.data.user)
      setMessage({ type: 'success', text: '個人資料更新成功！' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || '更新失敗，請稍後再試'
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    // 驗證新密碼
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setMessage({ type: 'error', text: '新密碼與確認密碼不符' })
      return
    }

    if (passwordForm.new_password.length < 6) {
      setMessage({ type: 'error', text: '新密碼至少需要 6 個字元' })
      return
    }

    setLoading(true)

    try {
      await authAPI.changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      })
      setMessage({ type: 'success', text: '密碼修改成功！請重新登入' })
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })

      // 2秒後自動登出
      setTimeout(() => {
        logout()
      }, 2000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || '密碼修改失敗'
      })
    } finally {
      setLoading(false)
    }
  }

  // 導出功能
  const handleExport = async (exportType, format = 'json') => {
    setExporting(true)
    setMessage({ type: '', text: '' })

    try {
      let response
      let filename

      switch (exportType) {
        case 'all':
          response = await exportAPI.exportAll()
          filename = `gradpilot_all_data_${new Date().toISOString().split('T')[0]}.json`
          break
        case 'todos':
          response = await exportAPI.exportTodos(format)
          filename = `gradpilot_todos_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : format === 'md' ? 'md' : 'json'}`
          break
        case 'notes':
          response = await exportAPI.exportNotes(format)
          filename = `gradpilot_notes_${new Date().toISOString().split('T')[0]}.${format === 'md' ? 'md' : 'json'}`
          break
        default:
          return
      }

      // 創建下載鏈接
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      setMessage({ type: 'success', text: '數據導出成功！' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || '導出失敗，請稍後再試'
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 頂部導航欄 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition"
            >
              <ArrowLeft size={20} />
              <span>返回儀表板</span>
            </button>
            <h1 className="text-xl font-bold text-primary">設置</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="space-y-6">
          {/* 個人資料設置 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-primary" size={24} />
              <h2 className="text-xl font-semibold">個人資料</h2>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用戶名
                </label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  郵箱
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  時區
                </label>
                <select
                  value={profileForm.timezone}
                  onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Asia/Taipei">台北 (GMT+8)</option>
                  <option value="Asia/Tokyo">東京 (GMT+9)</option>
                  <option value="America/New_York">紐約 (GMT-5)</option>
                  <option value="Europe/London">倫敦 (GMT+0)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    番茄鐘時長（分鐘）
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={profileForm.pomodoro_duration}
                    onChange={(e) => setProfileForm({ ...profileForm, pomodoro_duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    休息時長（分鐘）
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={profileForm.break_duration}
                    onChange={(e) => setProfileForm({ ...profileForm, break_duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? '保存中...' : '保存更改'}
              </button>
            </form>
          </div>

          {/* 修改密碼 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-primary" size={24} />
              <h2 className="text-xl font-semibold">修改密碼</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  舊密碼
                </label>
                <input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新密碼
                </label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  minLength="6"
                />
                <p className="mt-1 text-sm text-gray-500">至少 6 個字元</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  確認新密碼
                </label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock size={18} />
                {loading ? '修改中...' : '修改密碼'}
              </button>
            </form>
          </div>

          {/* 數據管理 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Database className="text-primary" size={24} />
              <h2 className="text-xl font-semibold">數據管理</h2>
            </div>

            <div className="space-y-4">
              {/* 導出所有數據 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">導出所有數據</h3>
                    <p className="text-sm text-gray-600">
                      導出所有待辦事項、筆記和番茄鐘記錄為 JSON 格式
                    </p>
                  </div>
                  <button
                    onClick={() => handleExport('all')}
                    disabled={exporting}
                    className="ml-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                  >
                    <Download size={16} />
                    {exporting ? '導出中...' : '導出 JSON'}
                  </button>
                </div>
              </div>

              {/* 導出待辦事項 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">導出待辦事項</h3>
                    <p className="text-sm text-gray-600">
                      選擇格式導出所有待辦事項
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('todos', 'json')}
                    disabled={exporting}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download size={16} />
                    JSON
                  </button>
                  <button
                    onClick={() => handleExport('todos', 'csv')}
                    disabled={exporting}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download size={16} />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport('todos', 'md')}
                    disabled={exporting}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download size={16} />
                    Markdown
                  </button>
                </div>
              </div>

              {/* 導出筆記 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">導出筆記</h3>
                    <p className="text-sm text-gray-600">
                      選擇格式導出所有筆記
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('notes', 'json')}
                    disabled={exporting}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download size={16} />
                    JSON
                  </button>
                  <button
                    onClick={() => handleExport('notes', 'md')}
                    disabled={exporting}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download size={16} />
                    Markdown
                  </button>
                </div>
              </div>

              {/* 提示信息 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>提示：</strong>定期備份您的數據可以防止數據遺失。導出的文件可以用於數據遷移或存檔。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage
