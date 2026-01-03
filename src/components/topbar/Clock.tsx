import { useState, useEffect } from 'react'
import { format } from 'date-fns'

export function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <time className="text-sm font-medium">
      {format(time, 'EEE MMM d  h:mm a')}
    </time>
  )
}
