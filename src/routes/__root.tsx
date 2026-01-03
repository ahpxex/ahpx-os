import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Provider, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { loadAppData } from '@/lib/loaders'
import { userAtom, sessionAtom, authLoadingAtom, systemInfoAtom } from '@/store/supabaseAtoms'
import { allProfilesAtom, allProfilesLoadingAtom } from '@/store/supabaseAtoms'

export const Route = createRootRoute({
  loader: loadAppData,
  component: RootLayout,
  pendingComponent: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-[#fbf7f0]">
      <div className="text-sm text-gray-500">Loading...</div>
    </div>
  ),
})

function RootLayout() {
  const loaderData = Route.useLoaderData()

  return (
    <Provider>
      <DataHydrator data={loaderData}>
        <Outlet />
      </DataHydrator>
    </Provider>
  )
}

interface DataHydratorProps {
  data: Awaited<ReturnType<typeof loadAppData>>
  children: React.ReactNode
}

function DataHydrator({ data, children }: DataHydratorProps) {
  const setUser = useSetAtom(userAtom)
  const setSession = useSetAtom(sessionAtom)
  const setAuthLoading = useSetAtom(authLoadingAtom)
  const setSystemInfo = useSetAtom(systemInfoAtom)
  const setAllProfiles = useSetAtom(allProfilesAtom)
  const setAllProfilesLoading = useSetAtom(allProfilesLoadingAtom)

  useEffect(() => {
    // Hydrate auth state
    setUser(data.user)
    setSession(data.session)
    setAuthLoading(false)

    // Hydrate system info
    setSystemInfo(data.systemInfo)

    // Hydrate profiles
    setAllProfiles(data.profiles)
    setAllProfilesLoading(false)
  }, [data, setUser, setSession, setAuthLoading, setSystemInfo, setAllProfiles, setAllProfilesLoading])

  return <>{children}</>
}
