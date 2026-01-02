import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react'
import { pomodoroAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const PomodoroTimer = ({ onSessionComplete }) => {
  const { user } = useAuth()
  const pomodoroDuration = user?.pomodoro_duration || 25
  const breakDuration = user?.break_duration || 5

  const [minutes, setMinutes] = useState(pomodoroDuration)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionType, setSessionType] = useState('focus') // focus or break
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)

  // 當用戶設置改變時更新時長
  useEffect(() => {
    if (!isRunning) {
      setMinutes(isBreak ? breakDuration : pomodoroDuration)
    }
  }, [user?.pomodoro_duration, user?.break_duration, isBreak, isRunning])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // 計時結束
            handleComplete()
          } else {
            setMinutes(minutes - 1)
            setSeconds(59)
          }
        } else {
          setSeconds(seconds - 1)
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, minutes, seconds])

  const handleStart = () => {
    setIsRunning(true)
    startTimeRef.current = new Date()
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setMinutes(isBreak ? breakDuration : pomodoroDuration)
    setSeconds(0)
  }

  const handleComplete = async () => {
    setIsRunning(false)

    // 播放提示音（可選）
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi57OmfTRAMUKzn77ZhGwU7k9r0y3ksBS15yO/dkEAJFWCz6OuoVRQKRp/g8r5sIQUrg8') // 簡單的提示音
      audio.volume = 0.3
      await audio.play()
    } catch (error) {
      console.log('無法播放提示音')
    }

    // 記錄到後端
    try {
      const duration = isBreak ? breakDuration : pomodoroDuration
      await pomodoroAPI.createSession({
        duration,
        session_type: isBreak ? 'break' : 'focus',
        completed: true,
        started_at: startTimeRef.current?.toISOString(),
        ended_at: new Date().toISOString()
      })

      onSessionComplete?.()
    } catch (error) {
      console.error('記錄番茄鐘失敗:', error)
    }

    // 切換模式
    if (isBreak) {
      setIsBreak(false)
      setSessionType('focus')
      setMinutes(pomodoroDuration)
      alert('休息結束！準備開始新的番茄鐘 🍅')
    } else {
      setIsBreak(true)
      setSessionType('break')
      setMinutes(breakDuration)
      alert('專注時間結束！該休息一下了 ☕')
    }
    setSeconds(0)
  }

  const formatTime = (m, s) => {
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const totalDuration = isBreak ? breakDuration : pomodoroDuration
  const progress = (totalDuration * 60 - (minutes * 60 + seconds)) / (totalDuration * 60) * 100

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">番茄鐘</h2>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isBreak
            ? 'bg-green-100 text-green-700'
            : 'bg-orange-100 text-orange-700'
        }`}>
          {isBreak ? '休息時間' : '專注時間'}
        </div>
      </div>

      {/* 計時器顯示 */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          {/* 進度圓環 */}
          <svg className="transform -rotate-90" width="200" height="200">
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke={isBreak ? '#10b981' : '#f97316'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>

          {/* 時間文字 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-gray-800 font-mono">
              {formatTime(minutes, seconds)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {isBreak ? <Coffee size={20} className="mx-auto" /> : '🍅'}
            </div>
          </div>
        </div>
      </div>

      {/* 控制按鈕 */}
      <div className="flex gap-3 justify-center">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="btn-primary flex items-center gap-2 px-6"
          >
            <Play size={18} />
            <span>開始</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="btn-secondary flex items-center gap-2 px-6"
          >
            <Pause size={18} />
            <span>暫停</span>
          </button>
        )}
        <button
          onClick={handleReset}
          className="btn-outline flex items-center gap-2 px-6"
        >
          <RotateCcw size={18} />
          <span>重置</span>
        </button>
      </div>

      {/* 提示 */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          💡 保持專注 {pomodoroDuration} 分鐘，然後休息 {breakDuration} 分鐘
        </p>
      </div>
    </div>
  )
}

export default PomodoroTimer
