import { useState, useRef, useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { getISOWeek } from 'date-fns'
import { openWindowAtom } from '@/store/actions'
import { myComputerPathAtom, type MyComputerPath } from '@/store/appAtoms'
import { getDesktopApp } from '@/lib/desktopApps'
import { SYSTEM_PROFILE_ID } from '@/lib/localData'

const MENU_FONT = { fontSize: 11, fontFamily: 'Tahoma, Verdana, Arial, sans-serif' } as const

const TIMES = "'Times New Roman', Times, 'Songti SC', serif"
const LINK_BLUE = '#0000EE'

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

function OldLink({
  href,
  onClick,
  children,
}: {
  href?: string
  onClick?: () => void
  children: React.ReactNode
}) {
  const style: React.CSSProperties = {
    color: LINK_BLUE,
    textDecoration: 'underline',
    cursor: 'pointer',
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
        {children}
      </a>
    )
  }
  return (
    <span style={style} onClick={onClick}>
      {children}
    </span>
  )
}

function Rule() {
  return <hr style={{ border: 'none', borderTop: '1px solid #999', margin: '18px 0' }} />
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: TIMES, fontSize: 20, fontWeight: 'bold', margin: '22px 0 10px' }}>
      {children}
    </h2>
  )
}

function LandingPage() {
  const openWindow = useSetAtom(openWindowAtom)
  const setMyComputerPath = useSetAtom(myComputerPathAtom)
  const week = getISOWeek(new Date())

  const openFolder = (path: MyComputerPath) => () => {
    setMyComputerPath(path)
    const app = getDesktopApp(SYSTEM_PROFILE_ID)
    if (app) openWindow(app)
  }

  return (
    <div style={{ background: '#fff', minHeight: '100%' }}>
      <div
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '26px 24px 40px',
          fontFamily: TIMES,
          fontSize: 16,
          color: '#000',
          lineHeight: 1.55,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: TIMES, fontSize: 30, fontWeight: 'bold', margin: '6px 0 4px' }}>
            Shawn's Homepage
          </h1>
          <div style={{ fontSize: 13, color: '#666' }}>AHpx&ensp;·&ensp;Beijing&ensp;·&ensp;est. 2026</div>
        </div>

        <Rule />

        <p style={{ margin: '0 0 10px' }}>
          Welcome. I'm Shawn. I make small, quiet software — tools that do one thing,
          say it plainly, and stay out of your way. This page is just the table of
          contents; the actual exhibits live in{' '}
          <OldLink onClick={openFolder('root')}>My Computer</OldLink>.
        </p>

        <SectionTitle>My Products</SectionTitle>

        <div style={{ marginBottom: 16 }}>
          <b><OldLink href="https://getcontextflow.app">ContextFlow</OldLink></b>
          <br />
          A Chrome extension that guards your attention while you read the web.
          <br />
          <span style={{ fontSize: 13, color: '#666' }}>getcontextflow.app</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <b><OldLink href="https://taoracle.com">Taoracle</OldLink></b>
          <br />
          Chinese divination — almanac, Zi Wei, Liu Yao — as one continuous journey.
          卜以决疑，不疑何卜。
          <br />
          <span style={{ fontSize: 13, color: '#666' }}>taoracle.com</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <b><OldLink href="https://readaware.app">ReadAware</OldLink></b>
          <br />
          A co-reading companion with memory. It reads with you, not for you.
          <br />
          <span style={{ fontSize: 13, color: '#666' }}>readaware.app</span>
        </div>

        <div style={{ fontSize: 14 }}>
          See also:{' '}
          <OldLink onClick={openFolder('my-products')}>My Computer &gt; My Products</OldLink>
        </div>

        <SectionTitle>Weekly Projects</SectionTitle>

        <p style={{ margin: '0 0 14px' }}>
          One side project every week since January 2026 — small experiments,
          shipped on a deadline. This is week {week}. A few I'm fond of:
        </p>

        <div style={{ marginBottom: 16 }}>
          <b><OldLink href="https://github.com/ahpxex/open-dashboard">open-dashboard</OldLink></b>
          <br />
          A catalogue of copy-ready admin-UI shapes an AI agent installs and composes
          into a working back-office.
          <br />
          <span style={{ fontSize: 13, color: '#666' }}>week 25</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <b><OldLink href="https://github.com/ahpxex/paperhands">paperhands</OldLink></b>
          <br />
          A quiet crypto paper-trading terminal — simulated money, real prices, no excuses.
          <br />
          <span style={{ fontSize: 13, color: '#666' }}>week 21</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <b><OldLink href="https://github.com/ahpxex/map-memory">map-memory</OldLink></b>
          <br />
          A drill for the shape of the world — countries and Chinese prefectures, from memory.
          <br />
          <span style={{ fontSize: 13, color: '#666' }}>week 13</span>
        </div>

        <div style={{ fontSize: 14 }}>
          Full list:{' '}
          <OldLink onClick={openFolder('weekly-projects')}>
            My Computer &gt; Weekly Projects
          </OldLink>
        </div>

        <SectionTitle>Open Source</SectionTitle>

        <ul style={{ margin: '0 0 10px', paddingLeft: 24 }}>
          <li style={{ marginBottom: 6 }}>
            <OldLink href="https://github.com/ahpxex/open-dictionary">open-dictionary</OldLink>
            {' '}— a genuinely open dictionary, grounded in Wiktionary, explained by LLMs.
          </li>
          <li>
            <OldLink href="https://github.com/ahpxex/Aictionary">Aictionary</OldLink>
            {' '}— a desktop dictionary fast enough to think with.
          </li>
        </ul>

        <div style={{ fontSize: 14 }}>
          See also:{' '}
          <OldLink onClick={openFolder('open-source-projects')}>
            My Computer &gt; Open Source Projects
          </OldLink>
        </div>

        <SectionTitle>My Pictures</SectionTitle>

        <p style={{ margin: '0 0 12px' }}>
          Thirty-one photographs, 2024–2026 — overexposure, film grain, the usual.
          The full album lives in{' '}
          <OldLink onClick={openFolder('my-pictures')}>My Computer &gt; My Pictures</OldLink>.
        </p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          {[
            { src: '/photos/thumb/img_3425.jpg', alt: '车窗里的火山' },
            { src: '/photos/thumb/apx_8195_dxo.jpg', alt: '回家的弯路' },
            { src: '/photos/thumb/dsc_3551_dxo.jpg', alt: '港口日落' },
          ].map((p) => (
            <img
              key={p.src}
              src={p.src}
              alt={p.alt}
              title={p.alt}
              style={{
                width: 188,
                height: 125,
                objectFit: 'cover',
                border: '1px solid #999',
                padding: 2,
                background: '#fff',
                boxSizing: 'content-box',
              }}
              draggable={false}
            />
          ))}
        </div>

        <SectionTitle>Elsewhere</SectionTitle>

        <ul style={{ margin: 0, paddingLeft: 24 }}>
          <li style={{ marginBottom: 4 }}>
            <OldLink href="https://blog.ahpx.me">Blog</OldLink>
            {' '}<span style={{ fontSize: 13, color: '#666' }}>blog.ahpx.me</span>
          </li>
          <li style={{ marginBottom: 4 }}>
            <OldLink href="https://github.com/ahpxex">GitHub</OldLink>
            {' '}<span style={{ fontSize: 13, color: '#666' }}>github.com/ahpxex</span>
          </li>
          <li>
            <OldLink href="https://twitter.com/ahpxex">Twitter</OldLink>
            {' '}<span style={{ fontSize: 13, color: '#666' }}>@ahpxex</span>
          </li>
        </ul>

        <Rule />

        <div style={{ textAlign: 'center', fontSize: 12.5, color: '#666' }}>
          Last updated 2026-06-10 · Best viewed in Internet Explorer 6.0 at 1024×768
          <br />
          Rendered inside a window of ahpx-os.
        </div>
      </div>
    </div>
  )
}

