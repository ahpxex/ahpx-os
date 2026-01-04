import { useState, useEffect } from 'react'

interface BlogSearchProps {
  value: string
  onChange: (value: string) => void
}

export function BlogSearch({ value, onChange }: BlogSearchProps) {
  const [localValue, setLocalValue] = useState(value)

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [localValue, onChange])

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

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
