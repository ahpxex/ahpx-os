import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { Calendar } from './Calendar'

export function Clock() {
  const [time, setTime] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const clockRef = useRef<HTMLDivElement>(null)

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
        className={`text-sm font-medium hover:bg-[var(--color-primary-bg)] px-2 py-1 ${
          showCalendar ? 'bg-[var(--color-primary-bg)]' : ''
        }`}
      >
        {format(time, 'EEE MMM d  h:mm a')}
      </button>

      {showCalendar && (
        <div className="absolute right-0 top-full z-[2000] mt-1">
          <Calendar selectedDate={time} />
        </div>
      )}
    </div>
  )
}
