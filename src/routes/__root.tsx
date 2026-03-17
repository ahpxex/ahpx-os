import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Provider, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { loadAppData } from '@/lib/loaders'
import { allProfilesAtom, systemInfoAtom } from '@/store/appAtoms'
import { ToastProvider } from '@/contexts/ToastContext'
import { DialogProvider } from '@/contexts/DialogContext'

export const Route = createRootRoute({
  loader: loadAppData,
  component: RootLayout,
})

function RootLayout() {
  const loaderData = Route.useLoaderData()

  return (
    <Provider>
      <DialogProvider>
        <ToastProvider>
          <DataHydrator data={loaderData}>
            <Outlet />
          </DataHydrator>
        </ToastProvider>
      </DialogProvider>
    </Provider>
  )
}

interface DataHydratorProps {
  data: Awaited<ReturnType<typeof loadAppData>>
  children: React.ReactNode
}

function DataHydrator({ data, children }: DataHydratorProps) {
  const setSystemInfo = useSetAtom(systemInfoAtom)
  const setAllProfiles = useSetAtom(allProfilesAtom)

  useEffect(() => {
    setSystemInfo(data.systemInfo)
    setAllProfiles(data.profiles)
  }, [data, setAllProfiles, setSystemInfo])

  return <>{children}</>
}
