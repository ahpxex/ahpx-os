import { useState, useCallback } from 'react'
import { useSetAtom } from 'jotai'
import { openWindowAtom } from '@/store/actions'
import { getDesktopApp } from '@/lib/desktopApps'

interface TaskPanelProps {
  title: string
  color: 'blue' | 'green' | 'purple'
  defaultOpen?: boolean
  children: React.ReactNode
}

const panelColors = {
  blue: {
    header: 'linear-gradient(to right, #2B5EA7, #6BA0E0)',
    headerText: '#fff',
    bg: '#D6DFF7',
    border: '#85ABE0',
  },
  green: {
    header: 'linear-gradient(to right, #3C8A3F, #7CC47F)',
    headerText: '#fff',
    bg: '#D6F7D6',
    border: '#85E085',
  },
  purple: {
    header: 'linear-gradient(to right, #7B5EA7, #B09CD2)',
    headerText: '#fff',
    bg: '#E8DFF7',
    border: '#B09CD2',
  },
}

function TaskPanel({ title, color, defaultOpen = true, children }: TaskPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const c = panelColors[color]

  return (
    <div
      style={{
        borderRadius: 5,
        overflow: 'hidden',
        border: `1px solid ${c.border}`,
        marginBottom: 8,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '6px 10px',
          background: c.header,
          color: c.headerText,
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: 11,
          fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: 10 }}>{open ? '\u25B2' : '\u25BC'}</span>
      </button>
      {open && (
        <div style={{ background: c.bg, padding: '8px 10px' }}>
          {children}
        </div>
      )}
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
  onClick?: () => void
  href?: string
}

function ExplorerItem({ icon, label, onClick, href }: ExplorerItemProps) {
  const [hovered, setHovered] = useState(false)

  const inner = (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '4px 8px',
        borderRadius: 3,
        cursor: 'pointer',
        background: hovered ? '#E8E8E8' : 'transparent',
        minWidth: 180,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img src={icon} alt="" style={{ width: 48, height: 48 }} />
      <span
        style={{
          fontSize: 11,
          fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
          color: href ? '#1555B0' : '#000',
          textDecoration: href && hovered ? 'underline' : 'none',
        }}
      >
        {label}
      </span>
    </div>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
        onClick={onClick}
      >
        {inner}
      </a>
    )
  }

  return <div onClick={onClick}>{inner}</div>
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

export function MyComputerApp() {
  const openWindow = useSetAtom(openWindowAtom)

  const openApp = useCallback(
    (appId: string) => {
      const app = getDesktopApp(appId)
      if (app) openWindow(app)
    },
    [openWindow]
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '2px 4px',
          background: 'linear-gradient(to bottom, #F6F8FB, #E8ECF4)',
          borderBottom: '1px solid #ACA899',
          fontSize: 11,
          fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
        }}
      >
        <ToolbarButton label="Back" disabled>
          <NavArrow direction="left" />
        </ToolbarButton>
        <ToolbarButton disabled>
          <NavArrow direction="right" />
        </ToolbarButton>
        <ToolbarButton>
          <NavArrow direction="up" />
        </ToolbarButton>
        <div style={{ width: 1, height: 22, background: '#ACA899', margin: '0 4px' }} />
        <ToolbarButton label="Search">
          <img src="/apps/system-search.png" alt="" style={{ width: 20, height: 20 }} />
        </ToolbarButton>
        <ToolbarButton label="Folders">
          <img src="/places/folder.png" alt="" style={{ width: 20, height: 20 }} />
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
          <span>My Computer</span>
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
            background: 'linear-gradient(to bottom, #6B89D4, #3C6ECF)',
            padding: 8,
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
            padding: '4px 16px 16px',
            background: '#fff',
          }}
        >
          <SectionHeader title="Files Stored on This Computer" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 8 }}>
            <ExplorerItem
              icon="/places/folder-documents.png"
              label="Shared Documents"
              onClick={() => openApp('blogs')}
            />
            <ExplorerItem
              icon="/places/folder_home.png"
              label="User's Documents"
              onClick={() => openApp('profile-ahpx')}
            />
          </div>

          <SectionHeader title="Hard Disk Drives" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 8 }}>
            <ExplorerItem
              icon="/devices/gnome-dev-harddisk.png"
              label="Local Disk (C:)"
            />
          </div>

          <SectionHeader title="Devices with Removable Storage" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 8 }}>
            <ExplorerItem
              icon="/devices/drive-optical.png"
              label="CD Drive (D:)"
            />
          </div>

          <SectionHeader title="About Me :)" />
          <div
            style={{
              height: 1,
              background: 'linear-gradient(to right, #6B89D4, transparent)',
              marginBottom: 12,
              marginTop: -8,
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 8 }}>
            <ExplorerItem
              icon="/places/gnome-fs-web.png"
              label="GitHub"
              href="https://github.com/ahpx"
            />
            <ExplorerItem
              icon="/places/user-home.png"
              label="My Website"
              href="https://ahpx.dev"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function NavArrow({ direction }: { direction: 'left' | 'right' | 'up' }) {
  const rotation = direction === 'left' ? '90deg' : direction === 'right' ? '-90deg' : '0deg'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" style={{ transform: `rotate(${rotation})` }}>
      <circle cx="10" cy="10" r="9" fill="#3C8A3F" stroke="#2D6B2F" strokeWidth="1" />
      <path d="M6 12 L10 6 L14 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function ToolbarButton({
  label,
  disabled,
  children,
}: {
  label?: string
  disabled?: boolean
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      disabled={disabled}
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
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {label && <span>{label}</span>}
    </button>
  )
}
