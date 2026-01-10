import { useOS } from '@/hooks/useOS'
import type { WindowState } from '@/types/window'

interface TitleBarProps {
  window: WindowState
  isActive?: boolean
}

export function TitleBar({ window, isActive = true }: TitleBarProps) {
  const { closeWindow, minimizeWindow, toggleMaximizeWindow } = useOS()

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    closeWindow(window.id)
  }

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation()
    minimizeWindow(window.id)
  }

  const handleMaximizeRestore = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleMaximizeWindow(window.id)
  }

  return (
    <div className={`title-bar window-drag-handle ${isActive ? '' : 'xp-title-bar-inactive'}`}>
      <div className="title-bar-text">
        <div className="flex items-center gap-2">
          <img src={window.icon} alt="" className="h-4 w-4" draggable={false} />
          <span className="truncate">{window.title}</span>
        </div>
      </div>
      <div className="title-bar-controls" onMouseDown={(e) => e.stopPropagation()}>
        <button type="button" aria-label="Minimize" onClick={handleMinimize} />
        <button
          type="button"
          aria-label={window.isMaximized ? 'Restore' : 'Maximize'}
          onClick={handleMaximizeRestore}
        />
        <button type="button" aria-label="Close" onClick={handleClose} />
      </div>
    </div>
  )
}
