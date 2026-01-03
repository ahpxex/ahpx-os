import { Rnd } from 'react-rnd'
import { useOS } from '@/hooks/useOS'
import { TitleBar } from './TitleBar'
import type { WindowState } from '@/types/window'

interface WindowFrameProps {
  window: WindowState
}

export function WindowFrame({ window }: WindowFrameProps) {
  const { focusWindow, updateWindowPosition, updateWindowSize } = useOS()

  if (!window.isOpen || window.isMinimized) {
    return null
  }

  const WindowComponent = window.component

  if (window.isMaximized) {
    return (
      <div
        className="absolute flex flex-col border border-[var(--color-border)] bg-white overflow-hidden"
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: window.zIndex,
        }}
        onMouseDown={() => focusWindow(window.id)}
      >
        <TitleBar window={window} />
        <div className="flex-1 overflow-auto">
          <WindowComponent />
        </div>
      </div>
    )
  }

  return (
    <Rnd
      position={{ x: window.position.x, y: window.position.y }}
      size={{ width: window.size.width, height: window.size.height }}
      onDragStop={(e, d) => {
        updateWindowPosition({
          windowId: window.id,
          position: { x: d.x, y: d.y },
        })
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        updateWindowSize({
          windowId: window.id,
          size: {
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          },
        })
        updateWindowPosition({
          windowId: window.id,
          position,
        })
      }}
      dragHandleClassName="window-drag-handle"
      minWidth={300}
      minHeight={200}
      bounds="parent"
      style={{ zIndex: window.zIndex }}
      onMouseDown={() => focusWindow(window.id)}
      enableResizing={{
        top: false,
        right: true,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: true,
        bottomLeft: false,
        topLeft: false,
      }}
    >
      <div className="flex h-full flex-col border border-[var(--color-border)] bg-white rounded-lg overflow-hidden">
        <TitleBar window={window} />
        <div className="flex-1 overflow-auto">
          <WindowComponent />
        </div>
      </div>
    </Rnd>
  )
}
