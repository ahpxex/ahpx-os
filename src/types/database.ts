import type { ProfileContent } from '@/types/profile'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface BlogPost {
  id: string
  created_at: string
  updated_at: string
  title: string
  summary: string
  date: string
  tags: string[]
  content: Json | null
  slug: string
  published: boolean
}

export interface Profile {
  id: string
  created_at: string
  updated_at: string
  name: string
  slug: string
  icon: string
  date: string | null
  content: ProfileContent
  is_active: boolean
  avatar_url: string | null
}

export interface SystemInfo {
  id: string
  created_at: string
  updated_at: string
  version: string
  name: string
  description: string | null
  wallpaper: string | null
  theme: Json
  config: Json
  is_active: boolean
}
