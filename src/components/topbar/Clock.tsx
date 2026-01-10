import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { Calendar } from './Calendar'

interface ClockProps {
  variant?: 'topbar' | 'taskbar'
  dropdownPlacement?: 'below' | 'above'
}

export function Clock({ variant = 'topbar', dropdownPlacement = 'below' }: ClockProps) {
  const [time, setTime] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const clockRef = useRef<HTMLDivElement>(null)
  const isTaskbar = variant === 'taskbar'

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (clockRef.current && !clockRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCalendar])

  return (
    <div ref={clockRef} className="relative">
      <button
        onClick={() => setShowCalendar(!showCalendar)}
        className={
          isTaskbar
            ? `min-h-0 min-w-0 border-0 bg-transparent shadow-none rounded px-2 py-1 text-xs font-medium text-white hover:bg-white/10 ${showCalendar ? 'bg-white/10' : ''}`
            : `text-sm font-medium hover:bg-[var(--color-primary-bg)] px-2 py-1 ${showCalendar ? 'bg-[var(--color-primary-bg)]' : ''}`
        }
        title={format(time, 'EEE MMM d  h:mm a')}
      >
        {format(time, isTaskbar ? 'h:mm a' : 'EEE MMM d  h:mm a')}
      </button>

      {showCalendar && (
        <div
          className={
            dropdownPlacement === 'above'
              ? 'absolute bottom-full right-0 z-[2000] mb-1'
              : 'absolute right-0 top-full z-[2000] mt-1'
          }
        >
          <Calendar selectedDate={time} />
        </div>
      )}
    </div>
  )
}
