import { describe, expect, it } from 'bun:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'

async function importDesktopCornerWidget() {
  try {
    return await import('../src/components/desktop/DesktopCornerWidget')
  } catch {
    return null
  }
}

describe('Desktop corner widget', () => {
  it('renders "Hello world"', async () => {
    const mod = await importDesktopCornerWidget()
    expect(mod).not.toBeNull()
    if (!mod) return

    const html = renderToStaticMarkup(<mod.DesktopCornerWidget />)
    expect(html).toContain('Hello world')
  })

  it('is mounted in Desktop', () => {
    const desktopSource = readFileSync(
      new URL('../src/components/desktop/Desktop.tsx', import.meta.url),
      'utf8'
    )
    expect(desktopSource).toContain('<DesktopCornerWidget')
  })
})

