import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface HistoryEntry {
  command: string
  output: string
}

export function TerminalApp() {
  const { user, login, logout } = useAuth()

  const COMMANDS: Record<string, string | (() => string)> = {
    help: `Available commands:
  help     - Show this help message
  about    - About me
  skills   - List my skills
  contact  - Contact information
  projects - List projects
  clear    - Clear terminal
  date     - Show current date
  whoami   - Display current user
  login    - Login as admin (usage: login <email> <password>)
  logout   - Logout`,
    about:
      'Hi! I am ahpx, a software developer who enjoys building things for the web.',
    skills: 'TypeScript, React, Node.js, Python, Go, PostgreSQL, Docker',
    contact: `Email: hello@ahpx.dev
GitHub: github.com/ahpx`,
    projects: `1. ahpx-os - Web-based OS interface
2. Project Two - Description here
3. Project Three - Description here`,
    whoami: () =>
      user?.email ? `Logged in as: ${user.email}` : 'Not logged in',
    date: () => new Date().toString(),
  }

  const [history, setHistory] = useState<HistoryEntry[]>([
    { command: '', output: 'Welcome to ahpx-os terminal. Type "help" for commands.' },
  ])
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.scrollTo(0, containerRef.current.scrollHeight)
  }, [history])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedInput = input.trim()
    const [cmd, ...args] = trimmedInput.split(' ')

    let output = ''

    if (cmd === '') {
      output = ''
    } else if (cmd === 'clear') {
      setHistory([])
      setInput('')
      return
    } else if (cmd === 'login') {
      const [email, password] = args
      if (!email || !password) {
        output = 'Usage: login <email> <password>'
      } else {
        try {
          await login({ email, password })
          output = 'Login successful. Session expires in 30 days.'
        } catch (err) {
          output = `Login failed: ${err instanceof Error ? err.message : 'Invalid credentials'}`
        }
      }
    } else if (cmd === 'logout') {
      await logout()
      output = 'Logged out successfully.'
    } else if (cmd in COMMANDS) {
      const result = COMMANDS[cmd]
      output = typeof result === 'function' ? result() : result
    } else {
      output = `Command not found: ${cmd}. Type "help" for available commands.`
    }

    setHistory((prev) => [...prev, { command: trimmedInput, output }])
    setInput('')
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  const promptUser = user?.email ? user.email.split('@')[0] : 'guest'

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[300px] cursor-text overflow-auto bg-black p-4 font-mono text-sm text-green-400"
      onClick={handleContainerClick}
    >
      {history.map((entry, i) => (
        <div key={i} className="mb-2">
          {entry.command && (
            <div>
              <span className="text-[var(--color-primary)]">{promptUser}@ahpx-os</span>
              <span className="text-white">:</span>
              <span className="text-blue-400">~</span>
              <span className="text-white">$&nbsp;</span>
              <span>{entry.command}</span>
            </div>
          )}
          {entry.output && (
            <pre className="whitespace-pre-wrap text-green-400">
              {entry.output}
            </pre>
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex">
        <span className="text-[var(--color-primary)]">{promptUser}@ahpx-os</span>
        <span className="text-white">:</span>
        <span className="text-blue-400">~</span>
        <span className="text-white">$&nbsp;</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent text-green-400 outline-none"
          autoFocus
        />
      </form>
    </div>
  )
}
