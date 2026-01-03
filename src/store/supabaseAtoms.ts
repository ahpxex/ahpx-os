import { atom } from 'jotai'
import type { User, Session } from '@supabase/supabase-js'
import type { BlogPost, Profile, SystemInfo } from '@/types/database'

// Auth atoms
export const userAtom = atom<User | null>(null)
export const sessionAtom = atom<Session | null>(null)
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null)
export const authLoadingAtom = atom<boolean>(true)

// Blog posts atoms
export const blogPostsAtom = atom<BlogPost[]>([])
export const publishedBlogPostsAtom = atom((get) =>
  get(blogPostsAtom).filter((p) => p.published)
)

// Profiles atoms (multiple per user)
export const profilesAtom = atom<Profile[]>([])

// All active profiles (for desktop icons)
export const allProfilesAtom = atom<Profile[]>([])
export const allProfilesLoadingAtom = atom<boolean>(true)

// System info atoms
export const systemInfoAtom = atom<SystemInfo | null>(null)
export const wallpaperAtom = atom((get) => get(systemInfoAtom)?.wallpaper || null)
