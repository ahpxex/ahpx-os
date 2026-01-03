import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { systemInfoAtom, wallpaperAtom } from '@/store/supabaseAtoms'
import { fetchSystemInfoAtom } from '@/store/supabaseActions'

export function useSystemInfo() {
  const systemInfo = useAtomValue(systemInfoAtom)
  const wallpaper = useAtomValue(wallpaperAtom)
  const fetchSystemInfo = useSetAtom(fetchSystemInfoAtom)

  useEffect(() => {
    fetchSystemInfo()
  }, [fetchSystemInfo])

  return { systemInfo, wallpaper }
}
