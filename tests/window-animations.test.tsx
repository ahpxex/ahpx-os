import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'

describe('Window animations', () => {
  it('uses Motion for open/close/minimize/maximize transitions', () => {
    const source = readFileSync(
      new URL('../src/components/window/WindowFrame.tsx', import.meta.url),
      'utf8'
    )

    expect(source).toContain('motion/react')
    expect(source).toContain('AnimatePresence')
    expect(source).toContain('layoutId')
    expect(source).toContain('exit=')
  })
})

