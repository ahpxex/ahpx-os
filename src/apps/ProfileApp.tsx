import { useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { allProfilesAtom } from '@/store/appAtoms'
import { getProfileByIdAtom } from '@/store/profileActions'
import { useWindowContextMenu } from '@/contexts/WindowContextMenuContext'
import { ProfileView } from '@/components/profile/ProfileView'
import { ProfileEditor } from '@/components/profile/ProfileEditor'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useLocalAtom } from '@/hooks/useLocalAtom'
import type { Profile as DBProfile } from '@/types/database'

interface ProfileAppProps {
  profileId: string
}

interface ProfileAppState {
  isEditing: boolean
  profile: DBProfile | null
  loading: boolean
}

export function ProfileApp({ profileId }: ProfileAppProps) {
  const allProfiles = useAtomValue(allProfilesAtom)
  const getProfileById = useSetAtom(getProfileByIdAtom)
  const { setContextMenuItems, clearContextMenuItems } = useWindowContextMenu()
  const [profileState, setProfileState] = useLocalAtom<ProfileAppState>(
    () => {
      const cachedProfile = allProfiles.find((entry) => entry.id === profileId) ?? null
      return {
        isEditing: false,
        profile: cachedProfile,
        loading: cachedProfile === null,
      }
    },
    [profileId]
  )

  const { isEditing, profile, loading } = profileState

  useEffect(() => {
    const cachedProfile = allProfiles.find((entry) => entry.id === profileId)
    if (cachedProfile) {
      setProfileState((prev) => ({ ...prev, profile: cachedProfile, loading: false }))
      return
    }

    let cancelled = false

    const fetchProfile = async () => {
      try {
        const data = await getProfileById(profileId)
        if (!cancelled) {
          setProfileState((prev) => ({ ...prev, profile: data, loading: false }))
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        if (!cancelled) {
          setProfileState((prev) => ({ ...prev, loading: false }))
        }
      }
    }

    fetchProfile()

    return () => {
      cancelled = true
    }
  }, [profileId, allProfiles, getProfileById, setProfileState])

  useEffect(() => {
    const cachedProfile = allProfiles.find((entry) => entry.id === profileId)
    if (cachedProfile) {
      setProfileState((prev) => ({ ...prev, profile: cachedProfile }))
    }
  }, [allProfiles, profileId, setProfileState])

  useEffect(() => {
    if (!isEditing) {
      setContextMenuItems([
        {
          label: 'Edit Widgets',
          onClick: () => setProfileState((prev) => ({ ...prev, isEditing: true })),
        },
      ])
    } else {
      clearContextMenuItems()
    }

    return () => {
      clearContextMenuItems()
    }
  }, [isEditing, setContextMenuItems, clearContextMenuItems, setProfileState])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Profile not found
      </div>
    )
  }

  if (isEditing) {
    return (
      <ProfileEditor
        profile={profile}
        onSave={() => setProfileState((prev) => ({ ...prev, isEditing: false }))}
        onCancel={() => setProfileState((prev) => ({ ...prev, isEditing: false }))}
      />
    )
  }

  return <ProfileView profile={profile} />
}
