import { useEffect, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { allProfilesAtom } from '@/store/appAtoms'
import { useWindowContextMenu } from '@/contexts/WindowContextMenuContext'
import { ProfileView } from '@/components/profile/ProfileView'
import { ProfileEditor } from '@/components/profile/ProfileEditor'
import { useLocalAtom } from '@/hooks/useLocalAtom'

interface ProfileAppProps {
  profileId: string
}

export function ProfileApp({ profileId }: ProfileAppProps) {
  const allProfiles = useAtomValue(allProfilesAtom)
  const { setContextMenuItems, clearContextMenuItems } = useWindowContextMenu()
  const [isEditing, setIsEditing] = useLocalAtom(() => false, [profileId])
  const profile = useMemo(
    () => allProfiles.find((entry) => entry.id === profileId) ?? null,
    [allProfiles, profileId]
  )

  useEffect(() => {
    if (profile && !isEditing) {
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
  }, [clearContextMenuItems, isEditing, profile, setContextMenuItems, setIsEditing])

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
