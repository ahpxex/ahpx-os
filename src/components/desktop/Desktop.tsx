import { useCallback, useMemo, useRef, useEffect } from 'react'
import type { ComponentType } from 'react'
import { LayoutGroup } from 'motion/react'
import { useOS } from '@/hooks/useOS'
import { useAllProfiles } from '@/hooks/useAllProfiles'
import { useLocalAtom } from '@/hooks/useLocalAtom'
import { DesktopIcon } from './DesktopIcon'
import { WindowFrame } from '@/components/window/WindowFrame'
import { ContextMenu } from './ContextMenu'
import { BlogsApp } from '@/apps/BlogsApp'
import { ClockApp } from '@/apps/ClockApp'
import { TerminalApp } from '@/apps/TerminalApp'
import { ProfileApp } from '@/apps/ProfileApp'
import { NewProfileApp } from '@/apps/NewProfileApp'

interface DesktopApp {
  id: string
  title: string
  icon: string
  component: ComponentType
  initialSize?: { width: number; height: number }
}

const staticApps: DesktopApp[] = [
  {
    id: 'blogs',
    title: 'Blogs',
    icon: '/places/document-open-recent.png',
    component: BlogsApp,
  },
  {
    id: 'clock',
    title: 'Clock',
    icon: '/apps/config-date.png',
    component: ClockApp,
    initialSize: { width: 600, height: 550 },
  },
  {
    id: 'terminal',
    title: 'Terminal',
    icon: '/apps/utilities-terminal.png',
    component: TerminalApp,
    initialSize: { width: 700, height: 450 },
  },
]

const ICON_WIDTH = 80
const ICON_HEIGHT = 76

interface SelectionBox {
  startX: number
  startY: number
  currentX: number
  currentY: number
}

interface DesktopProps {
  initialOpenApp?: string
}

