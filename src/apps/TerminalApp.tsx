import { useRef, useEffect } from 'react'
import { useLocalAtom } from '@/hooks/useLocalAtom'

interface HistoryEntry {
  command: string
  output: string
}

interface TerminalState {
  history: HistoryEntry[]
  input: string
}

const PROMPT = 'C:\\Users\\AHpx>'

const WELCOME = `AHpx Aindows XP [Version 5.1.2600]
(C) Copyright 1985-2001 AHpx Corp.`

const COMMANDS: Record<string, string | (() => string)> = {
  help: `Available commands:
  help     - Show this help message
  about    - About me
  skills   - List my skills
  contact  - Contact information
  projects - List projects
  cls      - Clear screen
  date     - Show current date
  whoami   - Display current user`,
  about: 'Hi! I am ahpx, a software developer who enjoys building things for the web.',
  skills: 'TypeScript, React, Node.js, Python, Go, PostgreSQL, Docker',
  contact: `Email: hello@ahpx.dev
GitHub: github.com/ahpx`,
  projects: `1. aindows-xp - Web-based OS interface
2. Project Two - Description here
3. Project Three - Description here`,
  whoami: () => 'Guest',
  date: () => {
    const d = new Date()
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `The current date is: ${days[d.getDay()]} ${mm}/${dd}/${yyyy}`
  },
}

export function TerminalApp() {
  const [terminalState, setTerminalState] = useLocalAtom<TerminalState>(
    () => ({
      history: [{ command: '', output: WELCOME }],
      input: '',
    }),
    []
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { history, input } = terminalState

  useEffect(() => {
    containerRef.current?.scrollTo(0, containerRef.current.scrollHeight)
  }, [history])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedInput = input.trim()
    const [cmd] = trimmedInput.toLowerCase().split(' ')

    if (cmd === 'cls' || cmd === 'clear') {
      setTerminalState({ history: [], input: '' })
      return
    }

    let output = ''

    if (cmd === '') {
      output = ''
    } else if (cmd in COMMANDS) {
      const result = COMMANDS[cmd]
      output = typeof result === 'function' ? result() : result
    } else {
      output = `'${trimmedInput}' is not recognized as an internal or external command,\noperable program or batch file.`
    }

    setTerminalState((prev) => ({
      history: [...prev.history, { command: trimmedInput, output }],
      input: '',
    }))
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[300px] cursor-text overflow-auto bg-black p-2 text-white"
      style={{ fontFamily: "'VT323', monospace", fontSize: '18px', lineHeight: '22px' }}
      onClick={handleContainerClick}
    >
      {history.map((entry, i) => (
        <div key={i}>
          {entry.command && (
            <div>
              <span>{PROMPT} </span>
              <span>{entry.command}</span>
            </div>
          )}
          {entry.output && (
            <pre className="whitespace-pre-wrap" style={{ fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit' }}>{entry.output}</pre>
          )}
          {(entry.command || entry.output) && <div className="h-1" />}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex items-baseline">
        <span>{PROMPT}&nbsp;</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setTerminalState((prev) => ({ ...prev, input: e.target.value }))}
          className="flex-1 border-none bg-transparent text-white outline-none"
          style={{ fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit', padding: 0, margin: 0, caretColor: 'white' }}
          autoFocus
        />
      </form>
    </div>
  )
}
