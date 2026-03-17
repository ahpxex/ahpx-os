import { atom } from 'jotai'
import type { BlogPost, Profile, SystemInfo } from '@/types/database'

export const blogPostsAtom = atom<BlogPost[]>([])
export const allProfilesAtom = atom<Profile[]>([])
export const systemInfoAtom = atom<SystemInfo | null>(null)
export const wallpaperAtom = atom((get) => get(systemInfoAtom)?.wallpaper || null)
