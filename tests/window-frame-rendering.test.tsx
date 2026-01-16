import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'

const source = readFileSync(
  new URL('../src/components/window/WindowFrame.tsx', import.meta.url),
  'utf8'
)

describe('WindowFrame render constraints', () => {
  it('avoids ref access during render', () => {
    expect(source).not.toContain('.current')
  })

  it('only keeps window padding/margin for profile windows', () => {
    expect(source).toContain("window.id.startsWith('profile-')")
    expect(source).toContain("window.id === 'new-profile'")
    expect(source).toContain("isProfileWindow ? '' : 'p-0'")
    expect(source).toContain("isProfileWindow ? '' : 'm-0 p-0'")
  })
})
