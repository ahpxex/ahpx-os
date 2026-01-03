import { useRef, useCallback, useState } from 'react'
import { useOS } from '@/hooks/useOS'
import { TitleBar } from './TitleBar'
import type { WindowState } from '@/types/window'

interface WindowFrameProps {
  window: WindowState
}

export function WindowFrame({ window }: WindowFrameProps) {
  const { focusWindow, updateWindowPosition } = useOS()
  const frameRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const handleMouseDown = useCallback(() => {
    focusWindow(window.id)
  }, [focusWindow, window.id])

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (window.isMaximized) return

      setIsDragging(true)
      dragStart.current = {
        x: e.clientX - window.position.x,
        y: e.clientY - window.position.y,
      }

      const handleMouseMove = (e: MouseEvent) => {
        updateWindowPosition({
          windowId: window.id,
          position: {
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y,
          },
        })
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [window.id, window.position, window.isMaximized, updateWindowPosition]
  )

  if (!window.isOpen || window.isMinimized) {
    return null
  }

  const WindowComponent = window.component

  const frameStyle = window.isMaximized
    ? { top: 0, left: 0, right: 0, bottom: 0, width: 'auto', height: 'auto' }
    : {
        top: window.position.y,
        left: window.position.x,
        width: window.size.width,
        height: window.size.height,
      }

  return (
    <div
      ref={frameRef}
      className={`
        absolute flex flex-col
        border-2 border-black bg-white
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        ${isDragging ? 'cursor-grabbing' : ''}
      `}
      style={{
        ...frameStyle,
        zIndex: window.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      <TitleBar window={window} onDragStart={handleDragStart} />
      <div className="flex-1 overflow-auto p-4">
        <WindowComponent />
      </div>
    </div>
  )
}
