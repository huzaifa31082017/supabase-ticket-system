'use client'

import { useEffect, useState } from 'react'

interface CountdownState {
  hours: number
  minutes: number
  seconds: number
  isOverdue: boolean
  percentage: number
}

export function useCountdownTimer(slaDeadline: string, initialHoursRemaining: number): CountdownState {
  const [state, setState] = useState<CountdownState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOverdue: false,
    percentage: 100,
  })

  useEffect(() => {
    const calculateCountdown = () => {
      const deadline = new Date(slaDeadline)
      const now = new Date()
      const diffMs = deadline.getTime() - now.getTime()

      // If overdue
      if (diffMs < 0) {
        const absDiffMs = Math.abs(diffMs)
        const totalSeconds = Math.floor(absDiffMs / 1000)
        const overdue_hours = Math.floor(totalSeconds / 3600)
        const overdue_minutes = Math.floor((totalSeconds % 3600) / 60)
        const overdue_seconds = totalSeconds % 60

        setState({
          hours: -overdue_hours,
          minutes: overdue_minutes,
          seconds: overdue_seconds,
          isOverdue: true,
          percentage: 0,
        })
      } else {
        // Still time remaining
        const totalSeconds = Math.floor(diffMs / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        // Calculate percentage (24 hours = 100%)
        const totalHours = Math.floor((24 * 3600 * 1000) / 1000)
        const percentage = Math.min(100, Math.max(0, (totalSeconds / totalHours) * 100))

        setState({
          hours,
          minutes,
          seconds,
          isOverdue: false,
          percentage,
        })
      }
    }

    calculateCountdown()

    // Update every second
    const interval = setInterval(calculateCountdown, 1000)

    return () => clearInterval(interval)
  }, [slaDeadline])

  return state
}
