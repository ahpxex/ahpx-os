import { useRef, useCallback, useState } from 'react'
import type { Position } from '@/types/window'

interface DesktopIconProps {
  id: string
  title: string
  icon: string
  position?: Position
  isSelected?: boolean
  onOpen: () => void
  onPositionChange: (position: Position) => void
}

export function DesktopIcon({
  title,
  icon,
  position,
  isSelected = false,
  onOpen,
  onPositionChange,
}: DesktopIconProps) {
  const [isDragging, setIsDragging] = useState(false)
  const didDragRef = useRef(false)
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
      didDragRef.current = false

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
        const movedEnough = Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5
        if (!isDragging && movedEnough) {
          setIsDragging(true)
        }

        if (isDragging || movedEnough) {
          didDragRef.current = true
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

  const handleClick = useCallback(() => {
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
    onOpen()
  }, [onOpen])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={title}
      className={`
        absolute flex w-20 flex-col items-center gap-1 rounded border border-transparent p-2
        bg-transparent shadow-none select-none
        ${isDragging ? 'cursor-grabbing opacity-80' : 'cursor-grab'}
        ${isSelected ? 'bg-[rgba(0,0,150,0.3)] border-[#000096]' : 'hover:bg-[rgba(0,0,150,0.3)] hover:border-[#000096]'}
      `}
      style={{
        left: position?.x ?? 0,
        top: position?.y ?? 0,
      }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="p-1">
        <img src={icon} alt={title} className="h-12 w-12 pointer-events-none" draggable={false} />
      </div>
      <span
        className="text-xs font-normal text-white pointer-events-none px-1"
        style={{ textShadow: '1px 1px 0px #000000' }}
      >
        {title}
      </span>
    </div>
  )
}
