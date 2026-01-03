import { atom } from 'jotai'
import type { WindowState, Theme, Position } from '@/types/window'
import { getIconCache } from './iconCache'

export const windowsAtom = atom<WindowState[]>([])
export const activeWindowIdAtom = atom<string | null>(null)
export const themeAtom = atom<Theme>('light')
export const iconPositionsAtom = atom<Record<string, Position>>(getIconCache())
export const selectedIconsAtom = atom<Set<string>>(new Set())

export const activeWindowAtom = atom((get) => {
  const windows = get(windowsAtom)
  const activeId = get(activeWindowIdAtom)
  return windows.find((w) => w.id === activeId) ?? null
})

export const maxZIndexAtom = atom((get) => {
  const windows = get(windowsAtom)
  if (windows.length === 0) return 100
  return Math.max(...windows.map((w) => w.zIndex))
})

// Export Supabase atoms
export * from './supabaseAtoms'
