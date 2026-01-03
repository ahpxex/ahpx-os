import { useRef, useEffect, createContext, useContext, useState } from 'react'

type MenuItem =
  | {
      label: string
      shortcut?: string
      disabled?: boolean
      divider?: false
      onClick?: () => void
    }
  | {
      divider: true
      label?: never
      shortcut?: never
      disabled?: never
      onClick?: never
    }

interface MenuBarContextType {
  activeMenu: string | null
  setActiveMenu: (menu: string | null) => void
  isMenuBarActive: boolean
}

const MenuBarContext = createContext<MenuBarContextType>({
  activeMenu: null,
  setActiveMenu: () => {},
  isMenuBarActive: false,
})

interface MenuBarProps {
  children: React.ReactNode
}

export function MenuBar({ children }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuBarRef.current && !menuBarRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeMenu])

  return (
    <MenuBarContext.Provider
      value={{
        activeMenu,
        setActiveMenu,
        isMenuBarActive: activeMenu !== null,
      }}
    >
      <div ref={menuBarRef} className="flex items-center gap-1">
        {children}
      </div>
    </MenuBarContext.Provider>
  )
}

interface MenuProps {
  id: string
  label: string
  items: MenuItem[]
  isLogo?: boolean
}

export function Menu({ id, label, items, isLogo }: MenuProps) {
  const { activeMenu, setActiveMenu, isMenuBarActive } = useContext(MenuBarContext)
  const isOpen = activeMenu === id

  const handleClick = () => {
    setActiveMenu(isOpen ? null : id)
  }

  const handleMouseEnter = () => {
    if (isMenuBarActive) {
      setActiveMenu(id)
    }
  }

  const handleItemClick = (item: MenuItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick()
    }
    setActiveMenu(null)
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        className={`flex h-6 items-center px-2 text-sm hover:bg-[var(--color-primary-bg)] ${
          isOpen ? 'bg-[var(--color-primary-bg)]' : ''
        } ${isLogo ? 'font-bold' : ''}`}
      >
        {label}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-[2000] mt-1 min-w-48 border border-[var(--color-border)] bg-white py-1 shadow-md">
          {items.map((item, index) =>
            item.divider ? (
              <div key={index} className="my-1 border-t border-gray-200" />
            ) : (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`flex w-full items-center justify-between px-3 py-1 text-left text-sm ${
                  item.disabled
                    ? 'cursor-not-allowed text-gray-400'
                    : 'hover:bg-[var(--color-primary-bg)]'
                }`}
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="ml-4 text-xs text-gray-400">
                    {item.shortcut}
                  </span>
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
