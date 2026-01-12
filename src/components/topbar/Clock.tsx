import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface ClockProps {
  variant?: 'topbar' | 'taskbar'
}

export function Clock({ variant = 'topbar' }: ClockProps) {
  const [time, setTime] = useState(new Date())
  const isTaskbar = variant === 'taskbar'

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <span
      className={
        isTaskbar ? 'text-xs font-medium text-white tabular-nums' : 'text-sm font-medium'
      }
      title={format(time, 'EEE MMM d  h:mm a')}
    >
      {format(time, isTaskbar ? 'h:mm a' : 'EEE MMM d  h:mm a')}
    </span>
  )
}
