import { useState, useEffect } from 'react'
import { format } from 'date-fns'

export function ClockApp() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-black p-8 text-white">
      <div className="text-6xl font-bold tabular-nums tracking-wider">
        {format(time, 'HH:mm:ss')}
      </div>
      <div className="text-xl text-gray-400">
        {format(time, 'EEEE, MMMM do, yyyy')}
      </div>
      <div className="mt-4 flex gap-8 text-sm text-gray-500">
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--color-primary)]">
            {format(time, 'HH')}
          </div>
          <div>Hours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--color-primary)]">
            {format(time, 'mm')}
          </div>
          <div>Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--color-primary)]">
            {format(time, 'ss')}
          </div>
          <div>Seconds</div>
        </div>
      </div>
    </div>
  )
}
