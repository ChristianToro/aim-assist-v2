import { afterEach, describe, expect, it } from 'vitest'
import { FALLBACK_PALETTE, readCanvasPalette } from './palette'

const setTokens = (tokens) => {
  Object.entries(tokens).forEach(([name, value]) =>
    document.documentElement.style.setProperty(name, value)
  )
}

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

describe('readCanvasPalette', () => {
  it('falls back per token when the theme defines none', () => {
    expect(readCanvasPalette()).toEqual(FALLBACK_PALETTE)
  })

  it('reads the resolved custom properties of the active theme', () => {
    setTokens({
      '--target-outer': '#111111',
      '--target-mid': '#222222',
      '--target-inner': '#333333',
      '--burst-1': '#444444',
      '--burst-2': '#555555',
      '--burst-3': '#666666',
      '--float-text': '#777777',
    })

    expect(readCanvasPalette()).toEqual({
      targetOuter: '#111111',
      targetMid: '#222222',
      targetInner: '#333333',
      burst: ['#444444', '#555555', '#666666'],
      floatText: '#777777',
    })
  })

  it('fills only the gaps when a theme is partially defined', () => {
    setTokens({ '--target-inner': '#abcdef' })
    const palette = readCanvasPalette()

    expect(palette.targetInner).toBe('#abcdef')
    expect(palette.targetOuter).toBe(FALLBACK_PALETTE.targetOuter)
    expect(palette.burst).toEqual(FALLBACK_PALETTE.burst)
  })
})
