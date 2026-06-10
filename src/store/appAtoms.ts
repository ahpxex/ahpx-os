import { atom } from 'jotai'
import type { Profile, SystemInfo } from '@/types/database'

export const allProfilesAtom = atom<Profile[]>([])
export const systemInfoAtom = atom<SystemInfo | null>(null)
export const wallpaperAtom = atom((get) => get(systemInfoAtom)?.wallpaper || null)

export type MyComputerPath =
  | 'root'
  | 'my-products'
  | 'weekly-projects'
  | 'open-source-projects'
  | 'my-pictures'

export const myComputerPathAtom = atom<MyComputerPath>('root')

export const photoViewerIndexAtom = atom(0)
