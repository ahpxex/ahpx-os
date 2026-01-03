import { Clock } from './Clock'
import { Menu, MenuBar } from './Menu'

export function TopBar() {
  const logoMenuItems = [
    { label: 'About ahpx-os', onClick: () => console.log('About') },
    { divider: true as const },
    { label: 'System Preferences...', disabled: true },
    { divider: true as const },
    { label: 'Sleep', disabled: true },
    { label: 'Restart', onClick: () => window.location.reload() },
    { label: 'Shut Down', disabled: true },
  ]

  const fileMenuItems = [
    { label: 'New Window', shortcut: 'Cmd+N', disabled: true },
    { label: 'Open...', shortcut: 'Cmd+O', disabled: true },
    { divider: true as const },
    { label: 'Close Window', shortcut: 'Cmd+W', disabled: true },
  ]

  const editMenuItems = [
    { label: 'Undo', shortcut: 'Cmd+Z', disabled: true },
    { label: 'Redo', shortcut: 'Cmd+Shift+Z', disabled: true },
    { divider: true as const },
    { label: 'Cut', shortcut: 'Cmd+X', disabled: true },
    { label: 'Copy', shortcut: 'Cmd+C', disabled: true },
    { label: 'Paste', shortcut: 'Cmd+V', disabled: true },
    { label: 'Select All', shortcut: 'Cmd+A', disabled: true },
  ]

  const viewMenuItems = [
    { label: 'Show Desktop Icons', disabled: true },
    { divider: true as const },
    { label: 'Enter Full Screen', shortcut: 'Cmd+Ctrl+F', disabled: true },
  ]

  const helpMenuItems = [
    { label: 'ahpx-os Help', shortcut: 'Cmd+?', disabled: true },
    { divider: true as const },
    { label: 'Documentation', onClick: () => window.open('https://github.com/ahpx', '_blank') },
    { label: 'Report an Issue', disabled: true },
  ]

  return (
    <header className="z-[1000] flex h-10 w-full shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-white px-4">
      <MenuBar>
        <Menu id="logo" label="ahpx-os" items={logoMenuItems} isLogo />
        <Menu id="file" label="File" items={fileMenuItems} />
        <Menu id="edit" label="Edit" items={editMenuItems} />
        <Menu id="view" label="View" items={viewMenuItems} />
        <Menu id="help" label="Help" items={helpMenuItems} />
      </MenuBar>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <Clock />
      </div>
    </header>
  )
}
