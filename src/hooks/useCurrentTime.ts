import { useEffect } from 'react'
import { useLocalAtom } from './useLocalAtom'

export function useCurrentTime(intervalMs = 1000) {
  const [time, setTime] = useLocalAtom(() => new Date(), [intervalMs])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTime(new Date())
    }, intervalMs)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [intervalMs, setTime])

  return time
}
