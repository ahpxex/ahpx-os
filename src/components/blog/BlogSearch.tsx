import { useEffect } from 'react'
import { useLocalAtom } from '@/hooks/useLocalAtom'

interface BlogSearchProps {
  value: string
  onChange: (value: string) => void
}

export function BlogSearch({ value, onChange }: BlogSearchProps) {
  const [localValue, setLocalValue] = useLocalAtom(() => value, [value])

  useEffect(() => {
    if (localValue === value) return

    const timer = window.setTimeout(() => {
      onChange(localValue)
    }, 300)

    return () => {
      window.clearTimeout(timer)
    }
  }, [localValue, onChange, value])

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder="Search posts..."
      className="w-48 border border-[var(--color-border)] bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
    />
  )
}
