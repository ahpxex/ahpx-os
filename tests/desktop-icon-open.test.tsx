import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'

describe('Desktop icons', () => {
  it('open apps with a single click', () => {
    const desktopIconSource = readFileSync(
      new URL('../src/components/desktop/DesktopIcon.tsx', import.meta.url),
      'utf8'
    )
    const desktopSource = readFileSync(
      new URL('../src/components/desktop/Desktop.tsx', import.meta.url),
      'utf8'
    )

    expect(desktopIconSource).toContain('onClick=')
    expect(desktopIconSource).not.toContain('onDoubleClick=')
    expect(desktopSource).toContain('onOpen={() =>')
  })
})

