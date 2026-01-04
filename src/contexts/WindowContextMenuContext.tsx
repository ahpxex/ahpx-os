import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ContextMenu } from '@/components/desktop/ContextMenu'

export interface ContextMenuItem {
  label: string
  onClick: () => void
  disabled?: boolean
  divider?: boolean
}

interface WindowContextMenuContextValue {
  setContextMenuItems: (items: ContextMenuItem[]) => void
  clearContextMenuItems: () => void
}

const WindowContextMenuContext = createContext<WindowContextMenuContextValue | null>(null)

interface WindowContextMenuProviderProps {
  children: ReactNode
}

export function WindowContextMenuProvider({ children }: WindowContextMenuProviderProps) {
  const [menuItems, setMenuItems] = useState<ContextMenuItem[]>([])
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)

  const setContextMenuItems = useCallback((items: ContextMenuItem[]) => {
    setMenuItems(items)
  }, [])

  const clearContextMenuItems = useCallback(() => {
    setMenuItems([])
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (menuItems.length === 0) return
    e.preventDefault()
    e.stopPropagation()
    setMenuPosition({ x: e.clientX, y: e.clientY })
  }, [menuItems])

  const closeMenu = useCallback(() => {
    setMenuPosition(null)
  }, [])

  return (
    <WindowContextMenuContext.Provider value={{ setContextMenuItems, clearContextMenuItems }}>
      <div className="h-full" onContextMenu={handleContextMenu}>
        {children}
      </div>
      {menuPosition && menuItems.length > 0 && createPortal(
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
