import { useState, useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { allProfilesAtom } from '@/store/appAtoms'
import { getProfileByIdAtom } from '@/store/profileActions'
import { useWindowContextMenu } from '@/contexts/WindowContextMenuContext'
import { ProfileView } from '@/components/profile/ProfileView'
import { ProfileEditor } from '@/components/profile/ProfileEditor'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import type { Profile as DBProfile } from '@/types/database'

interface ProfileAppProps {
  profileId: string
}

export function ProfileApp({ profileId }: ProfileAppProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<DBProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { setContextMenuItems, clearContextMenuItems } = useWindowContextMenu()

  const allProfiles = useAtomValue(allProfilesAtom)
  const getProfileById = useSetAtom(getProfileByIdAtom)

  useEffect(() => {
    const cachedProfile = allProfiles.find((entry) => entry.id === profileId)
    if (cachedProfile) {
      setProfile(cachedProfile)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const data = await getProfileById(profileId)
        setProfile(data)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [profileId, allProfiles, getProfileById])

  useEffect(() => {
    const cachedProfile = allProfiles.find((entry) => entry.id === profileId)
    if (cachedProfile) {
      setProfile(cachedProfile)
    }
  }, [allProfiles, profileId])

  useEffect(() => {
    if (!isEditing) {
      setContextMenuItems([
        {
          label: 'Edit Widgets',
          onClick: () => setIsEditing(true),
        },
      ])
    } else {
      clearContextMenuItems()
    }

    return () => {
      clearContextMenuItems()
    }
  }, [isEditing, setContextMenuItems, clearContextMenuItems])

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
        onSave={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return <ProfileView profile={profile} />
}
