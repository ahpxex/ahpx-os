import { atom } from 'jotai'
import type { Profile, SystemInfo } from '@/types/database'

export const allProfilesAtom = atom<Profile[]>([])
export const systemInfoAtom = atom<SystemInfo | null>(null)
export const wallpaperAtom = atom((get) => get(systemInfoAtom)?.wallpaper || null)
