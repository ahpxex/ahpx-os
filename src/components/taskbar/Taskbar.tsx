import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { WindowState } from '@/types/window'
import { useOS } from '@/hooks/useOS'
import { Clock } from '@/components/topbar/Clock'
import { StartButton } from './StartButton'

interface StartMenuItem {
  label: string
  onClick?: () => void
  disabled?: boolean
  divider?: boolean
}

export function Taskbar() {
  const { windows, activeWindowId, openWindow, focusWindow, minimizeWindow } = useOS()
  const [isStartOpen, setIsStartOpen] = useState(false)
  const startAreaRef = useRef<HTMLDivElement>(null)

  const taskbarWindows = useMemo(() => windows.filter((w) => w.isOpen), [windows])

  const startMenuItems: StartMenuItem[] = useMemo(
    () => [
      { label: 'About ahpx-os', onClick: () => console.log('About') },
      { divider: true, label: '' },
      { label: 'Show Desktop', onClick: () => taskbarWindows.forEach((w) => minimizeWindow(w.id)) },
      { divider: true, label: '' },
      { label: 'Restart', onClick: () => window.location.reload() },
      { label: 'Shut Down', disabled: true },
    ],
    [minimizeWindow, taskbarWindows]
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startAreaRef.current && !startAreaRef.current.contains(event.target as Node)) {
        setIsStartOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsStartOpen(false)
      }
    }

    if (isStartOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isStartOpen])

  const handleTaskClick = useCallback(
    (windowState: WindowState) => {
      if (!windowState.isOpen || windowState.isMinimized) {
        openWindow({
          id: windowState.id,
          title: windowState.title,
          icon: windowState.icon,
          component: windowState.component,
          initialPosition: windowState.position,
          initialSize: windowState.size,
        })
        return
      }

      if (windowState.id === activeWindowId) {
        minimizeWindow(windowState.id)
        return
      }

      focusWindow(windowState.id)
    },
    [activeWindowId, focusWindow, minimizeWindow, openWindow]
  )

  return (
    <footer className="xp-taskbar xp-taskbar-luna relative z-[2500] flex h-[30px] w-full shrink-0 items-stretch border-t border-black/25 px-0 shadow-[0_-1px_0_rgba(255,255,255,0.25)]">
      <div ref={startAreaRef} className="xp-taskbar-start-area relative h-full shrink-0 pr-[18px]">
        <StartButton isOpen={isStartOpen} onClick={() => setIsStartOpen((v) => !v)} />

        {isStartOpen && (
          <div className="window absolute bottom-full left-0 z-[3000] mb-1 w-72">
            <div className="title-bar">
              <div className="title-bar-text">ahpx-os</div>
            </div>
            <div className="window-body">
              {startMenuItems.map((item, index) =>
                item.divider ? (
                  <div key={index} className="my-1 h-px bg-black/10" />
                ) : (
                  <button
                    key={index}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => {
                      if (item.disabled) return
                      item.onClick?.()
                      setIsStartOpen(false)
                    }}
                    className={`xp-reset-button bg-none min-h-0 min-w-0 border-0 bg-transparent shadow-none flex w-full items-center px-3 py-1.5 text-left text-sm ${
                      item.disabled
                        ? 'cursor-not-allowed text-black/40'
                        : 'hover:bg-[#2a5bd6] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 items-stretch gap-1 px-1">
        {taskbarWindows.map((windowState) => {
          const isActive = windowState.id === activeWindowId && !windowState.isMinimized
          return (
            <button
              key={windowState.id}
              type="button"
              onClick={() => handleTaskClick(windowState)}
              className={`xp-reset-button bg-none min-h-0 min-w-0 my-[2px] border border-black/35 flex h-[26px] flex-1 items-center gap-2 rounded-sm px-2 text-left text-xs text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] active:!shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] ${
                isActive
                  ? 'bg-white/25'
                  : windowState.isMinimized
                    ? 'bg-white/10 opacity-90'
                    : 'bg-white/15 hover:bg-white/20'
              }`}
              title={windowState.title}
            >
              <img
                src={windowState.icon}
                alt=""
                className="h-4 w-4 shrink-0"
                draggable={false}
              />
              <span className="min-w-0 flex-1 truncate font-medium">
                {windowState.title}
              </span>
            </button>
          )
        })}
      </div>

      <div className="shrink-0">
        <div className="xp-tray-inset flex h-[26px] items-center gap-1 rounded-md px-2">
          <img
            src="/notifications/notification-network-wireless.png"
            alt=""
            className="h-4 w-4"
            draggable={false}
          />
          <img
            src="/status/audio-volume-medium.png"
            alt=""
            className="h-4 w-4"
            draggable={false}
          />
          <div className="mx-1 h-4 w-px bg-white/25" />
          <Clock variant="taskbar" />
        </div>
      </div>
    </footer>
  )
}
