import { useEffect, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import { AnimatePresence, motion } from 'motion/react'
import { useOS } from '@/hooks/useOS'
import { TitleBar } from './TitleBar'
import { WindowContextMenuProvider } from '@/contexts/WindowContextMenuContext'
import type { WindowState } from '@/types/window'

interface WindowFrameProps {
  window: WindowState
}

export function WindowFrame({ window }: WindowFrameProps) {
  const { focusWindow, updateWindowPosition, updateWindowSize, finalizeCloseWindow, activeWindowId } = useOS()
  const isVisible = window.isOpen && !window.isMinimized
  const [shouldRender, setShouldRender] = useState(isVisible)
  const previousIsMaximizedRef = useRef(window.isMaximized)
  const skipInitial = previousIsMaximizedRef.current !== window.isMaximized
  previousIsMaximizedRef.current = window.isMaximized
  const isActive = activeWindowId === window.id && isVisible

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
    }
  }, [isVisible])

  const handleExitComplete = () => {
    if (!window.isOpen) {
      finalizeCloseWindow(window.id)
      return
    }

    if (window.isMinimized) {
      setShouldRender(false)
    }
  }

  const WindowComponent = window.component

  if (!shouldRender) {
    return null
  }

  const windowBody = (
    <motion.div
      layoutId={`window-${window.id}`}
      initial={
        skipInitial
          ? false
          : {
              opacity: 0,
              scale: window.isMinimized ? 0.95 : 0.98,
              y: window.isMinimized ? 30 : 10,
            }
      }
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        filter: 'blur(0px)',
      }}
      exit={
        window.isMinimized
          ? { opacity: 0, scale: 0.95, y: 30, filter: 'blur(2px)' }
          : { opacity: 0, scale: 0.98, y: 10, filter: 'blur(2px)' }
      }
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      className={`window flex h-full flex-col overflow-hidden ${window.isMaximized ? 'xp-window-maximized' : ''}`}
    >
      <TitleBar window={window} isActive={isActive} />
      <div className="window-body flex-1 overflow-auto">
        <WindowContextMenuProvider>
          <WindowComponent />
        </WindowContextMenuProvider>
      </div>
    </motion.div>
  )

  if (window.isMaximized) {
    return (
      <div
        className="absolute overflow-hidden"
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: window.zIndex,
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
        onMouseDown={() => focusWindow(window.id)}
      >
        <AnimatePresence onExitComplete={handleExitComplete}>
          {isVisible ? windowBody : null}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Rnd
      position={{ x: window.position.x, y: window.position.y }}
      size={{ width: window.size.width, height: window.size.height }}
      bounds=".window-drag-bounds"
      onDragStop={(_e, d) => {
        updateWindowPosition({
          windowId: window.id,
          position: { x: d.x, y: Math.max(0, d.y) },
        })
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        updateWindowSize({
          windowId: window.id,
          size: {
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          },
        })
        updateWindowPosition({
          windowId: window.id,
          position: { x: position.x, y: Math.max(0, position.y) },
        })
      }}
      dragHandleClassName="window-drag-handle"
      minWidth={300}
      minHeight={200}
      style={{ zIndex: window.zIndex, pointerEvents: isVisible ? 'auto' : 'none' }}
      onMouseDown={() => focusWindow(window.id)}
      disableDragging={!isVisible}
      enableResizing={
        isVisible
          ? {
              top: false,
              right: true,
              bottom: true,
              left: false,
              topRight: false,
              bottomRight: true,
              bottomLeft: false,
              topLeft: false,
            }
          : false
      }
    >
      <AnimatePresence onExitComplete={handleExitComplete}>
        {isVisible ? windowBody : null}
      </AnimatePresence>
    </Rnd>
  )
}
