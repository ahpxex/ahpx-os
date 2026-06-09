import { useCallback, useEffect, useRef, useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { format } from 'date-fns'
import { closeWindowAtom, updateWindowTitleAtom } from '@/store/actions'
import { useWindowContextMenu } from '@/contexts/WindowContextMenuContext'
import { notepadContentAtom, notepadDirtyAtom, notepadFileNameAtom } from './notepad/state'
import {
  AboutDialog,
  FindDialog,
  FontDialog,
  GoToDialog,
  MessageBox,
  type MessageBoxButton,
  PageSetupDialog,
  ReplaceDialog,
} from './notepad/dialogs'
import {
  documentTitle,
  fontItalic,
  fontWeight,
  loadPrefs,
  NOTEPAD_APP_ID,
  type NotepadFont,
  type NotepadPrefs,
  type PageSetup,
  ptToPx,
  savePrefs,
} from './notepad/shared'

type DialogKind = 'find' | 'replace' | 'goto' | 'font' | 'pagesetup' | 'about' | null

interface SearchState {
  term: string
  replaceWith: string
  matchCase: boolean
  direction: 'up' | 'down'
}

interface MessageBoxState {
  title: string
  message: React.ReactNode
  buttons: MessageBoxButton[]
  width?: number
  resolve: (value: string) => void
}

/* ----- Menu bar ----- */

interface MenuItemDef {
  label?: string
  shortcut?: string
  onClick?: () => void
  disabled?: boolean
  checked?: boolean
  divider?: boolean
}

interface MenuDef {
  label: string
  items: MenuItemDef[]
}

function NotepadMenuBar({ menus }: { menus: MenuDef[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (openIndex === null) return
    const handleDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpenIndex(null)
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIndex(null)
    }
    document.addEventListener('mousedown', handleDown)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleDown)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [openIndex])

  return (
    <div ref={barRef} className="np-menubar">
      {menus.map((menu, i) => (
        <div key={menu.label} style={{ position: 'relative' }}>
          <div
            className={`np-menu-trigger ${openIndex === i ? 'np-open' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault()
              setOpenIndex(openIndex === i ? null : i)
            }}
            onMouseEnter={() => {
              if (openIndex !== null) setOpenIndex(i)
            }}
          >
            {menu.label}
          </div>
          {openIndex === i && (
            <div className="np-menu-dropdown">
              {menu.items.map((item, j) =>
                item.divider ? (
                  <div key={j} className="np-menu-divider" />
                ) : (
                  <div
                    key={j}
                    className={`np-menu-item ${item.disabled ? 'np-disabled' : ''}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (item.disabled) return
                      item.onClick?.()
                      setOpenIndex(null)
                    }}
                  >
                    <span className="np-menu-check">{item.checked ? '✓' : ''}</span>
                    <span>{item.label}</span>
                    <span className="np-menu-shortcut">{item.shortcut ?? ''}</span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ----- Helpers ----- */

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function downloadText(name: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ----- App ----- */

export function NotepadApp() {
  const closeWindow = useSetAtom(closeWindowAtom)
  const updateWindowTitle = useSetAtom(updateWindowTitleAtom)
  const { setContextMenuItems, clearContextMenuItems } = useWindowContextMenu()

  const [content, setContent] = useAtom(notepadContentAtom)
  const [fileName, setFileName] = useAtom(notepadFileNameAtom)
  const [dirty, setDirty] = useAtom(notepadDirtyAtom)

  const [prefs, setPrefs] = useState<NotepadPrefs>(() => loadPrefs())
  const [caret, setCaret] = useState({ line: 1, col: 1 })
  const [hasSelection, setHasSelection] = useState(false)
  const [activeDialog, setActiveDialog] = useState<DialogKind>(null)
  const [search, setSearch] = useState<SearchState>({
    term: '',
    replaceWith: '',
    matchCase: false,
    direction: 'down',
  })
  const [messageBox, setMessageBox] = useState<MessageBoxState | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messageBoxRef = useRef<MessageBoxState | null>(null)
  useEffect(() => {
    messageBoxRef.current = messageBox
  }, [messageBox])

  /* ----- Title ----- */
  useEffect(() => {
    updateWindowTitle({ windowId: NOTEPAD_APP_ID, title: documentTitle(fileName) })
  }, [fileName, updateWindowTitle])

  /* ----- Preferences ----- */
  const updatePrefs = useCallback((updater: (p: NotepadPrefs) => NotepadPrefs) => {
    setPrefs((prev) => {
      const next = updater(prev)
      savePrefs(next)
      return next
    })
  }, [])

  /* ----- Caret / selection tracking ----- */
  const syncCaret = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    const pos = ta.selectionStart
    const upto = ta.value.slice(0, pos)
    const lastNewline = upto.lastIndexOf('\n')
    setCaret({ line: upto.split('\n').length, col: pos - lastNewline })
    setHasSelection(ta.selectionStart !== ta.selectionEnd)
  }, [])

  const refocus = useCallback(() => {
    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      syncCaret()
    })
  }, [syncCaret])

  /* ----- Editing primitives (preserve native undo via execCommand) ----- */
  const insertText = useCallback(
    (text: string) => {
      const ta = textareaRef.current
      if (!ta) return
      ta.focus()
      document.execCommand('insertText', false, text)
      syncCaret()
    },
    [syncCaret]
  )

  const undo = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.focus()
    document.execCommand('undo')
    syncCaret()
  }, [syncCaret])

  const doCut = useCallback(() => {
    const ta = textareaRef.current
    if (!ta || ta.selectionStart === ta.selectionEnd) return
    ta.focus()
    document.execCommand('cut')
    syncCaret()
  }, [syncCaret])

  const doCopy = useCallback(() => {
    const ta = textareaRef.current
    if (!ta || ta.selectionStart === ta.selectionEnd) return
    ta.focus()
    document.execCommand('copy')
  }, [])

  const doPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) insertText(text)
    } catch {
      // Clipboard read blocked by the browser; the native Ctrl+V path still works.
    }
  }, [insertText])

  const doDelete = useCallback(() => {
    const ta = textareaRef.current
    if (!ta || ta.selectionStart === ta.selectionEnd) return
    ta.focus()
    document.execCommand('delete')
    syncCaret()
  }, [syncCaret])

  const selectAll = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.focus()
    ta.select()
    syncCaret()
  }, [syncCaret])

  const insertTimeDate = useCallback(() => {
    insertText(format(new Date(), 'h:mm a M/d/yyyy'))
  }, [insertText])

  /* ----- Message box (promise-based) ----- */
  const showMessage = useCallback(
    (opts: Omit<MessageBoxState, 'resolve'>) =>
      new Promise<string>((resolve) => {
        setMessageBox({ ...opts, resolve })
      }),
    []
  )

  const resolveMessage = useCallback((value: string) => {
    messageBoxRef.current?.resolve(value)
    setMessageBox(null)
  }, [])

  const confirmSaveChanges = useCallback(
    () =>
      showMessage({
        title: 'Notepad',
        message: <>Do you want to save changes to {fileName ?? 'Untitled'}?</>,
        width: 360,
        buttons: [
          { label: 'Yes', value: 'yes', default: true },
          { label: 'No', value: 'no' },
          { label: 'Cancel', value: 'cancel' },
        ],
      }),
    [fileName, showMessage]
  )

  /* ----- File operations ----- */
  const saveToFile = useCallback(
    (name: string) => {
      downloadText(name, content)
      setFileName(name)
      setDirty(false)
    },
    [content, setDirty, setFileName]
  )

  const handleSave = useCallback(() => {
    saveToFile(fileName ?? 'Untitled.txt')
  }, [fileName, saveToFile])

  const handleSaveAs = useCallback(() => {
    saveToFile(fileName ?? 'Untitled.txt')
  }, [fileName, saveToFile])

  const handleNew = useCallback(async () => {
    if (dirty) {
      const r = await confirmSaveChanges()
      if (r === 'cancel') return
      if (r === 'yes') handleSave()
    }
    setContent('')
    setFileName(null)
    setDirty(false)
    refocus()
  }, [confirmSaveChanges, dirty, handleSave, refocus, setContent, setDirty, setFileName])

  const handleOpen = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onFilePicked = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return
      if (dirty) {
        const r = await confirmSaveChanges()
        if (r === 'cancel') return
        if (r === 'yes') handleSave()
      }
      const text = await file.text()
      setContent(text)
      setFileName(file.name)
      setDirty(false)
      requestAnimationFrame(() => {
        const ta = textareaRef.current
        if (ta) ta.setSelectionRange(0, 0)
        refocus()
      })
    },
    [confirmSaveChanges, dirty, handleSave, refocus, setContent, setDirty, setFileName]
  )

  const handleExit = useCallback(async () => {
    if (dirty) {
      const r = await confirmSaveChanges()
      if (r === 'cancel') return
      if (r === 'yes') handleSave()
    }
    closeWindow(NOTEPAD_APP_ID)
  }, [closeWindow, confirmSaveChanges, dirty, handleSave])

  const handlePrint = useCallback(() => {
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'
    document.body.appendChild(iframe)
    const doc = iframe.contentWindow?.document
    if (!doc) {
      iframe.remove()
      return
    }
    const { page, font } = prefs
    const base = fileName ? fileName.replace(/\.[^./\\]+$/, '') : 'Untitled'
    const expand = (tpl: string) =>
      tpl
        .replace(/&f/gi, fileName ?? 'Untitled')
        .replace(/&d/gi, format(new Date(), 'M/d/yyyy'))
        .replace(/&t/gi, format(new Date(), 'h:mm a'))
        .replace(/&p/gi, '1')
    const header = expand(page.header)
    const footer = expand(page.footer)
    const m = page.margins
    doc.open()
    doc.write(
      `<!doctype html><html><head><title>${escapeHtml(base)}</title><style>` +
        `@page{size:${page.orientation};margin:${m.top}in ${m.right}in ${m.bottom}in ${m.left}in;}` +
        `body{font-family:'${font.family}',monospace;font-size:${ptToPx(font.size)}px;` +
        `font-weight:${fontWeight(font.style)};font-style:${fontItalic(font.style)};` +
        `white-space:pre-wrap;word-break:break-word;margin:0;}` +
        `.h{text-align:center;font-size:12px;margin-bottom:14px;}` +
        `.f{text-align:center;font-size:12px;margin-top:14px;}` +
        `</style></head><body>` +
        (header ? `<div class="h">${escapeHtml(header)}</div>` : '') +
        `<div>${escapeHtml(content)}</div>` +
        (footer ? `<div class="f">${escapeHtml(footer)}</div>` : '') +
        `</body></html>`
    )
    doc.close()
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    setTimeout(() => iframe.remove(), 1000)
  }, [content, fileName, prefs])

  /* ----- Find / Replace / Go To ----- */
  const runFind = useCallback(
    (direction: 'up' | 'down') => {
      const ta = textareaRef.current
      const term = search.term
      if (!ta || !term) return false
      const hay = search.matchCase ? content : content.toLowerCase()
      const needle = search.matchCase ? term : term.toLowerCase()
      let idx: number
      if (direction === 'down') {
        idx = hay.indexOf(needle, ta.selectionEnd)
      } else {
        const from = ta.selectionStart - 1
        idx = from >= 0 ? hay.lastIndexOf(needle, from) : -1
      }
      if (idx === -1) {
        showMessage({
          title: 'Notepad',
          message: <>Cannot find "{term}"</>,
          width: 320,
          buttons: [{ label: 'OK', value: 'ok', default: true }],
        })
        return false
      }
      ta.focus()
      ta.setSelectionRange(idx, idx + term.length)
      syncCaret()
      return true
    },
    [content, search.matchCase, search.term, showMessage, syncCaret]
  )

  const findNext = useCallback(() => {
    if (!search.term) {
      setActiveDialog('find')
      return
    }
    runFind(search.direction)
  }, [runFind, search.direction, search.term])

  const doReplace = useCallback(() => {
    const ta = textareaRef.current
    const term = search.term
    if (!ta || !term) return
    const sel = content.slice(ta.selectionStart, ta.selectionEnd)
    const matches = search.matchCase
      ? sel === term
      : sel.toLowerCase() === term.toLowerCase()
    if (matches) insertText(search.replaceWith)
    runFind('down')
  }, [content, insertText, runFind, search.matchCase, search.replaceWith, search.term])

  const doReplaceAll = useCallback(() => {
    const term = search.term
    if (!term) return
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(escaped, search.matchCase ? 'g' : 'gi')
    const next = content.replace(re, () => search.replaceWith)
    if (next !== content) {
      setContent(next)
      setDirty(true)
    }
  }, [content, search.matchCase, search.replaceWith, search.term, setContent, setDirty])

  const goToLine = useCallback(
    (line: number) => {
      const ta = textareaRef.current
      if (!ta) return
      const lines = content.split('\n')
      const target = Math.min(Math.max(line, 1), lines.length)
      let pos = 0
      for (let i = 0; i < target - 1; i++) pos += lines[i].length + 1
      ta.focus()
      ta.setSelectionRange(pos, pos)
      syncCaret()
      setActiveDialog(null)
    },
    [content, syncCaret]
  )

  /* ----- Format / View ----- */
  const toggleWordWrap = useCallback(() => {
    updatePrefs((p) => ({ ...p, wordWrap: !p.wordWrap }))
    refocus()
  }, [refocus, updatePrefs])

  const toggleStatusBar = useCallback(() => {
    updatePrefs((p) => ({ ...p, statusBar: !p.statusBar }))
    refocus()
  }, [refocus, updatePrefs])

  const applyFont = useCallback(
    (font: NotepadFont) => {
      updatePrefs((p) => ({ ...p, font }))
      setActiveDialog(null)
      refocus()
    },
    [refocus, updatePrefs]
  )

  const applyPage = useCallback(
    (page: PageSetup) => {
      updatePrefs((p) => ({ ...p, page }))
      setActiveDialog(null)
    },
    [updatePrefs]
  )

  /* ----- Content change ----- */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value)
      setDirty(true)
    },
    [setContent, setDirty]
  )

  /* ----- Keyboard shortcuts ----- */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (activeDialog || messageBox) return
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault()
            handleNew()
            break
          case 'o':
            e.preventDefault()
            handleOpen()
            break
          case 's':
            e.preventDefault()
            handleSave()
            break
          case 'p':
            e.preventDefault()
            handlePrint()
            break
          case 'f':
            e.preventDefault()
            setActiveDialog('find')
            break
          case 'h':
            e.preventDefault()
            setActiveDialog('replace')
            break
          case 'g':
            if (!prefs.wordWrap) {
              e.preventDefault()
              setActiveDialog('goto')
            }
            break
        }
        return
      }
      if (e.key === 'F3') {
        e.preventDefault()
        findNext()
      } else if (e.key === 'F5') {
        e.preventDefault()
        insertTimeDate()
      }
    },
    [activeDialog, findNext, handleNew, handleOpen, handlePrint, handleSave, insertTimeDate, messageBox, prefs.wordWrap]
  )

  /* ----- Right-click context menu (native Notepad edit menu) ----- */
  useEffect(() => {
    setContextMenuItems([
      { label: 'Undo', onClick: undo },
      { divider: true },
      { label: 'Cut', onClick: doCut, disabled: !hasSelection },
      { label: 'Copy', onClick: doCopy, disabled: !hasSelection },
      { label: 'Paste', onClick: doPaste },
      { label: 'Delete', onClick: doDelete, disabled: !hasSelection },
      { divider: true },
      { label: 'Select All', onClick: selectAll },
    ])
    return () => clearContextMenuItems()
  }, [
    clearContextMenuItems,
    doCopy,
    doCut,
    doDelete,
    doPaste,
    hasSelection,
    selectAll,
    setContextMenuItems,
    undo,
  ])

  const statusBarVisible = prefs.statusBar && !prefs.wordWrap

  const menus: MenuDef[] = [
    {
      label: 'File',
      items: [
        { label: 'New', shortcut: 'Ctrl+N', onClick: handleNew },
        { label: 'Open...', shortcut: 'Ctrl+O', onClick: handleOpen },
        { label: 'Save', shortcut: 'Ctrl+S', onClick: handleSave },
        { label: 'Save As...', onClick: handleSaveAs },
        { divider: true },
        { label: 'Page Setup...', onClick: () => setActiveDialog('pagesetup') },
        { label: 'Print...', shortcut: 'Ctrl+P', onClick: handlePrint },
        { divider: true },
        { label: 'Exit', onClick: handleExit },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', onClick: undo },
        { divider: true },
        { label: 'Cut', shortcut: 'Ctrl+X', onClick: doCut, disabled: !hasSelection },
        { label: 'Copy', shortcut: 'Ctrl+C', onClick: doCopy, disabled: !hasSelection },
        { label: 'Paste', shortcut: 'Ctrl+V', onClick: doPaste },
        { label: 'Delete', shortcut: 'Del', onClick: doDelete, disabled: !hasSelection },
        { divider: true },
        { label: 'Find...', shortcut: 'Ctrl+F', onClick: () => setActiveDialog('find') },
        { label: 'Find Next', shortcut: 'F3', onClick: findNext, disabled: !search.term },
        { label: 'Replace...', shortcut: 'Ctrl+H', onClick: () => setActiveDialog('replace') },
        { label: 'Go To...', shortcut: 'Ctrl+G', onClick: () => setActiveDialog('goto'), disabled: prefs.wordWrap },
        { divider: true },
        { label: 'Select All', shortcut: 'Ctrl+A', onClick: selectAll },
        { label: 'Time/Date', shortcut: 'F5', onClick: insertTimeDate },
      ],
    },
    {
      label: 'Format',
      items: [
        { label: 'Word Wrap', checked: prefs.wordWrap, onClick: toggleWordWrap },
        { label: 'Font...', onClick: () => setActiveDialog('font') },
      ],
    },
    {
      label: 'View',
      items: [
        {
          label: 'Status Bar',
          checked: prefs.statusBar,
          disabled: prefs.wordWrap,
          onClick: toggleStatusBar,
        },
      ],
    },
    {
      label: 'Help',
      items: [
        {
          label: 'View Help',
          onClick: () =>
            showMessage({
              title: 'Notepad',
              message: <>Type your notes in the editing area, then use File &gt; Save to download them.</>,
              width: 360,
              buttons: [{ label: 'OK', value: 'ok', default: true }],
            }),
        },
        { divider: true },
        { label: 'About Notepad', onClick: () => setActiveDialog('about') },
      ],
    },
  ]

  return (
    <div className="np-root" onKeyDown={handleKeyDown}>
      <NotepadMenuBar menus={menus} />

      <textarea
        ref={textareaRef}
        className="np-textarea"
        value={content}
        spellCheck={false}
        autoFocus
        wrap={prefs.wordWrap ? 'soft' : 'off'}
        onChange={handleChange}
        onSelect={syncCaret}
        onClick={syncCaret}
        onKeyUp={syncCaret}
        style={{
          fontFamily: `'${prefs.font.family}', monospace`,
          fontSize: ptToPx(prefs.font.size),
          fontWeight: fontWeight(prefs.font.style),
          fontStyle: fontItalic(prefs.font.style),
          lineHeight: 1.25,
          whiteSpace: prefs.wordWrap ? 'pre-wrap' : 'pre',
          overflowX: prefs.wordWrap ? 'hidden' : 'auto',
          overflowWrap: prefs.wordWrap ? 'break-word' : 'normal',
        }}
      />

      {statusBarVisible && (
        <div className="np-statusbar">
          <div className="np-statusbar-cell">
            Ln {caret.line}, Col {caret.col}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.log,.ini,.md,.csv,.json,text/plain"
        style={{ display: 'none' }}
        onChange={onFilePicked}
      />

      {activeDialog === 'find' && (
        <FindDialog
          term={search.term}
          matchCase={search.matchCase}
          direction={search.direction}
          onTermChange={(v) => setSearch((s) => ({ ...s, term: v }))}
          onMatchCaseChange={(v) => setSearch((s) => ({ ...s, matchCase: v }))}
          onDirectionChange={(v) => setSearch((s) => ({ ...s, direction: v }))}
          onFindNext={() => runFind(search.direction)}
          onClose={() => setActiveDialog(null)}
        />
      )}

      {activeDialog === 'replace' && (
        <ReplaceDialog
          term={search.term}
          replaceWith={search.replaceWith}
          matchCase={search.matchCase}
          onTermChange={(v) => setSearch((s) => ({ ...s, term: v }))}
          onReplaceWithChange={(v) => setSearch((s) => ({ ...s, replaceWith: v }))}
          onMatchCaseChange={(v) => setSearch((s) => ({ ...s, matchCase: v }))}
          onFindNext={() => runFind('down')}
          onReplace={doReplace}
          onReplaceAll={doReplaceAll}
          onClose={() => setActiveDialog(null)}
        />
      )}

      {activeDialog === 'goto' && (
        <GoToDialog
          maxLine={content.split('\n').length}
          onGo={goToLine}
          onClose={() => setActiveDialog(null)}
        />
      )}

      {activeDialog === 'font' && (
        <FontDialog font={prefs.font} onApply={applyFont} onClose={() => setActiveDialog(null)} />
      )}

      {activeDialog === 'pagesetup' && (
        <PageSetupDialog page={prefs.page} onApply={applyPage} onClose={() => setActiveDialog(null)} />
      )}

      {activeDialog === 'about' && <AboutDialog onClose={() => setActiveDialog(null)} />}

      {messageBox && (
        <MessageBox
          title={messageBox.title}
          message={messageBox.message}
          buttons={messageBox.buttons}
          width={messageBox.width}
          onResult={resolveMessage}
        />
      )}
    </div>
  )
}
