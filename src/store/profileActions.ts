import { atom } from 'jotai'
import { updateProfile } from '@/lib/localData'
import { allProfilesAtom } from './appAtoms'
import type { ProfileContent } from '@/types/profile'
import type { Profile } from '@/types/database'

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
