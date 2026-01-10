import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'

describe('WindowFrame dragging', () => {
  it('allows dragging outside viewport except top', () => {
    const source = readFileSync(
      new URL('../src/components/window/WindowFrame.tsx', import.meta.url),
      'utf8'
    )

    expect(source).not.toContain('bounds="parent"')
    expect(source).toContain('bounds=".window-drag-bounds"')
    expect(source).toContain('onDragStop={')
    expect(source).toContain('Math.max(0, d.y)')
  })
})
