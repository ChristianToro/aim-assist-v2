// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  WINDOW_MS,
  inputHash,
  retryAfterSeconds,
  windowStart,
} from './insightPolicy.js'

describe('inputHash', () => {
  it('is a sha256 hex digest', () => {
    expect(inputHash({ a: 1 })).toMatch(/^[0-9a-f]{64}$/)
  })

  it('ignores key order, at every depth', () => {
    const a = { version: 1, setup: { dpi: 800, pollingRateHz: 1000 } }
    const b = { setup: { pollingRateHz: 1000, dpi: 800 }, version: 1 }
    expect(inputHash(a)).toBe(inputHash(b))
  })

  it('changes when any input changes', () => {
    const stats = [{ mode: 'Flick', matches: 5 }]
    expect(inputHash({ stats })).not.toBe(
      inputHash({ stats: [{ mode: 'Flick', matches: 6 }] })
    )
    expect(inputHash({ version: 1, stats })).not.toBe(
      inputHash({ version: 2, stats })
    )
  })

  it('keeps array order significant', () => {
    expect(inputHash([1, 2])).not.toBe(inputHash([2, 1]))
  })
})

describe('windowStart', () => {
  it('is 24 hours before now', () => {
    const now = new Date('2026-10-28T12:00:00Z')
    expect(windowStart(now)).toEqual(new Date('2026-10-27T12:00:00Z'))
  })
})

describe('retryAfterSeconds', () => {
  const now = new Date('2026-10-28T12:00:00Z')

  it('counts down to when the oldest generation leaves the window', () => {
    const oldestAt = new Date(now.getTime() - WINDOW_MS + 90_000)
    expect(retryAfterSeconds(oldestAt, now)).toBe(90)
  })

  it('rounds up partial seconds', () => {
    const oldestAt = new Date(now.getTime() - WINDOW_MS + 1500)
    expect(retryAfterSeconds(oldestAt, now)).toBe(2)
  })

  it('never drops below 1', () => {
    expect(retryAfterSeconds(new Date(0), now)).toBe(1)
  })

  it('accepts an ISO string', () => {
    const oldestAt = new Date(now.getTime() - WINDOW_MS + 60_000)
    expect(retryAfterSeconds(oldestAt.toISOString(), now)).toBe(60)
  })
})
