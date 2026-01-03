import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Provider, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { initAuthAtom, fetchSystemInfoAtom } from '@/store/supabaseActions'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <Provider>
      <AppInitializer>
        <Outlet />
      </AppInitializer>
    </Provider>
  )
}

function AppInitializer({ children }: { children: React.ReactNode }) {
  const initAuth = useSetAtom(initAuthAtom)
  const fetchSystemInfo = useSetAtom(fetchSystemInfoAtom)

  useEffect(() => {
    initAuth()
    fetchSystemInfo()
  }, [initAuth, fetchSystemInfo])

  return <>{children}</>
}
