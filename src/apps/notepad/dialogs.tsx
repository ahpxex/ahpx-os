import { useId, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  FONT_FAMILIES,
  FONT_SIZES,
  FONT_STYLES,
  fontItalic,
  fontWeight,
  ptToPx,
  type NotepadFont,
  type PageSetup,
} from './shared'

const HELP_ICON = '/apps/help-browser.png'

function useDialogDrag(width: number, topRatio = 0.3) {
  const [pos, setPos] = useState(() => ({
    x: Math.max(8, Math.round((window.innerWidth - width) / 2)),
    y: Math.max(40, Math.round(window.innerHeight * topRatio)),
  }))

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.title-bar-controls')) return
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const originX = pos.x
    const originY = pos.y
    const move = (ev: MouseEvent) => {
      setPos({
        x: originX + ev.clientX - startX,
        y: Math.max(0, originY + ev.clientY - startY),
      })
    }
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  return { pos, onMouseDown }
}

interface NotepadModalProps {
  title: string
  width: number
  modal?: boolean
  onClose: () => void
  children: ReactNode
}

export function NotepadModal({ title, width, modal = true, onClose, children }: NotepadModalProps) {
  const { pos, onMouseDown } = useDialogDrag(width)

  return createPortal(
    <>
      {modal && <div className="np-modal-overlay" onMouseDown={(e) => e.preventDefault()} />}
      <div className="np-dialog window" style={{ left: pos.x, top: pos.y, width }} role="dialog">
        <div className="title-bar" onMouseDown={onMouseDown}>
          <div className="title-bar-text">{title}</div>
          <div className="title-bar-controls">
            <button type="button" aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="window-body">{children}</div>
      </div>
    </>,
    document.body
  )
}

export interface MessageBoxButton {
  label: string
  value: string
  default?: boolean
}

interface MessageBoxProps {
  title: string
  message: ReactNode
  icon?: string
  buttons: MessageBoxButton[]
  width?: number
  onResult: (value: string) => void
}

export function MessageBox({ title, message, icon = HELP_ICON, buttons, width = 340, onResult }: MessageBoxProps) {
  return (
    <NotepadModal title={title} width={width} modal onClose={() => onResult('cancel')}>
      <div style={{ display: 'flex', gap: 14, padding: '16px 16px 12px', alignItems: 'center' }}>
        {icon && <img src={icon} alt="" width={32} height={32} draggable={false} />}
        <div style={{ fontSize: 11, lineHeight: 1.5 }}>{message}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '2px 0 14px' }}>
        {buttons.map((b) => (
          <button
            key={b.value}
            type="button"
            className="np-dialog-btn"
            autoFocus={b.default}
            onClick={() => onResult(b.value)}
          >
            {b.label}
          </button>
        ))}
      </div>
    </NotepadModal>
  )
}

/* ---------------- Find ---------------- */

interface FindDialogProps {
  term: string
  matchCase: boolean
  direction: 'up' | 'down'
  onTermChange: (v: string) => void
  onMatchCaseChange: (v: boolean) => void
  onDirectionChange: (v: 'up' | 'down') => void
  onFindNext: () => void
  onClose: () => void
}

