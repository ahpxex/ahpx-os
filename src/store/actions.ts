import { atom } from 'jotai'
import { windowsAtom, activeWindowIdAtom, maxZIndexAtom } from './atoms'
import type { WindowState, WindowConfig, Position, Size } from '@/types/window'
import { getWindowPosition, saveWindowPosition } from './windowCache'

export const openWindowAtom = atom(
  null,
  (get, set, config: WindowConfig) => {
    const windows = get(windowsAtom)
    const existing = windows.find((w) => w.id === config.id)

    if (existing) {
      set(focusWindowAtom, config.id)
      if (existing.isMinimized) {
        set(
          windowsAtom,
          windows.map((w) =>
            w.id === config.id ? { ...w, isMinimized: false } : w
          )
        )
      }
      return
    }

    const maxZ = get(maxZIndexAtom)
    const cached = getWindowPosition(config.id)

    const newWindow: WindowState = {
      id: config.id,
      title: config.title,
      icon: config.icon,
      component: config.component,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: maxZ + 1,
      position: cached?.position ?? config.initialPosition ?? { x: 100, y: 100 },
      size: cached?.size ?? config.initialSize ?? { width: 600, height: 400 },
    }

    set(windowsAtom, [...windows, newWindow])
    set(activeWindowIdAtom, config.id)
  }
)

export const closeWindowAtom = atom(null, (get, set, windowId: string) => {
  const windows = get(windowsAtom)
  const window = windows.find((w) => w.id === windowId)

  if (window) {
    saveWindowPosition(windowId, window.position, window.size)
  }

  set(
    windowsAtom,
    windows.filter((w) => w.id !== windowId)
  )

  if (get(activeWindowIdAtom) === windowId) {
    const remaining = get(windowsAtom)
    if (remaining.length > 0) {
      const topmost = remaining.reduce((a, b) => (a.zIndex > b.zIndex ? a : b))
      set(activeWindowIdAtom, topmost.id)
    } else {
      set(activeWindowIdAtom, null)
    }
  }
})

export const focusWindowAtom = atom(null, (get, set, windowId: string) => {
  const windows = get(windowsAtom)
  const maxZ = get(maxZIndexAtom)

  set(
    windowsAtom,
    windows.map((w) => (w.id === windowId ? { ...w, zIndex: maxZ + 1 } : w))
  )
  set(activeWindowIdAtom, windowId)
})

export const minimizeWindowAtom = atom(null, (get, set, windowId: string) => {
  const windows = get(windowsAtom)
  set(
    windowsAtom,
    windows.map((w) => (w.id === windowId ? { ...w, isMinimized: true } : w))
  )
})

export const toggleMaximizeWindowAtom = atom(
  null,
  (get, set, windowId: string) => {
    const windows = get(windowsAtom)
    set(
      windowsAtom,
      windows.map((w) =>
        w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
      )
    )
  }
)

export const updateWindowPositionAtom = atom(
  null,
  (
    get,
    set,
    { windowId, position }: { windowId: string; position: Position }
  ) => {
    const windows = get(windowsAtom)
    const window = windows.find((w) => w.id === windowId)

    set(
      windowsAtom,
      windows.map((w) => (w.id === windowId ? { ...w, position } : w))
    )

    if (window) {
      saveWindowPosition(windowId, position, window.size)
    }
  }
)

export const updateWindowSizeAtom = atom(
  null,
  (get, set, { windowId, size }: { windowId: string; size: Size }) => {
    const windows = get(windowsAtom)
    const window = windows.find((w) => w.id === windowId)

    set(
      windowsAtom,
      windows.map((w) => (w.id === windowId ? { ...w, size } : w))
    )

    if (window) {
      saveWindowPosition(windowId, window.position, size)
    }
  }
)