export function Desktop({ initialOpenApp }: DesktopProps = {}) {
  const {
    windows,
    openWindow,
    iconPositions,
    updateIconPosition,
    resetIconPositions,
    selectedIcons,
    setSelectedIcons,
    clearSelectedIcons,
  } = useOS()
  const { profiles } = useAllProfiles()
  const [contextMenu, setContextMenu] = useLocalAtom<{ x: number; y: number } | null>(() => null, [])
  const [selectionBox, setSelectionBox] = useLocalAtom<SelectionBox | null>(() => null, [])
  const desktopRef = useRef<HTMLDivElement>(null)
  const hasOpenedInitialApp = useRef(false)

  const profileApps: DesktopApp[] = useMemo(
    () =>
      profiles.map((profile) => ({
        id: `profile-${profile.slug}`,
        title: `${profile.name}.exe`,
        icon: profile.icon,
        component: () => <ProfileApp profileId={profile.id} />,
      })),
    [profiles]
  )

  const desktopApps = useMemo(() => [...profileApps, ...staticApps], [profileApps])

  const defaultPositions = useMemo(() => {
    return desktopApps.reduce(
      (acc, app, index) => {
        acc[app.id] = { x: 16, y: 16 + index * 100 }
        return acc
      },
      {} as Record<string, { x: number; y: number }>
    )
  }, [desktopApps])

  const mergedPositions = useMemo(() => {
    return { ...defaultPositions, ...iconPositions }
  }, [defaultPositions, iconPositions])

  useEffect(() => {
    if (initialOpenApp && !hasOpenedInitialApp.current && desktopApps.length > 0) {
      const app = desktopApps.find((entry) => entry.id === initialOpenApp)
      if (app) {
        openWindow({
          id: app.id,
          title: app.title,
          icon: app.icon,
          component: app.component,
          initialSize: 'initialSize' in app ? app.initialSize : undefined,
        })
        hasOpenedInitialApp.current = true
      }
    }
  }, [initialOpenApp, desktopApps, openWindow])

  const getIconsInSelection = useCallback(
    (box: SelectionBox) => {
      const left = Math.min(box.startX, box.currentX)
      const right = Math.max(box.startX, box.currentX)
      const top = Math.min(box.startY, box.currentY)
      const bottom = Math.max(box.startY, box.currentY)

      const selected = new Set<string>()

      for (const app of desktopApps) {
        const pos = mergedPositions[app.id]
        if (!pos) continue

        const iconLeft = pos.x
        const iconRight = pos.x + ICON_WIDTH
        const iconTop = pos.y
        const iconBottom = pos.y + ICON_HEIGHT

        if (iconLeft < right && iconRight > left && iconTop < bottom && iconBottom > top) {
          selected.add(app.id)
        }
      }

      return selected
    },
    [mergedPositions, desktopApps]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return
      const target = e.target as HTMLElement
      if (!target.classList.contains('desktop-background') && !target.classList.contains('icons-container')) {
        return
      }

      const rect = desktopRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setSelectionBox({
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
      })
      clearSelectedIcons()
    },
    [clearSelectedIcons, setSelectionBox]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!selectionBox) return

      const rect = desktopRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const nextBox = {
        ...selectionBox,
        currentX: x,
        currentY: y,
      }
      setSelectionBox(nextBox)
      setSelectedIcons(getIconsInSelection(nextBox))
    },
    [selectionBox, getIconsInSelection, setSelectedIcons, setSelectionBox]
  )

  const handleMouseUp = useCallback(() => {
    setSelectionBox(null)
  }, [setSelectionBox])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.desktop-background')) {
        e.preventDefault()
        setContextMenu({ x: e.clientX, y: e.clientY })
      }
    },
    [setContextMenu]
  )

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [setContextMenu])

  const handleDesktopClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('desktop-background') || target.classList.contains('icons-container')) {
        clearSelectedIcons()
      }
    },
    [clearSelectedIcons]
  )

  const handleNewProfile = useCallback(() => {
    openWindow({
      id: 'new-profile',
      title: 'New Profile',
      icon: '/apps/vcard.png',
      component: NewProfileApp,
      initialSize: { width: 500, height: 400 },
    })
    closeContextMenu()
  }, [openWindow, closeContextMenu])

  const contextMenuItems = useMemo(() => {
    return [
      {
        label: 'Sort Icons',
        onClick: () => {
          resetIconPositions()
          closeContextMenu()
        },
      },
      { divider: true, label: '', onClick: () => {} },
      {
        label: 'New Profile',
        onClick: handleNewProfile,
      },
      { divider: true, label: '', onClick: () => {} },
      {
        label: 'Refresh',
        onClick: () => {
          window.location.reload()
        },
      },
    ]
  }, [resetIconPositions, closeContextMenu, handleNewProfile])

  const selectionBoxStyle = selectionBox
    ? {
        left: Math.min(selectionBox.startX, selectionBox.currentX),
        top: Math.min(selectionBox.startY, selectionBox.currentY),
        width: Math.abs(selectionBox.currentX - selectionBox.startX),
        height: Math.abs(selectionBox.currentY - selectionBox.startY),
      }
    : null

  return (
    <div
      ref={desktopRef}
      className="desktop-background absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/xp.png)' }}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleDesktopClick}
    >
      <div className="icons-container z-10 absolute inset-0">
        {desktopApps.map((app) => (
          <DesktopIcon
            key={app.id}
            id={app.id}
            title={app.title}
            icon={app.icon}
            position={mergedPositions[app.id]}
            isSelected={selectedIcons.has(app.id)}
            onPositionChange={(position) => updateIconPosition({ iconId: app.id, position })}
            onOpen={() =>
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

      <div
        className="window-drag-bounds absolute pointer-events-none opacity-0"
        style={{ top: 0, left: -10000, width: 20000, height: 20000 }}
      />

      {selectionBox && selectionBoxStyle && (
        <div
          className="absolute border border-[var(--color-primary)] bg-[var(--color-primary)]/10 pointer-events-none z-50"
          style={selectionBoxStyle}
        />
      )}

      <LayoutGroup id="windows">
        {windows.map((window) => (
          <WindowFrame key={window.id} window={window} />
        ))}
      </LayoutGroup>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={closeContextMenu}
        />
      )}
    </div>
  )
}
