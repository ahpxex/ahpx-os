import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { profilesAtom, userAtom } from '@/store/supabaseAtoms'
import { fetchProfilesAtom } from '@/store/supabaseActions'

export function useProfiles() {
  const profiles = useAtomValue(profilesAtom)
  const user = useAtomValue(userAtom)
  const fetchProfiles = useSetAtom(fetchProfilesAtom)

  useEffect(() => {
    if (user?.id) fetchProfiles(user.id)
  }, [fetchProfiles, user])

  return { profiles, refetch: () => fetchProfiles() }
}
