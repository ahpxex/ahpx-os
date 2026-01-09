import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import type { ComponentType } from 'react'
import { useOS } from '@/hooks/useOS'
import { useAllProfiles } from '@/hooks/useAllProfiles'
import { useAuth } from '@/hooks/useAuth'
import { DesktopIcon } from './DesktopIcon'
import { DesktopCornerWidget } from './DesktopCornerWidget'
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

// Static apps (non-profile)
const staticApps: DesktopApp[] = [
  {
    id: 'blogs',
    title: 'Blogs',
    icon: '/icons/1F4DD.svg',
    component: BlogsApp,
  },
  {
    id: 'clock',
    title: 'Clock',
    icon: '/icons/23F0.svg',
    component: ClockApp,
    initialSize: { width: 600, height: 550 },
  },
  {
    id: 'terminal',
    title: 'Terminal',
    icon: '/icons/1F4BB.svg',
    component: TerminalApp,
    initialSize: { width: 700, height: 450 },
  },
]

// Icon size for hit detection
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
  const { isAuthenticated } = useAuth()
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null)
  const desktopRef = useRef<HTMLDivElement>(null)
  const hasOpenedInitialApp = useRef(false)

  // Create dynamic profile apps from database
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

  // Merge static and profile apps
  const desktopApps = useMemo(
    () => [...profileApps, ...staticApps],
    [profileApps]
  )

  // Calculate default positions for all apps
  const defaultPositions = useMemo(() => {
    return desktopApps.reduce(
      (acc, app, index) => {
        acc[app.id] = { x: 16, y: 16 + index * 100 }
        return acc
      },
      {} as Record<string, { x: number; y: number }>
    )
  }, [desktopApps])

  // Merge cached positions with defaults
  const mergedPositions = useMemo(() => {
    return { ...defaultPositions, ...iconPositions }
  }, [defaultPositions, iconPositions])

  // Auto-open initial app if specified
  useEffect(() => {
    if (initialOpenApp && !hasOpenedInitialApp.current && desktopApps.length > 0) {
      const app = desktopApps.find((a) => a.id === initialOpenApp)
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

  // Check if a rectangle intersects with an icon
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

        // Check intersection
        if (
          iconLeft < right &&
          iconRight > left &&
          iconTop < bottom &&
          iconBottom > top
        ) {
          selected.add(app.id)
        }
      }

      return selected
    },
    [mergedPositions, desktopApps]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only start selection on left click on the desktop background itself
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
    [clearSelectedIcons]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!selectionBox) return

      const rect = desktopRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const newBox = {
        ...selectionBox,
        currentX: x,
        currentY: y,
      }
      setSelectionBox(newBox)
      setSelectedIcons(getIconsInSelection(newBox))
    },
    [selectionBox, getIconsInSelection, setSelectedIcons]
  )

  const handleMouseUp = useCallback(() => {
    setSelectionBox(null)
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // Only show context menu when clicking on the desktop background
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.desktop-background')) {
      e.preventDefault()
      setContextMenu({ x: e.clientX, y: e.clientY })
    }
  }, [])

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

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
      icon: '/icons/1F464.svg',
      component: NewProfileApp,
      initialSize: { width: 500, height: 400 },
    })
    closeContextMenu()
  }, [openWindow, closeContextMenu])

  const contextMenuItems = useMemo(() => {
    const items = [
      {
        label: 'Sort Icons',
        onClick: () => {
          resetIconPositions()
          closeContextMenu()
        },
      },
      { divider: true, label: '', onClick: () => {} },
    ]

    // Only show "New Profile" for authenticated users
    if (isAuthenticated) {
      items.push({
        label: 'New Profile',
        onClick: handleNewProfile,
      })
      items.push({ divider: true, label: '', onClick: () => {} })
    }

    items.push({
      label: 'Refresh',
      onClick: () => {
        window.location.reload()
      },
    })

    return items
  }, [isAuthenticated, resetIconPositions, closeContextMenu, handleNewProfile])

  // Calculate selection box styles
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
      className="desktop-background absolute inset-0 z-0 bg-[#fbf7f0]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundBlendMode: 'soft-light',
      }}
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

      <DesktopCornerWidget />

      {/* Selection box */}
      {selectionBox && selectionBoxStyle && (
        <div
          className="absolute border border-[var(--color-primary)] bg-[var(--color-primary)]/10 pointer-events-none z-50"
          style={selectionBoxStyle}
        />
      )}

      {windows.map((window) => (
        <WindowFrame key={window.id} window={window} />
      ))}

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
