import { atom } from 'jotai'
import { supabase } from '@/lib/supabase/client'
import { allProfilesAtom, allProfilesLoadingAtom, userAtom } from './supabaseAtoms'
import type { ProfileContent } from '@/types/profile'
import type { Profile } from '@/types/database'
import type { Json } from '@/lib/supabase/types'

// Fetch all active profiles (public, for desktop icons)
export const fetchAllProfilesAtom = atom(null, async (_get, set) => {
  set(allProfilesLoadingAtom, true)

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    // PGRST116 = table not found, silently handle for dev environments
    if (error.code !== 'PGRST116' && error.code !== '42P01') {
      console.error('Error fetching profiles:', error)
    }
    set(allProfilesLoadingAtom, false)
    return
  }

  set(allProfilesAtom, data || [])
  set(allProfilesLoadingAtom, false)
})

// Create a new profile
export const createProfileAtom = atom(
  null,
  async (
    get,
    set,
    params: {
      name: string
      slug: string
      icon?: string
      content?: ProfileContent
      avatar_url?: string
    }
  ) => {
    const user = get(userAtom)
    if (!user) throw new Error('Must be authenticated to create profile')

    const defaultContent: ProfileContent = {
      widgets: [],
      layout: { columns: 12, rowHeight: 30 },
    }

    const content = params.content || defaultContent

    // Use type assertion for new columns not yet in generated types
    const insertData = {
      user_id: user.id,
      name: params.name,
      slug: params.slug.toLowerCase().replace(/\s+/g, '-'),
      icon: params.icon || '/apps/cs-user.png',
      content: content as unknown as Json,
      avatar_url: params.avatar_url || null,
      is_active: true,
    }

    const { data, error } = await supabase
      .from('profiles')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insertData as any)
      .select()
      .single()

    if (error) throw error

    // Refresh all profiles
    const currentProfiles = get(allProfilesAtom)
    set(allProfilesAtom, [...currentProfiles, data as Profile])

    return data
  }
)

// Update a profile
export const updateProfileAtom = atom(
  null,
  async (
    get,
    set,
    params: {
      id: string
      updates: Partial<{
        name: string
        slug: string
        icon: string
        content: ProfileContent
        avatar_url: string | null
        date: string | null
      }>
    }
  ) => {
    const user = get(userAtom)
    if (!user) throw new Error('Must be authenticated to update profile')

    // Build update object with proper types
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (params.updates.name !== undefined) updateData.name = params.updates.name
    if (params.updates.slug !== undefined) updateData.slug = params.updates.slug
    if (params.updates.icon !== undefined) updateData.icon = params.updates.icon
    if (params.updates.avatar_url !== undefined) updateData.avatar_url = params.updates.avatar_url
    if (params.updates.date !== undefined) updateData.date = params.updates.date
    if (params.updates.content !== undefined) {
      updateData.content = params.updates.content as unknown as Json
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('profiles')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Update local state
    const currentProfiles = get(allProfilesAtom)
    const updatedProfiles: Profile[] = currentProfiles.map((p) =>
      p.id === params.id ? (data as Profile) : p
    )
    set(allProfilesAtom, updatedProfiles)

    return data
  }
)

// Delete a profile (soft delete - sets is_active to false)
export const deleteProfileAtom = atom(null, async (get, set, profileId: string) => {
  const user = get(userAtom)
  if (!user) throw new Error('Must be authenticated to delete profile')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', profileId)

  if (error) throw error

  // Remove from local state
  const currentProfiles = get(allProfilesAtom)
  const remainingProfiles: Profile[] = currentProfiles.filter((p) => p.id !== profileId)
  set(allProfilesAtom, remainingProfiles)
})

// Get a single profile by ID
export const getProfileByIdAtom = atom(null, async (_get, _set, profileId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (error) throw error
  return data
})

// Get a single profile by slug
export const getProfileBySlugAtom = atom(null, async (_get, _set, slug: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data
})
