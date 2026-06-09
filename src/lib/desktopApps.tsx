import { ClockApp } from '@/apps/ClockApp'
import { MyComputerApp } from '@/apps/MyComputerApp'
import { NotepadApp } from '@/apps/NotepadApp'
import { TerminalApp } from '@/apps/TerminalApp'
import { NOTEPAD_APP_ID } from '@/apps/notepad/shared'
import {
  SYSTEM_PROFILE_ICON,
  SYSTEM_PROFILE_ID,
  SYSTEM_PROFILE_NAME,
} from '@/lib/localData'
import type { WindowConfig } from '@/types/window'

export const desktopApps: WindowConfig[] = [
  {
    id: SYSTEM_PROFILE_ID,
    title: SYSTEM_PROFILE_NAME,
    icon: SYSTEM_PROFILE_ICON,
    component: MyComputerApp,
    initialSize: { width: 750, height: 550 },
  },
  {
    id: 'clock',
    title: 'Clock',
    icon: '/apps/config-date.png',
    component: ClockApp,
    initialSize: { width: 600, height: 550 },
  },
  {
    id: 'terminal',
    title: 'Command Prompt',
    icon: '/apps/windows-command-prompt.png',
    component: TerminalApp,
    initialSize: { width: 700, height: 450 },
  },
  {
    id: NOTEPAD_APP_ID,
    title: 'Untitled - Notepad',
    icon: '/apps/gedit.png',
    component: NotepadApp,
    initialSize: { width: 640, height: 480 },
  },
]

export function getDesktopApp(appId: string) {
  return desktopApps.find((app) => app.id === appId) ?? null
}
