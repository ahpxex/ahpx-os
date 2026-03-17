import { format } from 'date-fns'
import { useCurrentTime } from '@/hooks/useCurrentTime'

interface ClockProps {
  variant?: 'topbar' | 'taskbar'
}

export function Clock({ variant = 'topbar' }: ClockProps) {
  const time = useCurrentTime(1000)
  const isTaskbar = variant === 'taskbar'

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
