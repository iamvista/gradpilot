import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, Settings, Search, BookOpen } from 'lucide-react'
import Clock from '../components/Dashboard/Clock'
import StatsCards from '../components/Dashboard/StatsCards'
import TodoList from '../components/Todo/TodoList'
import PomodoroTimer from '../components/Pomodoro/PomodoroTimer'
import NotesList from '../components/Notes/NotesList'
import SearchModal from '../components/SearchModal'
import { dashboardAPI } from '../services/api'

const DashboardPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('獲取統計數據失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // 每 30 秒更新一次統計
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  // 鍵盤快捷鍵：Ctrl/Cmd + K 打開搜索
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogout = () => {
    if (window.confirm('確定要登出嗎？')) {
      logout()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 頂部導航欄 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">GradPilot 2.0</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                歡迎，<span className="font-semibold text-primary">{user?.username}</span>
              </span>
              <button
                onClick={() => navigate('/references')}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition"
                title="文獻管理"
              >
                <BookOpen size={18} />
                <span className="text-sm">文獻</span>
              </button>
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition"
                title="搜索 (Ctrl/Cmd + K)"
              >
                <Search size={18} />
                <span className="text-sm">搜索</span>
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition"
                title="設置"
              >
                <Settings size={18} />
                <span className="text-sm">設置</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition"
              >
                <LogOut size={18} />
                <span className="text-sm">登出</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容區 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 時鐘和問候 */}
        <Clock username={user?.username} />

        {/* 統計卡片 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <StatsCards stats={stats} />
        )}

        {/* 主要功能區 - 三欄布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* 左欄：番茄鐘 */}
          <div className="lg:col-span-1">
            <PomodoroTimer onSessionComplete={fetchStats} />
          </div>

          {/* 中欄：待辦清單 */}
          <div className="lg:col-span-1">
            <TodoList onUpdate={fetchStats} />
          </div>

          {/* 右欄：筆記 */}
          <div className="lg:col-span-1">
            <NotesList />
          </div>
        </div>
      </main>

      {/* 搜索 Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

export default DashboardPage
