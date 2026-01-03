import { useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { allProfilesAtom, allProfilesLoadingAtom } from '@/store/supabaseAtoms'
import { fetchAllProfilesAtom } from '@/store/profileActions'

export function useAllProfiles() {
  const profiles = useAtomValue(allProfilesAtom)
  const loading = useAtomValue(allProfilesLoadingAtom)
  const fetchProfiles = useSetAtom(fetchAllProfilesAtom)

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  return {
    profiles,
    loading,
    refetch: fetchProfiles,
  }
}
