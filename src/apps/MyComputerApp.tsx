import { useState, useCallback, useRef, useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { openWindowAtom } from '@/store/actions'
import { getDesktopApp } from '@/lib/desktopApps'
import weeklyProjectsData from '@/data/weeklyProjects.json'

const weeklyProjects: ListItem[] = weeklyProjectsData.map((item, i) => ({
  id: `wp-${String(i + 1).padStart(2, '0')}`,
  ...item,
}))

interface MenuItem {
  label: string
  disabled?: boolean
  divider?: boolean
  onClick?: () => void
}

interface MenuDef {
  label: string
  items: MenuItem[]
}

const MENU_FONT = { fontSize: 11, fontFamily: 'Tahoma, Verdana, Arial, sans-serif' } as const

function MenuBar({ menus }: { menus: MenuDef[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (openIndex === null) return
    const handleClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenIndex(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openIndex])

  return (
    <div
      ref={barRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '1px 2px',
        background: 'linear-gradient(to bottom, #F6F8FB, #E8ECF4)',
        borderBottom: '1px solid #ACA899',
        position: 'relative',
        ...MENU_FONT,
      }}
    >
      {menus.map((menu, i) => (
        <div key={menu.label} style={{ position: 'relative' }}>
          <div
            style={{
              padding: '2px 6px',
              cursor: 'default',
              background: openIndex === i ? '#395fed' : 'transparent',
              color: openIndex === i ? '#fff' : '#000',
            }}
            onMouseDown={() => setOpenIndex(openIndex === i ? null : i)}
            onMouseEnter={() => { if (openIndex !== null) setOpenIndex(i) }}
          >
            {menu.label}
          </div>
          {openIndex === i && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: '#fff',
                border: '1px solid #ACA899',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.15)',
                padding: '2px 0',
                minWidth: 160,
                zIndex: 100,
              }}
            >
              {menu.items.map((item, j) =>
                item.divider ? (
                  <div key={j} style={{ height: 1, background: '#E0E0E0', margin: '3px 2px' }} />
                ) : (
                  <MenuItemRow
                    key={j}
                    item={item}
                    onClose={() => setOpenIndex(null)}
                  />
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function MenuItemRow({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{
        padding: '3px 24px 3px 24px',
        cursor: item.disabled ? 'default' : 'pointer',
        background: hovered && !item.disabled ? '#395fed' : 'transparent',
        color: item.disabled ? '#ACA899' : hovered ? '#fff' : '#000',
        ...MENU_FONT,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (!item.disabled && item.onClick) {
          item.onClick()
          onClose()
        }
      }}
    >
      {item.label}
    </div>
  )
}

interface TaskPanelProps {
  title: string
  color: 'blue' | 'green' | 'purple'
  children: React.ReactNode
}

const panelColors = {
  blue: {
    header: 'linear-gradient(to right, #f1f1fe 70%, #a9b8f3)',
    headerText: '#173179',
    bg: 'linear-gradient(to bottom, #C1D0F0, #D8E2F5)',
    border: '#6F8AD7',
  },
  green: {
    header: 'linear-gradient(to bottom, #8DB88D, #5A9A5A)',
    headerText: '#fff',
    bg: 'linear-gradient(to bottom, #C1E0C1, #D8F0D8)',
    border: '#85C085',
  },
  purple: {
    header: 'linear-gradient(to bottom, #9B86C2, #7B5EA7)',
    headerText: '#fff',
    bg: 'linear-gradient(to bottom, #D8CDE8, #E8DFF7)',
    border: '#B09CD2',
  },
}

function TaskPanel({ title, color, children }: TaskPanelProps) {
  const c = panelColors[color]

  return (
    <div
      style={{
        borderRadius: '5px 5px 0 0',
        overflow: 'hidden',
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '6px 10px',
          background: c.header,
          color: c.headerText,
          fontWeight: 'bold',
          fontSize: 11,
          fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
          borderRadius: '5px 5px 0 0',
        }}
      >
        <span>{title}</span>
      </div>
      <div style={{ background: c.bg, padding: '8px 12px' }}>
        {children}
      </div>
    </div>
  )
}

interface SidebarLinkProps {
  icon?: string
  label: string
  onClick?: () => void
  href?: string
}

function SidebarLink({ icon, label, onClick, href }: SidebarLinkProps) {
  const content = (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 0',
        fontSize: 11,
        fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
        color: '#1555B0',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.textDecoration = 'underline'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.textDecoration = 'none'
      }}
    >
      {icon && <img src={icon} alt="" style={{ width: 16, height: 16 }} />}
      {label}
    </span>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        {content}
      </a>
    )
  }

  return <div onClick={onClick}>{content}</div>
}

interface ExplorerItemProps {
  icon: string
  label: string
  selected?: boolean
  onSelect?: () => void
  onOpen?: () => void
  href?: string
}

function ExplorerItem({ icon, label, selected, onSelect, onOpen, href }: ExplorerItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.()
  }

  const handleDoubleClick = () => {
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer')
    } else {
      onOpen?.()
    }
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '4px 8px',
        cursor: 'default',
        minWidth: 180,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className={selected ? 'xp-icon-selected' : ''}>
        <img src={icon} alt="" style={{ width: 48, height: 48 }} draggable={false} />
      </div>
      <span
        style={{
          fontSize: 11,
          fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
          color: selected ? '#fff' : '#000',
          background: selected ? '#2b60f6' : 'transparent',
          padding: '1px 2px',
        }}
      >
        {label}
      </span>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: 8, marginTop: 16 }}>
      <div
        style={{
          fontWeight: 'bold',
          fontSize: 11,
          fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
          color: '#000',
          paddingBottom: 4,
        }}
      >
        {title}
      </div>
      <div
        style={{
          height: 1,
          background: 'linear-gradient(to right, #6B89D4, transparent)',
        }}
      />
    </div>
  )
}

