// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { retryAfterSeconds, windowStart } from './rateLimit.js'

// insightPolicy.test.js covers these at the insights' 24-hour window.
const TEN_MINUTES_MS = 10 * 60 * 1000
const now = new Date('2026-10-29T12:00:00Z')

describe('rateLimit', () => {
  it('starts the window windowMs before now', () => {
    expect(windowStart(now, TEN_MINUTES_MS)).toEqual(
      new Date('2026-10-29T11:50:00Z')
    )
  })

  it('waits until the oldest entry leaves the window', () => {
    const oldestAt = new Date('2026-10-29T11:52:30Z')
    expect(retryAfterSeconds(oldestAt, now, TEN_MINUTES_MS)).toBe(150)
  })
})
