import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Provider, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { loadAppData } from '@/lib/loaders'
import { allProfilesAtom, allProfilesLoadingAtom, blogPostsAtom, systemInfoAtom } from '@/store/appAtoms'
import { ToastProvider } from '@/contexts/ToastContext'
import { DialogProvider } from '@/contexts/DialogContext'

export const Route = createRootRoute({
  loader: loadAppData,
  component: RootLayout,
  pendingComponent: () => (
    <div
      className="flex h-screen w-screen items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/xp.png)' }}
    >
      <div className="rounded border border-[var(--color-border)] bg-white/80 px-3 py-2 text-sm text-gray-700 shadow-sm backdrop-blur-sm">
        Loading...
      </div>
    </div>
  ),
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
  const setAllProfilesLoading = useSetAtom(allProfilesLoadingAtom)
  const setBlogPosts = useSetAtom(blogPostsAtom)

  useEffect(() => {
    setSystemInfo(data.systemInfo)
    setAllProfiles(data.profiles)
    setAllProfilesLoading(false)
    setBlogPosts(data.blogPosts)
  }, [data, setSystemInfo, setAllProfiles, setAllProfilesLoading, setBlogPosts])

  return <>{children}</>
}
