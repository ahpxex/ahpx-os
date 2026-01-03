import { useRef, useCallback, useState } from 'react'
import type { Position } from '@/types/window'

interface DesktopIconProps {
  id: string
  title: string
  icon: string
  position?: Position
  isSelected?: boolean
  onDoubleClick: () => void
  onPositionChange: (position: Position) => void
}

export function DesktopIcon({
  title,
  icon,
  position,
  isSelected = false,
  onDoubleClick,
  onPositionChange,
}: DesktopIconProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{
    startX: number
    startY: number
    initialX: number
    initialY: number
  } | null>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return // Only left click
      e.preventDefault()

      const currentX = position?.x ?? 0
      const currentY = position?.y ?? 0

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialX: currentX,
        initialY: currentY,
      }

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragRef.current) return

        const deltaX = moveEvent.clientX - dragRef.current.startX
        const deltaY = moveEvent.clientY - dragRef.current.startY

        // Only start dragging after moving 5px to prevent accidental drags
        if (!isDragging && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
          setIsDragging(true)
        }

        if (isDragging || Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
          const newX = Math.max(0, dragRef.current.initialX + deltaX)
          const newY = Math.max(0, dragRef.current.initialY + deltaY)
          onPositionChange({ x: newX, y: newY })
        }
      }

      const handleMouseUp = () => {
        dragRef.current = null
        setIsDragging(false)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [position, isDragging, onPositionChange]
  )

  const handleDoubleClick = useCallback(() => {
    if (!isDragging) {
      onDoubleClick()
    }
  }, [isDragging, onDoubleClick])

  return (
    <button
      className={`
        absolute flex w-20 flex-col items-center gap-1 rounded p-2
        transition-colors select-none
        ${isDragging ? 'cursor-grabbing opacity-80' : 'cursor-grab'}
        ${isSelected ? 'bg-[var(--color-primary)]/20' : 'hover:bg-black/5'}
      `}
      style={{
        left: position?.x ?? 0,
        top: position?.y ?? 0,
      }}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      <img src={icon} alt={title} className="h-12 w-12 pointer-events-none" draggable={false} />
      <span className="text-xs font-medium text-black pointer-events-none">{title}</span>
    </button>
  )
}
