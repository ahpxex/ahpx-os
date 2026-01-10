import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  windowsAtom,
  activeWindowIdAtom,
  themeAtom,
  activeWindowAtom,
  wallpaperAtom,
  iconPositionsAtom,
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
  updateIconPositionAtom,
  resetIconPositionsAtom,
  setSelectedIconsAtom,
  clearSelectedIconsAtom,
} from '@/store/actions'

export function useOS() {
  const windows = useAtomValue(windowsAtom)
  const activeWindowId = useAtomValue(activeWindowIdAtom)
  const activeWindow = useAtomValue(activeWindowAtom)
  const [theme, setTheme] = useAtom(themeAtom)
  const wallpaper = useAtomValue(wallpaperAtom)
  const iconPositions = useAtomValue(iconPositionsAtom)
  const selectedIcons = useAtomValue(selectedIconsAtom)

  const openWindow = useSetAtom(openWindowAtom)
  const closeWindow = useSetAtom(closeWindowAtom)
  const finalizeCloseWindow = useSetAtom(finalizeCloseWindowAtom)
  const focusWindow = useSetAtom(focusWindowAtom)
  const minimizeWindow = useSetAtom(minimizeWindowAtom)
  const toggleMaximizeWindow = useSetAtom(toggleMaximizeWindowAtom)
  const updateWindowPosition = useSetAtom(updateWindowPositionAtom)
  const updateWindowSize = useSetAtom(updateWindowSizeAtom)
  const updateIconPosition = useSetAtom(updateIconPositionAtom)
  const resetIconPositions = useSetAtom(resetIconPositionsAtom)
  const setSelectedIcons = useSetAtom(setSelectedIconsAtom)
  const clearSelectedIcons = useSetAtom(clearSelectedIconsAtom)

  return {
    windows,
    activeWindowId,
    activeWindow,
    theme,
    setTheme,
    wallpaper,
    iconPositions,
    selectedIcons,
    openWindow,
    closeWindow,
    finalizeCloseWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    updateWindowPosition,
    updateWindowSize,
    updateIconPosition,
    resetIconPositions,
    setSelectedIcons,
    clearSelectedIcons,
  }
}
