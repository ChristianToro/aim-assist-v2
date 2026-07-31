import { describe, expect, it } from 'vitest'
import { getDayKey, getWeekKey } from './dates'

describe('getDayKey', () => {
  it('formats a local date as YYYY-MM-DD with zero padding', () => {
    expect(getDayKey(new Date(2026, 6, 6))).toBe('2026-07-06')
    expect(getDayKey(new Date(2026, 0, 1))).toBe('2026-01-01')
  })
})

describe('getWeekKey', () => {
  it('computes the ISO week', () => {
    // 2026-01-01 is a Thursday → ISO week 1.
    expect(getWeekKey(new Date(2026, 0, 1))).toBe('2026-W01')
    // 2026-07-06 is a Monday in ISO week 28.
    expect(getWeekKey(new Date(2026, 6, 6))).toBe('2026-W28')
  })

  it('treats Sunday as the last day of the ISO week', () => {
    // 2026-01-04 (Sunday) still belongs to week 1.
    expect(getWeekKey(new Date(2026, 0, 4))).toBe('2026-W01')
    // The next day (Monday) starts week 2.
    expect(getWeekKey(new Date(2026, 0, 5))).toBe('2026-W02')
  })
})