export function FindDialog(props: FindDialogProps) {
  const id = useId()
  return (
    <NotepadModal title="Find" width={392} modal={false} onClose={props.onClose}>
      <div style={{ display: 'flex', padding: 12, gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div className="field-row" style={{ alignItems: 'center', marginBottom: 12 }}>
            <label htmlFor={`${id}-find`} className="np-field-label" style={{ width: 70 }}>
              Fi&#818;nd what:
            </label>
            <input
              id={`${id}-find`}
              className="np-text-input"
              style={{ flex: 1 }}
              value={props.term}
              autoFocus
              onChange={(e) => props.onTermChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  props.onFindNext()
                }
              }}
            />
          </div>
          <fieldset>
            <legend>Direction</legend>
            <div className="field-row" style={{ gap: 18 }}>
              <input
                type="radio"
                id={`${id}-up`}
                name={`${id}-dir`}
                checked={props.direction === 'up'}
                onChange={() => props.onDirectionChange('up')}
              />
              <label htmlFor={`${id}-up`}>Up</label>
              <input
                type="radio"
                id={`${id}-down`}
                name={`${id}-dir`}
                checked={props.direction === 'down'}
                onChange={() => props.onDirectionChange('down')}
              />
              <label htmlFor={`${id}-down`}>Down</label>
            </div>
          </fieldset>
          <div className="field-row" style={{ marginTop: 10 }}>
            <input
              type="checkbox"
              id={`${id}-case`}
              checked={props.matchCase}
              onChange={(e) => props.onMatchCaseChange(e.target.checked)}
            />
            <label htmlFor={`${id}-case`}>Match &#99;&#818;ase</label>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 2 }}>
          <button
            type="button"
            className="np-dialog-btn"
            disabled={!props.term}
            onClick={props.onFindNext}
          >
            &#70;&#818;ind Next
          </button>
          <button type="button" className="np-dialog-btn" onClick={props.onClose}>
            Cancel
          </button>
        </div>
      </div>
    </NotepadModal>
  )
}

/* ---------------- Replace ---------------- */

interface ReplaceDialogProps {
  term: string
  replaceWith: string
  matchCase: boolean
  onTermChange: (v: string) => void
  onReplaceWithChange: (v: string) => void
  onMatchCaseChange: (v: boolean) => void
  onFindNext: () => void
  onReplace: () => void
  onReplaceAll: () => void
  onClose: () => void
}

export function ReplaceDialog(props: ReplaceDialogProps) {
  const id = useId()
  return (
    <NotepadModal title="Replace" width={400} modal={false} onClose={props.onClose}>
      <div style={{ display: 'flex', padding: 12, gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div className="field-row" style={{ alignItems: 'center', marginBottom: 8 }}>
            <label htmlFor={`${id}-find`} className="np-field-label" style={{ width: 86 }}>
              Fi&#818;nd what:
            </label>
            <input
              id={`${id}-find`}
              className="np-text-input"
              style={{ flex: 1 }}
              value={props.term}
              autoFocus
              onChange={(e) => props.onTermChange(e.target.value)}
            />
          </div>
          <div className="field-row" style={{ alignItems: 'center', marginBottom: 12 }}>
            <label htmlFor={`${id}-rep`} className="np-field-label" style={{ width: 86 }}>
              Re&#112;&#818;lace with:
            </label>
            <input
              id={`${id}-rep`}
              className="np-text-input"
              style={{ flex: 1 }}
              value={props.replaceWith}
              onChange={(e) => props.onReplaceWithChange(e.target.value)}
            />
          </div>
          <div className="field-row">
            <input
              type="checkbox"
              id={`${id}-case`}
              checked={props.matchCase}
              onChange={(e) => props.onMatchCaseChange(e.target.checked)}
            />
            <label htmlFor={`${id}-case`}>Match &#99;&#818;ase</label>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 2 }}>
          <button type="button" className="np-dialog-btn" disabled={!props.term} onClick={props.onFindNext}>
            &#70;&#818;ind Next
          </button>
          <button type="button" className="np-dialog-btn" disabled={!props.term} onClick={props.onReplace}>
            &#82;&#818;eplace
          </button>
          <button type="button" className="np-dialog-btn" disabled={!props.term} onClick={props.onReplaceAll}>
            Replace &#65;&#818;ll
          </button>
          <button type="button" className="np-dialog-btn" onClick={props.onClose}>
            Cancel
          </button>
        </div>
      </div>
    </NotepadModal>
  )
}

/* ---------------- Go To ---------------- */

interface GoToDialogProps {
  maxLine: number
  onGo: (line: number) => void
  onClose: () => void
}

export function GoToDialog({ maxLine, onGo, onClose }: GoToDialogProps) {
  const id = useId()
  const [value, setValue] = useState('1')

  const submit = () => {
    const n = parseInt(value, 10)
    if (!Number.isNaN(n) && n >= 1) onGo(Math.min(n, maxLine))
  }

  return (
    <NotepadModal title="Go To Line" width={264} modal onClose={onClose}>
      <div style={{ padding: 12 }}>
        <label htmlFor={`${id}-line`} className="np-field-label" style={{ display: 'block', marginBottom: 6 }}>
          &#76;&#818;ine number:
        </label>
        <input
          id={`${id}-line`}
          className="np-text-input"
          style={{ width: '100%' }}
          value={value}
          autoFocus
          onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ''))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              submit()
            }
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button type="button" className="np-dialog-btn" onClick={submit}>
            Go To
          </button>
          <button type="button" className="np-dialog-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </NotepadModal>
  )
}

