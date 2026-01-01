import { useState, useEffect } from 'react'
import { Clock as ClockIcon, Sun, Moon, Coffee } from 'lucide-react'

const Clock = ({ username }) => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = time.getHours()
    if (hour < 6) return { text: '夜深了', icon: Moon, color: 'text-indigo-600' }
    if (hour < 12) return { text: '早安', icon: Sun, color: 'text-yellow-600' }
    if (hour < 18) return { text: '午安', icon: Coffee, color: 'text-orange-600' }
    return { text: '晚安', icon: Moon, color: 'text-indigo-600' }
  }

  const greeting = getGreeting()
  const GreetingIcon = greeting.icon

  const formatDate = (date) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }
    return date.toLocaleDateString('zh-TW', options)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="card mb-8">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <GreetingIcon className={`${greeting.color}`} size={32} />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {greeting.text}，{username}！
              </h2>
              <p className="text-gray-600">{formatDate(time)}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-1">
            <ClockIcon size={20} className="text-gray-400" />
            <span className="text-sm text-gray-500">現在時間</span>
          </div>
          <div className="text-4xl font-bold text-primary font-mono">
            {formatTime(time)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Clock
