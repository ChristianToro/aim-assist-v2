import { describe, expect, it } from 'vitest'
import {
  DEFAULT_THEME_ID,
  THEMES,
  getThemeById,
  isValidThemeId,
} from './themes'

describe('theme registry', () => {
  it('ships the five themes named in the project brief', () => {
    expect(THEMES.map((theme) => theme.id)).toEqual([
      'dark',
      'light',
      'cyberpunk',
      'terminal',
      'aimlabs',
    ])
  })

  it('includes the default theme', () => {
    expect(isValidThemeId(DEFAULT_THEME_ID)).toBe(true)
  })

  it('rejects unknown and malformed ids', () => {
    expect(isValidThemeId('solarized')).toBe(false)
    expect(isValidThemeId(null)).toBe(false)
    expect(isValidThemeId('')).toBe(false)
  })

  it('falls back to the default rather than returning undefined', () => {
    expect(getThemeById('solarized').id).toBe(DEFAULT_THEME_ID)
    expect(getThemeById('terminal').id).toBe('terminal')
  })
})