/* ---------------- Font ---------------- */

interface FontDialogProps {
  font: NotepadFont
  onApply: (font: NotepadFont) => void
  onClose: () => void
}

function ListColumn({
  label,
  value,
  options,
  onSelect,
  width,
  renderOption,
}: {
  label: string
  value: string
  options: { key: string; label: string }[]
  onSelect: (key: string) => void
  width: number
  renderOption?: (opt: { key: string; label: string }) => ReactNode
}) {
  return (
    <div style={{ width }}>
      <div className="np-field-label" style={{ marginBottom: 3 }}>
        {label}
      </div>
      <input className="np-text-input" style={{ width: '100%', marginBottom: 3 }} value={value} readOnly />
      <div className="np-list-box" style={{ height: 116 }}>
        {options.map((opt) => (
          <div
            key={opt.key}
            className={`np-list-option ${opt.label.toLowerCase() === value.toLowerCase() ? 'np-selected' : ''}`}
            onClick={() => onSelect(opt.key)}
          >
            {renderOption ? renderOption(opt) : opt.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export function FontDialog({ font, onApply, onClose }: FontDialogProps) {
  const [family, setFamily] = useState(font.family)
  const [style, setStyle] = useState(font.style)
  const [size, setSize] = useState(font.size)

  const styleOption = FONT_STYLES.find((s) => s.value === style)

  return (
    <NotepadModal title="Font" width={420} modal onClose={onClose}>
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <ListColumn
            label="Font:"
            width={170}
            value={family}
            options={FONT_FAMILIES.map((f) => ({ key: f, label: f }))}
            onSelect={(k) => setFamily(k)}
            renderOption={(opt) => <span style={{ fontFamily: `'${opt.label}', sans-serif` }}>{opt.label}</span>}
          />
          <ListColumn
            label="Font style:"
            width={110}
            value={styleOption?.label ?? 'Regular'}
            options={FONT_STYLES.map((s) => ({ key: s.value, label: s.label }))}
            onSelect={(k) => setStyle(k as NotepadFont['style'])}
          />
          <ListColumn
            label="Size:"
            width={64}
            value={String(size)}
            options={FONT_SIZES.map((s) => ({ key: String(s), label: String(s) }))}
            onSelect={(k) => setSize(Number(k))}
          />
        </div>

        <fieldset style={{ marginTop: 12 }}>
          <legend>Sample</legend>
          <div
            style={{
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                fontFamily: `'${family}', sans-serif`,
                fontWeight: fontWeight(style),
                fontStyle: fontItalic(style),
                fontSize: Math.min(ptToPx(size), 40),
                whiteSpace: 'nowrap',
              }}
            >
              AaBbYyZz
            </span>
          </div>
        </fieldset>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
          <button
            type="button"
            className="np-dialog-btn"
            onClick={() => onApply({ family, style, size })}
          >
            OK
          </button>
          <button type="button" className="np-dialog-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </NotepadModal>
  )
}

/* ---------------- Page Setup ---------------- */

interface PageSetupDialogProps {
  page: PageSetup
  onApply: (page: PageSetup) => void
  onClose: () => void
}

export function PageSetupDialog({ page, onApply, onClose }: PageSetupDialogProps) {
  const id = useId()
  const [draft, setDraft] = useState<PageSetup>(page)

  const setMargin = (key: keyof PageSetup['margins'], raw: string) => {
    const num = parseFloat(raw)
    setDraft((d) => ({
      ...d,
      margins: { ...d.margins, [key]: Number.isNaN(num) ? 0 : num },
    }))
  }

  const marginField = (key: keyof PageSetup['margins'], label: string) => (
    <div className="field-row" style={{ alignItems: 'center' }}>
      <label htmlFor={`${id}-${key}`} className="np-field-label" style={{ width: 44 }}>
        {label}
      </label>
      <input
        id={`${id}-${key}`}
        className="np-text-input"
        style={{ width: 52 }}
        value={String(draft.margins[key])}
        onChange={(e) => setMargin(key, e.target.value)}
      />
    </div>
  )

  return (
    <NotepadModal title="Page Setup" width={372} modal onClose={onClose}>
      <div style={{ padding: 12 }}>
        <fieldset>
          <legend>Orientation</legend>
          <div className="field-row" style={{ gap: 18 }}>
            <input
              type="radio"
              id={`${id}-portrait`}
              name={`${id}-orient`}
              checked={draft.orientation === 'portrait'}
              onChange={() => setDraft((d) => ({ ...d, orientation: 'portrait' }))}
            />
            <label htmlFor={`${id}-portrait`}>Portrait</label>
            <input
              type="radio"
              id={`${id}-landscape`}
              name={`${id}-orient`}
              checked={draft.orientation === 'landscape'}
              onChange={() => setDraft((d) => ({ ...d, orientation: 'landscape' }))}
            />
            <label htmlFor={`${id}-landscape`}>Landscape</label>
          </div>
        </fieldset>

        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          <fieldset style={{ flex: 1 }}>
            <legend>Margins (inches)</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
              {marginField('left', 'Left:')}
              {marginField('right', 'Right:')}
              {marginField('top', 'Top:')}
              {marginField('bottom', 'Bottom:')}
            </div>
          </fieldset>
        </div>

        <div className="field-row" style={{ alignItems: 'center', marginTop: 10 }}>
          <label htmlFor={`${id}-header`} className="np-field-label" style={{ width: 56 }}>
            Header:
          </label>
          <input
            id={`${id}-header`}
            className="np-text-input"
            style={{ flex: 1 }}
            value={draft.header}
            onChange={(e) => setDraft((d) => ({ ...d, header: e.target.value }))}
          />
        </div>
        <div className="field-row" style={{ alignItems: 'center', marginTop: 6 }}>
          <label htmlFor={`${id}-footer`} className="np-field-label" style={{ width: 56 }}>
            Footer:
          </label>
          <input
            id={`${id}-footer`}
            className="np-text-input"
            style={{ flex: 1 }}
            value={draft.footer}
            onChange={(e) => setDraft((d) => ({ ...d, footer: e.target.value }))}
          />
        </div>
        <div style={{ fontSize: 11, color: '#555', marginTop: 6 }}>
          Codes: &amp;f file, &amp;p page, &amp;d date, &amp;t time
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
          <button type="button" className="np-dialog-btn" onClick={() => onApply(draft)}>
            OK
          </button>
          <button type="button" className="np-dialog-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </NotepadModal>
  )
}

/* ---------------- About ---------------- */

export function AboutDialog({ onClose }: { onClose: () => void }) {
  return (
    <NotepadModal title="About Notepad" width={360} modal onClose={onClose}>
      <div style={{ display: 'flex', gap: 14, padding: '16px 16px 8px' }}>
        <img src="/apps/gedit.png" alt="" width={48} height={48} draggable={false} />
        <div style={{ fontSize: 11, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Aindows XP Notepad</div>
          <div>Version 5.1 (Build 2600)</div>
          <div style={{ marginTop: 8 }}>A faithful Notepad recreation for the Aindows XP web desktop.</div>
          <div style={{ marginTop: 8, color: '#555' }}>This product is made with React + Vite.</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 16px 14px' }}>
        <button type="button" className="np-dialog-btn" autoFocus onClick={onClose}>
          OK
        </button>
      </div>
    </NotepadModal>
  )
}
