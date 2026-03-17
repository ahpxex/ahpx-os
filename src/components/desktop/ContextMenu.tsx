import { useEffect, useRef } from 'react'

export interface ContextMenuActionItem {
  label: string
  onClick: () => void
  disabled?: boolean
}

export interface ContextMenuDividerItem {
  divider: true
}

export type ContextMenuItem = ContextMenuActionItem | ContextMenuDividerItem

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const menuHeight =
    items.reduce((total, item) => total + ('divider' in item ? 9 : 34), 8)
  const adjustedStyle = {
    left: Math.max(8, Math.min(x, window.innerWidth - 188)),
    top: Math.max(8, Math.min(y, window.innerHeight - menuHeight - 8)),
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-[2000] min-w-[180px] rounded border border-[var(--color-border)] bg-white py-1"
      style={adjustedStyle}
    >
      {items.map((item, index) =>
        'divider' in item ? (
          <div
            key={index}
            className="my-1 h-px bg-gray-200"
          />
        ) : (
          <button
            key={index}
            onClick={() => {
              if (!item.disabled) {
                item.onClick()
                onClose()
              }
            }}
            disabled={item.disabled}
            className={`min-h-0 min-w-0 border-0 bg-transparent shadow-none flex w-full px-4 py-1.5 text-left text-sm ${
              item.disabled
                ? 'cursor-not-allowed text-gray-400'
                : 'hover:bg-[var(--color-primary)] hover:text-white'
            }`}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  )
}
