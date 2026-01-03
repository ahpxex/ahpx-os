import { atom } from 'jotai'
import { supabase } from '@/lib/supabase/client'
import {
  userAtom,
  sessionAtom,
  authLoadingAtom,
  blogPostsAtom,
  profilesAtom,
  systemInfoAtom,
} from './supabaseAtoms'
import type { LoginCredentials } from '@/types/auth'

// Auth actions (admin only, no signup)
export const loginAtom = atom(
  null,
  async (_get, set, credentials: LoginCredentials) => {
    set(authLoadingAtom, true)
    const { data, error } = await supabase.auth.signInWithPassword(credentials)
    if (!error) {
      set(userAtom, data.user)
      set(sessionAtom, data.session)
    }
    set(authLoadingAtom, false)
    if (error) throw error
  }
)

export const logoutAtom = atom(null, async (_get, set) => {
  await supabase.auth.signOut()
  set(userAtom, null)
  set(sessionAtom, null)
})

export const initAuthAtom = atom(null, async (_get, set) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    set(userAtom, session.user)
    set(sessionAtom, session)
  }
  set(authLoadingAtom, false)
})

// Data fetching actions
export const fetchBlogPostsAtom = atom(
  null,
  async (_get, set, onlyPublished = false) => {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('date', { ascending: false })

    if (onlyPublished) {
      query = query.eq('published', true)
    }

    const { data } = await query
    set(blogPostsAtom, data || [])
  }
)

export const fetchProfilesAtom = atom(null, async (get, set, userId?: string) => {
  const targetId = userId || get(userAtom)?.id
  if (!targetId) return

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', targetId)

  set(profilesAtom, data || [])
})

export const fetchSystemInfoAtom = atom(null, async (_get, set) => {
  const { data, error } = await supabase
    .from('system_info')
    .select('*')
    .eq('is_active', true)
    .single()

  // Silently handle missing table errors (PGRST116 = relation not found)
  if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
    console.error('Error fetching system info:', error)
  }

  set(systemInfoAtom, data)
})
