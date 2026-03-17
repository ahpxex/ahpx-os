import { useRef, useCallback } from 'react'
import { useLocalAtom } from '@/hooks/useLocalAtom'
import type { Position } from '@/types/window'

interface DesktopIconProps {
  id: string
  title: string
  icon: string
  position?: Position
  isSelected?: boolean
  onSelect: () => void
  onOpen: () => void
  onPositionChange: (position: Position) => void
}

export function DesktopIcon({
  title,
  icon,
  position,
  isSelected = false,
  onSelect,
  onOpen,
  onPositionChange,
}: DesktopIconProps) {
  const [isDragging, setIsDragging] = useLocalAtom(() => false, [])
  const didDragRef = useRef(false)
  const dragRef = useRef<{
    startX: number
    startY: number
    initialX: number
    initialY: number
    active: boolean
  } | null>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      didDragRef.current = false

      const currentX = position?.x ?? 0
      const currentY = position?.y ?? 0

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialX: currentX,
        initialY: currentY,
        active: false,
      }

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragRef.current) return

        const deltaX = moveEvent.clientX - dragRef.current.startX
        const deltaY = moveEvent.clientY - dragRef.current.startY
        const movedEnough = Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5

        if (!dragRef.current.active && movedEnough) {
          dragRef.current.active = true
          setIsDragging(true)
        }

        if (dragRef.current.active || movedEnough) {
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
    [position, onPositionChange, setIsDragging]
  )

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (didDragRef.current) {
        didDragRef.current = false
        return
      }
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
      className={`
        absolute flex w-[72px] flex-col items-center gap-0.5 rounded p-1.5
        bg-transparent shadow-none select-none cursor-default
        ${isDragging ? 'opacity-80' : ''}
      `}
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
      onMouseDown={handleMouseDown}
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
