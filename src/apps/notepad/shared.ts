export const NOTEPAD_APP_ID = 'notepad'

export type FontStyle = 'regular' | 'italic' | 'bold' | 'bold-italic'

export interface NotepadFont {
  family: string
  style: FontStyle
  size: number // in points, matching the XP Font dialog
}

export interface PageSetup {
  header: string
  footer: string
  orientation: 'portrait' | 'landscape'
  margins: { left: number; right: number; top: number; bottom: number } // inches
}

export interface NotepadPrefs {
  wordWrap: boolean
  statusBar: boolean
  font: NotepadFont
  page: PageSetup
}

// Fonts the XP Font dialog would list. Web-safe choices that render across platforms;
// the dialog preview always uses the real font, so unavailable ones fall back gracefully.
export const FONT_FAMILIES = [
  'Lucida Console',
  'Consolas',
  'Courier New',
  'Arial',
  'Comic Sans MS',
  'Fixedsys',
  'Georgia',
  'Microsoft Sans Serif',
  'Segoe UI',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
] as const

export const FONT_STYLES: { value: FontStyle; label: string }[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'italic', label: 'Italic' },
  { value: 'bold', label: 'Bold' },
  { value: 'bold-italic', label: 'Bold Italic' },
]

export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72] as const

export const DEFAULT_PREFS: NotepadPrefs = {
  wordWrap: false,
  statusBar: false,
  font: { family: 'Lucida Console', style: 'regular', size: 10 },
  page: {
    header: '&f',
    footer: 'Page &p',
    orientation: 'portrait',
    margins: { left: 0.75, right: 0.75, top: 1, bottom: 1 },
  },
}

const PREFS_KEY = 'ahpx-os-notepad'

export function ptToPx(pt: number): number {
  return Math.round((pt * 96) / 72)
}

export function fontWeight(style: FontStyle): number {
  return style === 'bold' || style === 'bold-italic' ? 700 : 400
}

export function fontItalic(style: FontStyle): 'italic' | 'normal' {
  return style === 'italic' || style === 'bold-italic' ? 'italic' : 'normal'
}

export function loadPrefs(): NotepadPrefs {
  if (typeof window === 'undefined' || !window.localStorage) return clonePrefs(DEFAULT_PREFS)
  try {
    const raw = window.localStorage.getItem(PREFS_KEY)
    if (!raw) return clonePrefs(DEFAULT_PREFS)
    const parsed = JSON.parse(raw) as Partial<NotepadPrefs>
    return {
      wordWrap: parsed.wordWrap ?? DEFAULT_PREFS.wordWrap,
      statusBar: parsed.statusBar ?? DEFAULT_PREFS.statusBar,
      font: { ...DEFAULT_PREFS.font, ...parsed.font },
      page: {
        ...DEFAULT_PREFS.page,
        ...parsed.page,
        margins: { ...DEFAULT_PREFS.page.margins, ...parsed.page?.margins },
      },
    }
  } catch {
    return clonePrefs(DEFAULT_PREFS)
  }
}

export function savePrefs(prefs: NotepadPrefs): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

function clonePrefs(prefs: NotepadPrefs): NotepadPrefs {
  return JSON.parse(JSON.stringify(prefs)) as NotepadPrefs
}

// Strip a single trailing extension for the window title (XP shows "todo - Notepad").
export function documentTitle(fileName: string | null): string {
  const base = fileName ? fileName.replace(/\.[^./\\]+$/, '') : 'Untitled'
  return `${base} - Notepad`
}