interface ListItem {
  id: string
  name: string
  date: string
  href: string
}

const LIST_FONT = { fontSize: 11, fontFamily: 'Tahoma, Verdana, Arial, sans-serif' } as const

function ExplorerListView({
  items,
  selectedItem,
  onSelect,
}: {
  items: ListItem[]
  selectedItem: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #ACA899',
          background: 'linear-gradient(to bottom, #fff, #ECE9D8)',
          ...LIST_FONT,
        }}
      >
        <div style={{ width: 32, padding: '3px 8px', borderRight: '1px solid #ACA899', fontWeight: 'normal', textAlign: 'center' }}>#</div>
        <div style={{ flex: 2, padding: '3px 8px', borderRight: '1px solid #ACA899', fontWeight: 'normal' }}>Name</div>
        <div style={{ flex: 1, padding: '3px 8px', borderRight: '1px solid #ACA899', fontWeight: 'normal' }}>Date</div>
        <div style={{ flex: 1, padding: '3px 8px', fontWeight: 'normal' }}>Type</div>
      </div>
      {/* Rows */}
      {items.map((item, index) => {
        const isSelected = selectedItem === item.id
        return (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: isSelected ? '#2b60f6' : 'transparent',
              color: isSelected ? '#fff' : '#000',
              cursor: 'default',
              ...LIST_FONT,
            }}
            onClick={(e) => { e.stopPropagation(); onSelect(item.id) }}
            onDoubleClick={() => window.open(item.href, '_blank', 'noopener,noreferrer')}
          >
            <div style={{ width: 32, padding: '2px 8px', textAlign: 'center' }}>{index + 1}</div>
            <div style={{ flex: 2, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <img src="/places/folder.png" alt="" style={{ width: 16, height: 16 }} draggable={false} />
              {item.name}
            </div>
            <div style={{ flex: 1, padding: '2px 8px' }}>{item.date}</div>
            <div style={{ flex: 1, padding: '2px 8px' }}>File Folder</div>
          </div>
        )
      })}
    </div>
  )
}

