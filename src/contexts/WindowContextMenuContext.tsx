/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ContextMenu } from '@/components/desktop/ContextMenu'
import type { ContextMenuItem } from '@/components/desktop/ContextMenu'
import { useLocalAtom } from '@/hooks/useLocalAtom'

interface WindowContextMenuContextValue {
  setContextMenuItems: (items: ContextMenuItem[]) => void
  clearContextMenuItems: () => void
}

const WindowContextMenuContext = createContext<WindowContextMenuContextValue | null>(null)

interface WindowContextMenuProviderProps {
  children: ReactNode
}

export function WindowContextMenuProvider({ children }: WindowContextMenuProviderProps) {
  const [menuItems, setMenuItems] = useLocalAtom<ContextMenuItem[]>(() => [], [])
  const [menuPosition, setMenuPosition] = useLocalAtom<{ x: number; y: number } | null>(
    () => null,
    []
  )

  const setContextMenuItems = useCallback(
    (items: ContextMenuItem[]) => {
      setMenuItems(items)
    },
    [setMenuItems]
  )

  const clearContextMenuItems = useCallback(() => {
    setMenuItems([])
  }, [setMenuItems])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (menuItems.length === 0) return
      e.preventDefault()
      e.stopPropagation()
      setMenuPosition({ x: e.clientX, y: e.clientY })
    },
    [menuItems.length, setMenuPosition]
  )

  const closeMenu = useCallback(() => {
    setMenuPosition(null)
  }, [setMenuPosition])

  return (
    <WindowContextMenuContext.Provider value={{ setContextMenuItems, clearContextMenuItems }}>
      <div className="h-full" onContextMenu={handleContextMenu}>
        {children}
      </div>
      {menuPosition && menuItems.length > 0 &&
        createPortal(
          <ContextMenu
            x={menuPosition.x}
            y={menuPosition.y}
            items={menuItems}
            onClose={closeMenu}
          />,
          document.body
        )}
    </WindowContextMenuContext.Provider>
  )
}

export function useWindowContextMenu() {
  const context = useContext(WindowContextMenuContext)
  if (!context) {
    throw new Error('useWindowContextMenu must be used within a WindowContextMenuProvider')
  }
  return context
}
