import { atom } from 'jotai'

/**
 * Document state for the (singleton) Notepad app.
 *
 * These live at module scope rather than inside the component because the
 * desktop's WindowFrame remounts an app's React tree when the window is
 * minimized, maximized or closed (it swaps a react-rnd wrapper for a plain
 * container). Component-local state would be wiped by those operations, which
 * for a text editor means silent data loss. Owning the document model here lets
 * the text survive every window operation for the lifetime of the session.
 */
export const notepadContentAtom = atom<string>('')
export const notepadFileNameAtom = atom<string | null>(null)
export const notepadDirtyAtom = atom<boolean>(false)
