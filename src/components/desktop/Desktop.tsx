import { useOS } from '@/hooks/useOS'
import { DesktopIcon } from './DesktopIcon'
import { WindowFrame } from '@/components/window/WindowFrame'
import { AboutApp } from '@/apps/AboutApp'
import { ProjectsApp } from '@/apps/ProjectsApp'
import { TerminalApp } from '@/apps/TerminalApp'

const desktopApps = [
  {
    id: 'about',
    title: 'About Me',
    icon: '/icons/1F44B.svg',
    component: AboutApp,
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: '/icons/1F680.svg',
    component: ProjectsApp,
  },
  {
    id: 'terminal',
    title: 'Terminal',
    icon: '/icons/1F4BB.svg',
    component: TerminalApp,
    initialSize: { width: 700, height: 450 },
  },
]

export function Desktop() {
  const { windows, openWindow } = useOS()

  return (
    <div
      className="absolute inset-0 z-0 bg-[#fbf7f0]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundBlendMode: 'soft-light',
      }}
    >
      <div className="z-10 grid grid-cols-1 gap-4 p-4">
        {desktopApps.map((app) => (
          <DesktopIcon
            key={app.id}
            id={app.id}
            title={app.title}
            icon={app.icon}
            onDoubleClick={() =>
              openWindow({
                id: app.id,
                title: app.title,
                icon: app.icon,
                component: app.component,
                initialSize: 'initialSize' in app ? app.initialSize : undefined,
              })
            }
          />
        ))}
      </div>

      {windows.map((window) => (
        <WindowFrame key={window.id} window={window} />
      ))}
    </div>
  )
}
