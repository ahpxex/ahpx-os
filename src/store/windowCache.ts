import type { Position, Size } from '@/types/window'

interface WindowCache {
  position: Position
  size: Size
}

const CACHE_KEY = 'ahpx-os-window-cache'

export function getWindowCache(): Record<string, WindowCache> {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : {}
  } catch {
    return {}
  }
}

export function saveWindowPosition(windowId: string, position: Position, size: Size) {
  try {
    const cache = getWindowCache()
    cache[windowId] = { position, size }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('Failed to save window position:', error)
  }
}

export function getWindowPosition(windowId: string): WindowCache | null {
  const cache = getWindowCache()
  return cache[windowId] || null
}
