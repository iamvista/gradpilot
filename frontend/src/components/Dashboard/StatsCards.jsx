import { CheckCircle2, Circle, Timer, StickyNote } from 'lucide-react'

const StatsCards = ({ stats }) => {
  if (!stats) return null

  const cards = [
    {
      title: '今日完成任務',
      value: stats.todos.today_completed,
      total: stats.todos.pending + stats.todos.completed,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: '待完成任務',
      value: stats.todos.pending,
      subtitle: `完成率 ${stats.todos.completion_rate}%`,
      icon: Circle,
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: '今日專注時間',
      value: `${stats.pomodoro.today.hours} 小時`,
      subtitle: `${stats.pomodoro.today.sessions} 個番茄鐘`,
      icon: Timer,
      color: 'bg-orange-50 text-orange-600',
      borderColor: 'border-orange-200'
    },
    {
      title: '筆記數量',
      value: stats.notes.total,
      subtitle: `${stats.notes.pinned} 個置頂`,
      icon: StickyNote,
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-200'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className={`card border-l-4 ${card.borderColor}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800 mb-1">
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="text-xs text-gray-500">{card.subtitle}</p>
                )}
                {card.total !== undefined && (
                  <p className="text-xs text-gray-500">共 {card.total} 個任務</p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCards
