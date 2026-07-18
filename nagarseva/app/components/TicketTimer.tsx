'use client'

import { useCountdownTimer } from '@/app/hooks/useCountdownTimer'
import { Clock, AlertCircle } from 'lucide-react'

interface TicketTimerProps {
  slaDeadline: string
}

export default function TicketTimer({ slaDeadline }: TicketTimerProps) {
  const timer = useCountdownTimer(slaDeadline, 0)

  const getTimeColor = () => {
    if (timer.isOverdue) return 'text-red-500'
    if (timer.hours <= 24) return 'text-amber-500'
    return 'text-emerald-500'
  }

  const getTimeBg = () => {
    if (timer.isOverdue) return 'bg-red-500/10 border-red-500/30'
    if (timer.hours <= 24) return 'bg-amber-500/10 border-amber-500/30'
    return 'bg-emerald-500/10 border-emerald-500/30'
  }

  const timeDisplay =
    timer.hours < 0
      ? `- ${Math.abs(timer.hours)}h ${timer.minutes}m overdue`
      : `${timer.hours}h ${timer.minutes}m remaining`

  return (
    <div className={`${getTimeBg()} border rounded-lg px-4 py-3 flex items-center gap-3 flex-1`}>
      <Clock className={`w-5 h-5 ${getTimeColor()} flex-shrink-0`} />
      <div>
        <p className={`${getTimeColor()} text-sm font-semibold`}>{timeDisplay}</p>
        {timer.hours <= 24 && !timer.isOverdue && (
          <div className="flex items-center gap-1 mt-1">
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full font-semibold">
              🔔 Nudge Sent
            </span>
          </div>
        )}
        {timer.isOverdue && (
          <div className="flex items-center gap-1 mt-1">
            <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full font-semibold">
              🚨 Escalated to Commissioner
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
