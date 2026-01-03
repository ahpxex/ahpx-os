import { useState } from 'react'

interface DesktopIconProps {
  id: string
  title: string
  icon: string
  onDoubleClick: () => void
}

export function DesktopIcon({ title, icon, onDoubleClick }: DesktopIconProps) {
  const [isSelected, setIsSelected] = useState(false)

  return (
    <button
      className={`
        flex w-20 flex-col items-center gap-1 rounded p-2
        transition-colors
        ${isSelected ? 'bg-[var(--color-primary)]/20' : 'hover:bg-black/5'}
      `}
      onClick={() => setIsSelected(true)}
      onDoubleClick={onDoubleClick}
      onBlur={() => setIsSelected(false)}
    >
      <img src={icon} alt={title} className="h-12 w-12" />
      <span className="text-xs font-medium text-black">{title}</span>
    </button>
  )
}
