import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  windowsAtom,
  activeWindowIdAtom,
  themeAtom,
  activeWindowAtom,
} from '@/store/atoms'
import {
  openWindowAtom,
  closeWindowAtom,
  focusWindowAtom,
  minimizeWindowAtom,
  toggleMaximizeWindowAtom,
  updateWindowPositionAtom,
  updateWindowSizeAtom,
} from '@/store/actions'

export function useOS() {
  const windows = useAtomValue(windowsAtom)
  const activeWindowId = useAtomValue(activeWindowIdAtom)
  const activeWindow = useAtomValue(activeWindowAtom)
  const [theme, setTheme] = useAtom(themeAtom)

  const openWindow = useSetAtom(openWindowAtom)
  const closeWindow = useSetAtom(closeWindowAtom)
  const focusWindow = useSetAtom(focusWindowAtom)
  const minimizeWindow = useSetAtom(minimizeWindowAtom)
  const toggleMaximizeWindow = useSetAtom(toggleMaximizeWindowAtom)
  const updateWindowPosition = useSetAtom(updateWindowPositionAtom)
  const updateWindowSize = useSetAtom(updateWindowSizeAtom)

  return {
    windows,
    activeWindowId,
    activeWindow,
    theme,
    setTheme,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    updateWindowPosition,
    updateWindowSize,
  }
}
