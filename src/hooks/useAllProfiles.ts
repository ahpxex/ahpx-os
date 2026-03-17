import { useAtomValue, useSetAtom } from 'jotai'
import { allProfilesAtom, allProfilesLoadingAtom } from '@/store/appAtoms'
import { fetchAllProfilesAtom } from '@/store/profileActions'

export function useAllProfiles() {
  const profiles = useAtomValue(allProfilesAtom)
  const loading = useAtomValue(allProfilesLoadingAtom)
  const fetchProfiles = useSetAtom(fetchAllProfilesAtom)

  return {
    profiles,
    loading,
    refetch: fetchProfiles,
  }
}
