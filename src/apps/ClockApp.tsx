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

  const year = time.getFullYear()
  const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0)
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999)

  const totalYearMs = endOfYear.getTime() - startOfYear.getTime()
  const elapsedMs = time.getTime() - startOfYear.getTime()
  const remainingMs = endOfYear.getTime() - time.getTime()

  const yearProgress = (elapsedMs / totalYearMs) * 100
  const secondsRemaining = Math.floor(remainingMs / 1000)

  const formatLargeNumber = (num: number) => {
    return num.toLocaleString('en-US')
  }

  const days = Math.floor(secondsRemaining / 86400)
  const hours = Math.floor((secondsRemaining % 86400) / 3600)
  const minutes = Math.floor((secondsRemaining % 3600) / 60)
  const seconds = secondsRemaining % 60

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 bg-white p-8">
      <div className="text-center">
        <div className="text-xl text-gray-600 mb-2">Year {year} Progress</div>
        <div className="text-5xl font-bold tabular-nums tracking-wider text-[var(--color-primary)]">
          {yearProgress.toFixed(6)}%
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="h-4 w-full border border-[var(--color-primary)] bg-gray-100">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-1000"
            style={{ width: `${yearProgress}%` }}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8 text-center">
        <div className="text-xl text-gray-600 mb-4">Time Remaining in {year}</div>

        <div className="text-6xl font-bold tabular-nums tracking-wider mb-4 text-gray-900">
          {formatLargeNumber(secondsRemaining)}
        </div>
        <div className="text-sm text-gray-500 mb-6">seconds</div>

        <div className="flex gap-6 justify-center text-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--color-primary)]">
              {days}
            </div>
            <div className="text-gray-600">Days</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--color-primary)]">
              {hours}
            </div>
            <div className="text-gray-600">Hours</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--color-primary)]">
              {minutes}
            </div>
            <div className="text-gray-600">Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--color-primary)]">
              {seconds}
            </div>
            <div className="text-gray-600">Seconds</div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        {format(time, 'EEEE, MMMM do, yyyy - h:mm:ss a')}
      </div>
    </div>
  )
}
