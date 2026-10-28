// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { periodStart } from './leaderboardView.js'

const at = (iso) => new Date(iso)

describe('periodStart', () => {
  it('is unbounded for the all-time and personal boards', () => {
    expect(periodStart('all')).toBeNull()
    expect(periodStart('personal')).toBeNull()
  })

  it('opens the daily board at UTC midnight', () => {
    expect(periodStart('daily', at('2026-10-28T00:33:30Z'))).toEqual(
      at('2026-10-28T00:00:00Z')
    )
  })

  it('uses the UTC day, not the local one', () => {
    // 19:00 on Oct 27 in New York is already Oct 28 in UTC.
    expect(periodStart('daily', at('2026-10-27T19:00:00-05:00'))).toEqual(
      at('2026-10-28T00:00:00Z')
    )
  })

  it('opens the weekly board on the Monday of the UTC week', () => {
    // 2026-10-26 is a Monday.
    const monday = at('2026-10-26T00:00:00Z')
    expect(periodStart('weekly', monday)).toEqual(monday)
    expect(periodStart('weekly', at('2026-10-28T15:00:00Z'))).toEqual(monday)
    expect(periodStart('weekly', at('2026-11-01T23:59:59Z'))).toEqual(monday)
  })

  it('starts a new week at Monday 00:00 UTC', () => {
    expect(periodStart('weekly', at('2026-11-02T00:00:00Z'))).toEqual(
      at('2026-11-02T00:00:00Z')
    )
  })

  it('crosses month and year boundaries', () => {
    // 2027-01-01 is a Friday; its ISO week began on Monday 2026-12-28.
    expect(periodStart('weekly', at('2027-01-01T12:00:00Z'))).toEqual(
      at('2026-12-28T00:00:00Z')
    )
  })
})
