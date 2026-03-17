import { atom } from 'jotai'
import {
  createProfile,
  deleteProfile,
  getAllProfiles,
  getProfileById,
  getProfileBySlug,
  updateProfile,
} from '@/lib/localData'
import { allProfilesAtom, allProfilesLoadingAtom } from './appAtoms'
import type { ProfileContent } from '@/types/profile'
import type { Profile } from '@/types/database'

export const fetchAllProfilesAtom = atom(null, async (_get, set) => {
  set(allProfilesLoadingAtom, true)

  try {
    const data = await getAllProfiles()
    set(allProfilesAtom, data)
  } finally {
    set(allProfilesLoadingAtom, false)
  }
})

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
    const defaultContent: ProfileContent = {
      widgets: [],
      layout: { columns: 12, rowHeight: 30 },
    }

    const data = await createProfile({
      name: params.name,
      slug: params.slug,
      icon: params.icon || '/apps/vcard.png',
      content: params.content || defaultContent,
      avatar_url: params.avatar_url,
    })

    const currentProfiles = get(allProfilesAtom)
    set(allProfilesAtom, [...currentProfiles, data as Profile])

    return data
  }
)

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
        is_active: boolean
      }>
    }
  ) => {
    const data = await updateProfile({
      id: params.id,
      updates: params.updates,
    })

    const currentProfiles = get(allProfilesAtom)
    const updatedProfiles: Profile[] = currentProfiles.map((profile) =>
      profile.id === params.id ? (data as Profile) : profile
    )
    set(allProfilesAtom, updatedProfiles)

    return data
  }
)

export const deleteProfileAtom = atom(null, async (get, set, profileId: string) => {
  await deleteProfile(profileId)

  const currentProfiles = get(allProfilesAtom)
  const remainingProfiles: Profile[] = currentProfiles.filter((profile) => profile.id !== profileId)
  set(allProfilesAtom, remainingProfiles)
})

export const getProfileByIdAtom = atom(null, async (_get, _set, profileId: string) => {
  return getProfileById(profileId)
})

export const getProfileBySlugAtom = atom(null, async (_get, _set, slug: string) => {
  return getProfileBySlug(slug)
})
