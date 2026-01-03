import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  userAtom,
  isAuthenticatedAtom,
  authLoadingAtom,
} from '@/store/supabaseAtoms'
import { loginAtom, logoutAtom, initAuthAtom } from '@/store/supabaseActions'

export function useAuth() {
  const user = useAtomValue(userAtom)
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const loading = useAtomValue(authLoadingAtom)
  const login = useSetAtom(loginAtom)
  const logout = useSetAtom(logoutAtom)
  const initAuth = useSetAtom(initAuthAtom)

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return { user, isAuthenticated, loading, login, logout }
}
