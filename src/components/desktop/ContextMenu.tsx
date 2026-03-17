import { useEffect, useRef, useState, useCallback } from 'react'

export interface ContextMenuActionItem {
  label: string
  onClick: () => void
  disabled?: boolean
  children?: ContextMenuItem[]
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

function SubMenu({ items, parentRect, onClose }: { items: ContextMenuItem[]; parentRect: DOMRect; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: parentRect.right - 2, top: parentRect.top })

  useEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    let left = parentRect.right - 2
    let top = parentRect.top
    if (left + rect.width > window.innerWidth - 4) left = parentRect.left - rect.width + 2
    if (top + rect.height > window.innerHeight - 4) top = window.innerHeight - rect.height - 4
    setPos({ left, top })
  }, [parentRect])

  return (
    <div ref={ref} className="xp-context-menu fixed z-[2001]" style={pos}>
      {items.map((item, i) => (
        <MenuRow key={i} item={item} onClose={onClose} />
      ))}
    </div>
  )
}

function MenuRow({ item, onClose }: { item: ContextMenuItem; onClose: () => void }) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [subOpen, setSubOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const openSub = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setSubOpen(true), 200)
  }, [])

  const closeSub = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setSubOpen(false), 300)
  }, [])

  if ('divider' in item) {
    return <div className="xp-context-divider" />
  }

  const hasChildren = item.children && item.children.length > 0

  return (
    <div
      ref={rowRef}
      className={`xp-context-item ${item.disabled ? 'disabled' : ''}`}
      onMouseEnter={hasChildren ? openSub : undefined}
      onMouseLeave={hasChildren ? closeSub : undefined}
      onClick={() => {
        if (item.disabled) return
        if (!hasChildren) {
          item.onClick()
          onClose()
        }
      }}
    >
      <span className="xp-context-item-label">{item.label}</span>
      {hasChildren && <span className="xp-context-item-arrow">&#9656;</span>}
      {hasChildren && subOpen && rowRef.current && (
        <SubMenu
          items={item.children!}
          parentRect={rowRef.current.getBoundingClientRect()}
          onClose={onClose}
        />
      )}
    </div>
  )
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

  useEffect(() => {
    if (!menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const el = menuRef.current
    if (rect.right > window.innerWidth - 4) el.style.left = `${window.innerWidth - rect.width - 4}px`
    if (rect.bottom > window.innerHeight - 4) el.style.top = `${window.innerHeight - rect.height - 4}px`
  }, [x, y])

  return (
    <div
      ref={menuRef}
      className="xp-context-menu fixed z-[2000]"
      style={{ left: x, top: y }}
    >
      {items.map((item, index) => (
        <MenuRow key={index} item={item} onClose={onClose} />
      ))}
    </div>
  )
}
