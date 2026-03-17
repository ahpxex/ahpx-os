import { DEFAULT_LAYOUT } from '@/types/profile'
import type { Profile, SystemInfo } from '@/types/database'
import type { ProfileContent } from '@/types/profile'

interface AppBootstrapData {
  profiles: Profile[]
  systemInfo: SystemInfo | null
}

interface UpdateProfileInput {
  id: string
  updates: Partial<{
    name: string
    slug: string
    icon: string
    content: ProfileContent
    avatar_url: string | null
    date: string | null
    is_active: boolean
  }>
}

const STORAGE_KEYS = {
  profiles: 'ahpx-os-profiles',
  systemInfo: 'ahpx-os-system-info',
} as const

export const SYSTEM_PROFILE_ID = 'profile-ahpx'
export const SYSTEM_PROFILE_NAME = 'My Computer'
export const SYSTEM_PROFILE_ICON = '/devices/system.png'

function now() {
  return new Date().toISOString()
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readValue<T>(key: string, fallback: T): T {
  if (!hasStorage()) return clone(fallback)

  const raw = window.localStorage.getItem(key)
  if (!raw) {
    const seeded = clone(fallback)
    window.localStorage.setItem(key, JSON.stringify(seeded))
    return seeded
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    const seeded = clone(fallback)
    window.localStorage.setItem(key, JSON.stringify(seeded))
    return seeded
  }
}

function writeValue<T>(key: string, value: T) {
  if (!hasStorage()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function createDefaultProfileContent(): ProfileContent {
  return {
    layout: DEFAULT_LAYOUT,
    widgets: [
      {
        id: 'intro',
        type: 'text',
        position: { x: 0, y: 0, width: 12, height: 5 },
        content: [
          '# ahpx',
          '',
          'Building playful interfaces, web tools, and small experiments on the internet.',
          '',
          'This profile is stored locally in your browser.',
        ].join('\n'),
      },
      {
        id: 'github',
        type: 'link-button',
        position: { x: 0, y: 5, width: 4, height: 2 },
        label: 'GitHub',
        url: 'https://github.com/ahpx',
        variant: 'primary',
      },
      {
        id: 'email',
        type: 'link-button',
        position: { x: 4, y: 5, width: 4, height: 2 },
        label: 'Email',
        url: 'mailto:hello@ahpx.dev',
        variant: 'secondary',
      },
    ],
  }
}

const DEFAULT_SYSTEM_INFO: SystemInfo = {
  id: 'system-local',
  created_at: '2026-03-17T00:00:00.000Z',
  updated_at: '2026-03-17T00:00:00.000Z',
  version: 'local-browser-store',
  name: 'aindows-xp',
  description: 'A frontend-only build with browser storage for profiles.',
  wallpaper: '/xp.png',
  theme: { accent: 'xp-blue', mode: 'light' },
  config: { storage: 'localStorage' },
  is_active: true,
}

const DEFAULT_PROFILES: Profile[] = [
  {
    id: SYSTEM_PROFILE_ID,
    created_at: '2026-03-17T00:00:00.000Z',
    updated_at: '2026-03-17T00:00:00.000Z',
    name: SYSTEM_PROFILE_NAME,
    slug: 'about-ahpx',
    icon: SYSTEM_PROFILE_ICON,
    date: '2026-03-17',
    content: createDefaultProfileContent(),
    is_active: true,
    avatar_url: null,
  },
]

function readProfiles() {
  return readValue(STORAGE_KEYS.profiles, DEFAULT_PROFILES).map((profile) =>
    profile.id === SYSTEM_PROFILE_ID
      ? {
          ...profile,
          name: SYSTEM_PROFILE_NAME,
          icon: SYSTEM_PROFILE_ICON,
        }
      : profile
  )
}

function writeProfiles(profiles: Profile[]) {
  writeValue(STORAGE_KEYS.profiles, profiles)
}

function readSystemInfo() {
  return readValue<SystemInfo | null>(STORAGE_KEYS.systemInfo, DEFAULT_SYSTEM_INFO)
}

function normalizeSlug(value: string, fallback: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')

  return normalized || fallback
}

function uniqueProfileSlug(slug: string, profiles: Profile[], currentId?: string) {
  const base = normalizeSlug(slug, 'profile')
  let candidate = base
  let index = 2

  while (profiles.some((profile) => profile.slug === candidate && profile.id !== currentId)) {
    candidate = `${base}-${index}`
    index += 1
  }

  return candidate
}

export function getBootstrapData(): AppBootstrapData {
  return {
    profiles: getAllProfiles(),
    systemInfo: readSystemInfo(),
  }
}

function getAllProfiles(): Profile[] {
  return readProfiles().filter((profile) => profile.is_active)
}

export async function updateProfile(input: UpdateProfileInput): Promise<Profile> {
  const profiles = readProfiles()
  const index = profiles.findIndex((profile) => profile.id === input.id)

  if (index === -1) {
    throw new Error('Profile not found')
  }

  const current = profiles[index]
  const nextName = input.updates.name?.trim() ?? current.name
  const nextSlug = input.updates.slug
    ? uniqueProfileSlug(input.updates.slug, profiles, current.id)
    : current.slug

  const updated: Profile = {
    ...current,
    ...input.updates,
    name: nextName,
    slug: nextSlug,
    updated_at: now(),
  }

  profiles[index] = updated
  writeProfiles(profiles)
  return updated
}