export function MyComputerApp() {
  const openWindow = useSetAtom(openWindowAtom)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState<'root' | 'my-products' | 'weekly-projects' | 'open-source-projects'>('root')

  const openApp = useCallback(
    (appId: string) => {
      const app = getDesktopApp(appId)
      if (app) openWindow(app)
    },
    [openWindow]
  )

  const clearSelection = () => setSelectedItem(null)

  const navigateTo = (path: 'root' | 'my-products' | 'weekly-projects' | 'open-source-projects') => {
    setCurrentPath(path)
    setSelectedItem(null)
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}
      onClick={clearSelection}
    >
      {/* Menu bar */}
      <MenuBar
        menus={[
          {
            label: 'File',
            items: [
              { label: 'Create Shortcut', disabled: true },
              { label: 'Delete', disabled: true },
              { label: 'Rename', disabled: true },
              { label: 'Properties', disabled: true },
              { divider: true, label: '' },
              { label: 'Close' },
            ],
          },
          {
            label: 'Edit',
            items: [
              { label: 'Undo', disabled: true },
              { divider: true, label: '' },
              { label: 'Cut', disabled: true },
              { label: 'Copy', disabled: true },
              { label: 'Paste', disabled: true },
              { divider: true, label: '' },
              { label: 'Select All', disabled: true },
            ],
          },
          {
            label: 'View',
            items: [
              { label: 'Thumbnails', disabled: true },
              { label: 'Tiles', disabled: true },
              { label: 'Icons', disabled: true },
              { label: 'List', disabled: true },
              { label: 'Details', disabled: true },
            ],
          },
          {
            label: 'Favorites',
            items: [
              { label: 'Add to Favorites...', disabled: true },
              { label: 'Organize Favorites...', disabled: true },
            ],
          },
          {
            label: 'Tools',
            items: [
              { label: 'Map Network Drive...', disabled: true },
              { label: 'Disconnect Network Drive...', disabled: true },
              { divider: true, label: '' },
              { label: 'Folder Options...', disabled: true },
            ],
          },
          {
            label: 'Help',
            items: [
              { label: 'Help and Support Center', disabled: true },
              { divider: true, label: '' },
              { label: 'About ahpx-os', onClick: () => openApp('clock') },
            ],
          },
        ]}
      />

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '4px 4px',
          background: 'linear-gradient(to bottom, #F6F8FB, #E8ECF4)',
          borderBottom: '1px solid #ACA899',
          fontSize: 11,
          fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
        }}
      >
        <ToolbarButton label="Back" disabled={currentPath === 'root'} onPress={() => navigateTo('root')}>
          <img src="/xp-icons/Back.png" alt="" style={{ width: 30, height: 30 }} />
        </ToolbarButton>
        <ToolbarButton disabled>
          <img src="/xp-icons/Forward.png" alt="" style={{ width: 30, height: 30 }} />
        </ToolbarButton>
        <ToolbarButton disabled={currentPath === 'root'} onPress={() => navigateTo('root')}>
          <img src="/xp-icons/Up.png" alt="" style={{ width: 30, height: 30 }} />
        </ToolbarButton>
        <div style={{ width: 1, height: 22, background: '#ACA899', margin: '0 4px' }} />
        <ToolbarButton label="Search">
          <img src="/xp-icons/Search.png" alt="" style={{ width: 30, height: 30 }} />
        </ToolbarButton>
        <ToolbarButton label="Folders">
          <img src="/xp-icons/FolderView.png" alt="" style={{ width: 30, height: 30 }} />
        </ToolbarButton>
      </div>

      {/* Address bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 6px',
          background: '#F6F8FB',
          borderBottom: '1px solid #ACA899',
          fontSize: 11,
          fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
        }}
      >
        <span style={{ color: '#666', whiteSpace: 'nowrap' }}>Address</span>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: '#fff',
            border: '1px solid #7F9DB9',
            borderRadius: 1,
            padding: '1px 4px',
          }}
        >
          <img src="/devices/system.png" alt="" style={{ width: 16, height: 16 }} />
          <span>
            {currentPath === 'root'
              ? 'My Computer'
              : currentPath === 'my-products'
                ? 'My Computer > My Products'
                : currentPath === 'weekly-projects'
                  ? 'My Computer > Weekly Projects'
                  : 'My Computer > Open Source Projects'}
          </span>
        </div>
        <button
          style={{
            fontSize: 11,
            padding: '1px 8px',
            fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
            background: 'linear-gradient(to bottom, #fff, #E3E3DB)',
            border: '1px solid #ACA899',
            borderRadius: 2,
            cursor: 'pointer',
            color: '#000',
          }}
        >
          Go
        </button>
      </div>

      {/* Main content area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div
          style={{
            width: 200,
            minWidth: 200,
            background: 'linear-gradient(to bottom, #7889f7, #4758cd)',
            padding: 10,
            overflowY: 'auto',
          }}
        >
          <TaskPanel title="System Tasks" color="blue">
            <SidebarLink
              icon="/apps/config-date.png"
              label="View system information"
              onClick={() => openApp('clock')}
            />
            <SidebarLink
              icon="/apps/utilities-terminal.png"
              label="Open terminal"
              onClick={() => openApp('terminal')}
            />
          </TaskPanel>

          <TaskPanel title="Other Places" color="blue">
            <SidebarLink
              icon="/places/folder-documents.png"
              label="My Documents"
              onClick={() => openApp('blogs')}
            />
            <SidebarLink
              icon="/places/gnome-fs-network.png"
              label="My Network Places"
            />
            <SidebarLink
              icon="/places/gnome-fs-desktop.png"
              label="Desktop"
            />
          </TaskPanel>

          <TaskPanel title="Details" color="blue">
            <div style={{ fontSize: 11, fontFamily: 'Tahoma, Verdana, Arial, sans-serif', color: '#000' }}>
              <div style={{ marginBottom: 6 }}>
                <strong>ahpx-os</strong>
              </div>
              <div style={{ color: '#444', lineHeight: 1.5 }}>
                Web OS interface running in the browser. Built with React + Vite.
              </div>
              <div style={{ marginTop: 8 }}>
                <SidebarLink
                  icon="/places/gnome-fs-web.png"
                  label="GitHub"
                  href="https://github.com/nicepkg/nice-xp"
                />
              </div>
            </div>
          </TaskPanel>
        </div>

        {/* Right content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: currentPath === 'weekly-projects' ? 0 : '4px 16px 16px',
            background: '#fff',
          }}
        >
          {currentPath === 'my-products' ? (
            <>
              <SectionHeader title="My Products" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 8 }}>
                <ExplorerItem
                  icon="/places/folder.png"
                  label="ContextFlow"
                  selected={selectedItem === 'contextflow'}
                  onSelect={() => setSelectedItem('contextflow')}
                  href="https://getcontextflow.app"
                />
                <ExplorerItem
                  icon="/places/folder.png"
                  label="Taoracle"
                  selected={selectedItem === 'taoracle'}
                  onSelect={() => setSelectedItem('taoracle')}
                  href="https://taoracle.com"
                />
                <ExplorerItem
                  icon="/places/folder.png"
                  label="readaware"
                  selected={selectedItem === 'readaware'}
                  onSelect={() => setSelectedItem('readaware')}
                  href="https://readaware.app"
                />
              </div>
            </>
          ) : currentPath === 'open-source-projects' ? (
            <>
              <SectionHeader title="Open Source Projects" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 8 }}>
                <ExplorerItem
                  icon="/places/folder.png"
                  label="open-dictionary"
                  selected={selectedItem === 'open-dictionary'}
                  onSelect={() => setSelectedItem('open-dictionary')}
                  href="https://github.com/ahpxex/open-dictionary"
                />
                <ExplorerItem
                  icon="/places/folder.png"
                  label="Aictionary"
                  selected={selectedItem === 'aictionary'}
                  onSelect={() => setSelectedItem('aictionary')}
                  href="https://github.com/ahpxex/Aictionary"
                />
              </div>
            </>
          ) : currentPath === 'weekly-projects' ? (
            <ExplorerListView
                selectedItem={selectedItem}
                onSelect={setSelectedItem}
                items={weeklyProjects}
              />
          ) : (
            <>
              <SectionHeader title="Files Stored on This Computer" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 8 }}>
            <ExplorerItem
              icon="/devices/stock_briefcase.png"
              label="My Products"
              selected={selectedItem === 'products'}
              onSelect={() => setSelectedItem('products')}
              onOpen={() => navigateTo('my-products')}
            />
            <ExplorerItem
              icon="/apps/xfce-schedule.png"
              label="Weekly Projects"
              selected={selectedItem === 'weekly'}
              onSelect={() => setSelectedItem('weekly')}
              onOpen={() => navigateTo('weekly-projects')}
            />
            <ExplorerItem
              icon="/places/gnome-fs-network.png"
              label="Open Source Projects"
              selected={selectedItem === 'oss'}
              onSelect={() => setSelectedItem('oss')}
              onOpen={() => navigateTo('open-source-projects')}
            />
          </div>

          <SectionHeader title="Hard Disk Drives" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 8 }}>
            <ExplorerItem
              icon="/devices/gnome-dev-harddisk.png"
              label="Local Disk (C:)"
              selected={selectedItem === 'disk-c'}
              onSelect={() => setSelectedItem('disk-c')}
            />
          </div>

          <SectionHeader title="Devices with Removable Storage" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 8 }}>
            <ExplorerItem
              icon="/devices/drive-optical.png"
              label="CD Drive (D:)"
              selected={selectedItem === 'cd-drive'}
              onSelect={() => setSelectedItem('cd-drive')}
            />
          </div>

          <SectionHeader title="Links" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 8 }}>
            <ExplorerItem
              icon="/places/gnome-fs-web.png"
              label="GitHub"
              selected={selectedItem === 'github'}
              onSelect={() => setSelectedItem('github')}
              href="https://github.com/ahpx"
            />
            <ExplorerItem
              icon="/apps/internet-mail.png"
              label="Twitter"
              selected={selectedItem === 'twitter'}
              onSelect={() => setSelectedItem('twitter')}
              href="https://twitter.com/ofshawnfan"
            />
            <ExplorerItem
              icon="/apps/web-browser.png"
              label="Blog"
              selected={selectedItem === 'blog'}
              onSelect={() => setSelectedItem('blog')}
              href="https://blog.ahpx.me"
            />
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ToolbarButton({
  label,
  disabled,
  children,
  onPress,
}: {
  label?: string
  disabled?: boolean
  children: React.ReactNode
  onPress?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      disabled={disabled}
      onClick={onPress}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        padding: '2px 6px',
        border: hovered && !disabled ? '1px solid #ACA899' : '1px solid transparent',
        borderRadius: 3,
        background: hovered && !disabled ? '#E8E8E8' : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontSize: 11,
        fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
        color: '#000',
        boxShadow: 'none',
        outline: 'none',
        minWidth: 0,
        minHeight: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {label && <span>{label}</span>}
    </button>
  )
}
