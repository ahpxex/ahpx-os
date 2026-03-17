import { useCallback } from 'react'
import type { Position } from '@/types/window'

interface DesktopIconProps {
  title: string
  icon: string
  position?: Position
  isSelected?: boolean
  onSelect: () => void
  onOpen: () => void
}

export function DesktopIcon({
  title,
  icon,
  position,
  isSelected = false,
  onSelect,
  onOpen,
}: DesktopIconProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect()
    },
    [onSelect]
  )

  const handleDoubleClick = useCallback(() => {
    onOpen()
  }, [onOpen])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={title}
      className="absolute flex w-[72px] cursor-default select-none flex-col items-center gap-0.5 rounded bg-transparent p-1.5 shadow-none"
      style={{
        left: position?.x ?? 0,
        top: position?.y ?? 0,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
    >
      <div className={isSelected ? 'p-0.5 xp-icon-selected' : 'p-0.5'}>
        <img src={icon} alt={title} className="h-10 w-10 pointer-events-none" draggable={false} />
      </div>
      <span
        className={`pointer-events-none px-[2px] leading-tight text-center
          ${isSelected ? 'bg-[#2b60f6] text-white' : 'text-white'}
        `}
        style={{
          fontFamily: 'Tahoma, Verdana, sans-serif',
          fontSize: '10px',
          textShadow: isSelected ? 'none' : '1px 1px 1px rgba(0,0,0,0.8)',
        }}
      >
        {title}
      </span>
    </div>
  )
}