export function HomepageApp() {
  const openWindow = useSetAtom(openWindowAtom)
  const contentRef = useRef<HTMLDivElement>(null)

  const openApp = (appId: string) => {
    const app = getDesktopApp(appId)
    if (app) openWindow(app)
  }

  const scrollToTop = () => {
    contentRef.current?.querySelector('[data-ie-content]')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const externalLink = (href: string) => () => window.open(href, '_blank', 'noopener,noreferrer')

  return (
    <div
      ref={contentRef}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}
    >
      <MenuBar
        menus={[
          {
            label: 'File',
            items: [
              { label: 'New Window', disabled: true },
              { label: 'Open...', disabled: true },
              { label: 'Save As...', disabled: true },
              { divider: true, label: '' },
              { label: 'Close' },
            ],
          },
          {
            label: 'Edit',
            items: [
              { label: 'Cut', disabled: true },
              { label: 'Copy', disabled: true },
              { label: 'Paste', disabled: true },
              { divider: true, label: '' },
              { label: 'Find (on This Page)...', disabled: true },
            ],
          },
          {
            label: 'View',
            items: [
              { label: 'Toolbars', disabled: true },
              { label: 'Text Size', disabled: true },
              { label: 'Source', disabled: true },
              { divider: true, label: '' },
              { label: 'Full Screen', disabled: true },
            ],
          },
          {
            label: 'Favorites',
            items: [
              { label: 'Add to Favorites...', disabled: true },
              { divider: true, label: '' },
              { label: 'Blog', onClick: externalLink('https://blog.ahpx.me') },
              { label: 'GitHub', onClick: externalLink('https://github.com/ahpxex') },
              { label: 'Twitter', onClick: externalLink('https://twitter.com/ahpxex') },
            ],
          },
          {
            label: 'Tools',
            items: [
              { label: 'Pop-up Blocker', disabled: true },
              { label: 'Internet Options...', disabled: true },
            ],
          },
          {
            label: 'Help',
            items: [
              { label: 'Help and Support Center', disabled: true },
              { divider: true, label: '' },
              { label: 'About Aindows XP', onClick: () => openApp('clock') },
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
        <ToolbarButton label="Back" disabled>
          <img src="/xp-icons/Back.png" alt="" style={{ width: 30, height: 30 }} />
        </ToolbarButton>
        <ToolbarButton disabled>
          <img src="/xp-icons/Forward.png" alt="" style={{ width: 30, height: 30 }} />
        </ToolbarButton>
        <ToolbarButton>
          <img src="/xp-icons/Stop.png" alt="" style={{ width: 24, height: 24, padding: 3 }} />
        </ToolbarButton>
        <ToolbarButton onPress={scrollToTop}>
          <img src="/xp-icons/Refresh.png" alt="" style={{ width: 24, height: 24, padding: 3 }} />
        </ToolbarButton>
        <ToolbarButton onPress={scrollToTop}>
          <img src="/xp-icons/Home.png" alt="" style={{ width: 24, height: 24, padding: 3 }} />
        </ToolbarButton>
        <div style={{ width: 1, height: 22, background: '#ACA899', margin: '0 4px' }} />
        <ToolbarButton label="Search">
          <img src="/xp-icons/Search.png" alt="" style={{ width: 30, height: 30 }} />
        </ToolbarButton>
        <ToolbarButton label="Favorites">
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
            padding: '2px 4px',
          }}
        >
          <img src="/xp-icons/IEPage.png" alt="" style={{ width: 14, height: 14 }} />
          <span>https://ahpx.me/</span>
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

      {/* Page content */}
      <div data-ie-content style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>
        <LandingPage />
      </div>

      {/* Status bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px 6px',
          borderTop: '1px solid #ACA899',
          background: '#ECE9D8',
          fontSize: 11,
          fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
          color: '#000',
        }}
      >
        <span>Done</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <img src="/places/gnome-fs-web.png" alt="" style={{ width: 14, height: 14 }} />
          Internet
        </span>
      </div>
    </div>
  )
}
