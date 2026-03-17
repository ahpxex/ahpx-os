import { lazy, Suspense } from 'react'
import type { ComponentType } from 'react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  SYSTEM_PROFILE_ICON,
  SYSTEM_PROFILE_ID,
  SYSTEM_PROFILE_NAME,
} from '@/lib/localData'
import type { WindowConfig } from '@/types/window'

function createLazyWindow(
  loader: () => Promise<{ default: ComponentType }>
): ComponentType {
  const LazyWindow = lazy(loader)

  return function LazyWindowComponent() {
    return (
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <LazyWindow />
      </Suspense>
    )
  }
}

export const desktopApps: WindowConfig[] = [
  {
    id: SYSTEM_PROFILE_ID,
    title: SYSTEM_PROFILE_NAME,
    icon: SYSTEM_PROFILE_ICON,
    component: createLazyWindow(async () => {
      const { MyComputerApp } = await import('@/apps/MyComputerApp')
      return { default: MyComputerApp }
    }),
    initialSize: { width: 750, height: 550 },
  },
  {
    id: 'blogs',
    title: 'Blogs',
    icon: '/places/document-open-recent.png',
    component: createLazyWindow(async () => {
      const { BlogsApp } = await import('@/apps/BlogsApp')
      return { default: BlogsApp }
    }),
  },
  {
    id: 'clock',
    title: 'Clock',
    icon: '/apps/config-date.png',
    component: createLazyWindow(async () => {
      const { ClockApp } = await import('@/apps/ClockApp')
      return { default: ClockApp }
    }),
    initialSize: { width: 600, height: 550 },
  },
  {
    id: 'terminal',
    title: 'Terminal',
    icon: '/apps/utilities-terminal.png',
    component: createLazyWindow(async () => {
      const { TerminalApp } = await import('@/apps/TerminalApp')
      return { default: TerminalApp }
    }),
    initialSize: { width: 700, height: 450 },
  },
]

export function getDesktopApp(appId: string) {
  return desktopApps.find((app) => app.id === appId) ?? null
}
