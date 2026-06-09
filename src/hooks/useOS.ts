import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  windowsAtom,
  activeWindowIdAtom,
  themeAtom,
  activeWindowAtom,
  wallpaperAtom,
  selectedIconsAtom,
} from '@/store/atoms'
import {
  openWindowAtom,
  closeWindowAtom,
  finalizeCloseWindowAtom,
  focusWindowAtom,
  minimizeWindowAtom,
  toggleMaximizeWindowAtom,
  updateWindowPositionAtom,
  updateWindowSizeAtom,
  updateWindowTitleAtom,
  setSelectedIconsAtom,
  clearSelectedIconsAtom,
} from '@/store/actions'

export function useOS() {
  const windows = useAtomValue(windowsAtom)
  const activeWindowId = useAtomValue(activeWindowIdAtom)
  const activeWindow = useAtomValue(activeWindowAtom)
  const [theme, setTheme] = useAtom(themeAtom)
  const wallpaper = useAtomValue(wallpaperAtom)
  const selectedIcons = useAtomValue(selectedIconsAtom)

  const openWindow = useSetAtom(openWindowAtom)
  const closeWindow = useSetAtom(closeWindowAtom)
  const finalizeCloseWindow = useSetAtom(finalizeCloseWindowAtom)
  const focusWindow = useSetAtom(focusWindowAtom)
  const minimizeWindow = useSetAtom(minimizeWindowAtom)
  const toggleMaximizeWindow = useSetAtom(toggleMaximizeWindowAtom)
  const updateWindowPosition = useSetAtom(updateWindowPositionAtom)
  const updateWindowSize = useSetAtom(updateWindowSizeAtom)
  const updateWindowTitle = useSetAtom(updateWindowTitleAtom)
  const setSelectedIcons = useSetAtom(setSelectedIconsAtom)
  const clearSelectedIcons = useSetAtom(clearSelectedIconsAtom)

  return {
    windows,
    activeWindowId,
    activeWindow,
    theme,
    setTheme,
    wallpaper,
    selectedIcons,
    openWindow,
    closeWindow,
    finalizeCloseWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    updateWindowPosition,
    updateWindowSize,
    updateWindowTitle,
    setSelectedIcons,
    clearSelectedIcons,
  }
}
