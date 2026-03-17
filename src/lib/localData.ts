import { DEFAULT_LAYOUT } from '@/types/profile'
import type { BlogPost, Profile, SystemInfo } from '@/types/database'
import type { ProfileContent } from '@/types/profile'
import { titleToUrl } from '@/lib/urlHelpers'

export interface AppBootstrapData {
  profiles: Profile[]
  systemInfo: SystemInfo | null
  blogPosts: BlogPost[]
}

export interface CreateBlogPostInput {
  title: string
  summary: string
  date: string
  tags: string[]
  content: string
  published?: boolean
}

export interface UpdateBlogPostInput {
  id: string
  updates: Partial<CreateBlogPostInput>
}

export interface CreateProfileInput {
  name: string
  slug: string
  icon?: string
  content?: ProfileContent
  avatar_url?: string
}

export interface UpdateProfileInput {
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
  blogPosts: 'ahpx-os-blog-posts',
  profiles: 'ahpx-os-profiles',
  systemInfo: 'ahpx-os-system-info',
} as const

const DEFAULT_PROFILE_ICON = '/apps/vcard.png'
const SYSTEM_PROFILE_ID = 'profile-ahpx'
const SYSTEM_PROFILE_NAME = 'My Computer'
const SYSTEM_PROFILE_ICON = '/devices/system.png'

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
  name: 'ahpx-os',
  description: 'A frontend-only build with browser storage for profiles and blog posts.',
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

const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-browser-storage',
    created_at: '2026-03-17T00:00:00.000Z',
    updated_at: '2026-03-17T00:00:00.000Z',
    title: 'Browser-stored ahpx-os',
    summary: 'Profiles and blog posts now live directly in browser storage with no backend required.',
    date: '2026-03-17',
    tags: ['browser-storage', 'react', 'vite'],
    content: [
      '# Browser-stored ahpx-os',
      '',
      'This build runs without any external backend or sign-in flow.',
      '',
      '- Profiles are stored in `localStorage`.',
      '- Blog posts are editable right away.',
      '- The app boots with a small local seed dataset.',
    ].join('\n'),
    slug: 'browser-stored-ahpx-os',
    published: true,
  },
]

function sortBlogPosts(posts: BlogPost[]) {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function readBlogPosts() {
  return sortBlogPosts(readValue(STORAGE_KEYS.blogPosts, DEFAULT_BLOG_POSTS))
}

function writeBlogPosts(posts: BlogPost[]) {
  writeValue(STORAGE_KEYS.blogPosts, sortBlogPosts(posts))
}

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

function uniquePostSlug(title: string, posts: BlogPost[], currentId?: string) {
  const base = normalizeSlug(titleToUrl(title), 'post')
  let candidate = base
  let index = 2

  while (posts.some((post) => post.slug === candidate && post.id !== currentId)) {
    candidate = `${base}-${index}`
    index += 1
  }

  return candidate
}

export async function getBootstrapData(): Promise<AppBootstrapData> {
  return {
    profiles: await getAllProfiles(),
    systemInfo: await getSystemInfo(),
    blogPosts: await getBlogPosts(),
  }
}

export async function getSystemInfo(): Promise<SystemInfo | null> {
  return readSystemInfo()
}

export async function getBlogPosts(onlyPublished = false): Promise<BlogPost[]> {
  const posts = readBlogPosts()
  return onlyPublished ? posts.filter((post) => post.published) : posts
}

export async function createBlogPost(input: CreateBlogPostInput): Promise<BlogPost> {
  const posts = readBlogPosts()
  const timestamp = now()
  const nextPost: BlogPost = {
    id: crypto.randomUUID(),
    created_at: timestamp,
    updated_at: timestamp,
    title: input.title.trim(),
    summary: input.summary.trim(),
    date: input.date,
    tags: [...input.tags],
    content: input.content,
    slug: uniquePostSlug(input.title, posts),
    published: input.published ?? false,
  }

  writeBlogPosts([nextPost, ...posts])
  return nextPost
}

export async function updateBlogPost(input: UpdateBlogPostInput): Promise<BlogPost> {
  const posts = readBlogPosts()
  const index = posts.findIndex((post) => post.id === input.id)

  if (index === -1) {
    throw new Error('Blog post not found')
  }

  const current = posts[index]
  const nextTitle = input.updates.title?.trim() || current.title
  const updated: BlogPost = {
    ...current,
    ...input.updates,
    title: nextTitle,
    summary: input.updates.summary?.trim() ?? current.summary,
    tags: input.updates.tags ? [...input.updates.tags] : current.tags,
    slug:
      nextTitle === current.title
        ? current.slug
        : uniquePostSlug(nextTitle, posts, current.id),
    updated_at: now(),
  }

  posts[index] = updated
  writeBlogPosts(posts)
  return updated
}

export async function deleteBlogPost(id: string): Promise<void> {
  const posts = readBlogPosts()
  writeBlogPosts(posts.filter((post) => post.id !== id))
}

export async function getAllProfiles(): Promise<Profile[]> {
  return readProfiles().filter((profile) => profile.is_active)
}

export async function createProfile(input: CreateProfileInput): Promise<Profile> {
  const profiles = readProfiles()
  const timestamp = now()
  const nextProfile: Profile = {
    id: crypto.randomUUID(),
    created_at: timestamp,
    updated_at: timestamp,
    name: input.name.trim(),
    slug: uniqueProfileSlug(input.slug || input.name, profiles),
    icon: input.icon || DEFAULT_PROFILE_ICON,
    date: null,
    content: input.content || { widgets: [], layout: DEFAULT_LAYOUT },
    is_active: true,
    avatar_url: input.avatar_url ?? null,
  }

  writeProfiles([...profiles, nextProfile])
  return nextProfile
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

export async function deleteProfile(id: string): Promise<void> {
  const profiles = readProfiles()
  writeProfiles(profiles.filter((profile) => profile.id !== id))
}

export async function getProfileById(id: string): Promise<Profile> {
  const profile = readProfiles().find((entry) => entry.id === id)
  if (!profile) throw new Error('Profile not found')
  return profile
}

export async function getProfileBySlug(slug: string): Promise<Profile> {
  const profile = readProfiles().find((entry) => entry.slug === slug)
  if (!profile) throw new Error('Profile not found')
  return profile
}
