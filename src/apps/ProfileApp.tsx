import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAtomValue, useSetAtom } from 'jotai'
import { allProfilesAtom } from '@/store/supabaseAtoms'
import { getProfileByIdAtom } from '@/store/profileActions'
import { useAuth } from '@/hooks/useAuth'
import { ProfileView } from '@/components/profile/ProfileView'
import { ProfileEditor } from '@/components/profile/ProfileEditor'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ContextMenu } from '@/components/desktop/ContextMenu'
import type { Profile as DBProfile } from '@/types/database'

interface ProfileAppProps {
  profileId: string
}

export function ProfileApp({ profileId }: ProfileAppProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<DBProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const { isAuthenticated } = useAuth()

  // Try to get profile from cached state first
  const allProfiles = useAtomValue(allProfilesAtom)
  const getProfileById = useSetAtom(getProfileByIdAtom)

  useEffect(() => {
    // Check if profile is in cache
    const cachedProfile = allProfiles.find((p) => p.id === profileId)
    if (cachedProfile) {
      setProfile(cachedProfile)
      setLoading(false)
      return
    }

    // Otherwise fetch from database
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

  // Update profile when cache changes
  useEffect(() => {
    const cachedProfile = allProfiles.find((p) => p.id === profileId)
    if (cachedProfile) {
      setProfile(cachedProfile)
    }
  }, [allProfiles, profileId])

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

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isAuthenticated) return
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY })
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

  return (
    <>
      <ProfileView
        profile={profile}
        onContextMenu={handleContextMenu}
      />
      {contextMenu && createPortal(
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            {
              label: 'Edit Widgets',
              onClick: () => setIsEditing(true),
            },
          ]}
          onClose={() => setContextMenu(null)}
        />,
        document.body
      )}
    </>
  )
}
