import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { WindowState } from '@/types/window'
import { useOS } from '@/hooks/useOS'
import { Clock } from '@/components/topbar/Clock'

interface WindowsLogoProps {
  className?: string
}

function WindowsLogo({ className }: WindowsLogoProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className}>
      <path fill="#F25022" d="M1 2.1 7.2 1v6.2H1V2.1Z" />
      <path fill="#7FBA00" d="M8.2 1 15 0v7.2H8.2V1Z" />
      <path fill="#00A4EF" d="M1 8.2h6.2V15L1 13.9V8.2Z" />
      <path fill="#FFB900" d="M8.2 8.2H15V16l-6.8-1.1V8.2Z" />
    </svg>
  )
}

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
    <footer className="relative z-[2500] flex h-12 w-full shrink-0 items-center gap-2 border-t border-black/25 bg-gradient-to-b from-[#3a7af4] via-[#1e5ed6] to-[#1247ad] px-2 shadow-[0_-1px_0_rgba(255,255,255,0.25)]">
      <div ref={startAreaRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsStartOpen((v) => !v)}
          className="flex h-10 items-center gap-2 rounded-r-full border border-black/35 bg-gradient-to-b from-[#5ad64b] via-[#2ea621] to-[#1a7a15] px-3 pr-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] hover:brightness-[1.03] active:brightness-[0.98]"
        >
          <WindowsLogo className="h-4 w-4" />
          <span className="text-sm font-bold italic tracking-wide drop-shadow-[0_1px_0_rgba(0,0,0,0.55)]">
            start
          </span>
        </button>

        {isStartOpen && (
          <div className="absolute bottom-full left-0 z-[3000] mb-1 w-72 overflow-hidden rounded-tr-lg border border-black/35 bg-[#ece9d8] shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
            <div className="flex h-10 items-center bg-gradient-to-r from-[#2a5bd6] to-[#1b46b3] px-3 text-sm font-bold text-white">
              ahpx-os
            </div>
            <div className="py-1">
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
                    className={`flex w-full items-center px-3 py-1.5 text-left text-sm ${
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

      <div className="flex min-w-0 flex-1 items-center gap-1">
        {taskbarWindows.map((windowState) => {
          const isActive = windowState.id === activeWindowId && !windowState.isMinimized
          return (
            <button
              key={windowState.id}
              type="button"
              onClick={() => handleTaskClick(windowState)}
              className={`flex h-9 min-w-0 flex-1 items-center gap-2 rounded-sm border border-black/35 px-2 text-left text-xs text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] ${
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

      <div className="shrink-0 rounded border border-black/20 bg-white/10 px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
        <Clock variant="taskbar" dropdownPlacement="above" />
      </div>
    </footer>
  )
}

