import type { Position } from '@/types/window'

const CACHE_KEY = 'ahpx-os-icon-cache'

export function getIconCache(): Record<string, Position> {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : {}
  } catch {
    return {}
  }
}

export function saveIconPosition(iconId: string, position: Position) {
  try {
    const cache = getIconCache()
    cache[iconId] = position
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('Failed to save icon position:', error)
  }
}

export function clearIconCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch (error) {
    console.error('Failed to clear icon cache:', error)
  }
}
