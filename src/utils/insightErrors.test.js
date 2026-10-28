import { describe, expect, it } from 'vitest'
import { formatWait, insightErrorMessage } from './insightErrors'

const apiError = (status, details = {}) => ({ status, details })

describe('formatWait', () => {
  it('counts minutes under an hour, rounding up', () => {
    expect(formatWait(1)).toBe('in 1 minute')
    expect(formatWait(61)).toBe('in 2 minutes')
    expect(formatWait(59 * 60)).toBe('in 59 minutes')
  })

  it('rounds to whole hours from an hour on', () => {
    expect(formatWait(60 * 60)).toBe('in about 1 hour')
    expect(formatWait(23.6 * 60 * 60)).toBe('in about 24 hours')
  })
})

describe('insightErrorMessage', () => {
  it('says how many more matches are needed', () => {
    expect(
      insightErrorMessage(apiError(422, { needed: 5, played: 2 }))
    ).toMatch(/^Play 3 more matches first/)
    expect(
      insightErrorMessage(apiError(422, { needed: 5, played: 4 }))
    ).toMatch(/^Play 1 more match first/)
  })

  it('says when the daily limit frees up', () => {
    expect(
      insightErrorMessage(apiError(429, { retryAfterSeconds: 3 * 60 * 60 }))
    ).toBe("You've used today's recommendations. Try again in about 3 hours.")
  })

  it('asks for a fresh sign-in on a 401', () => {
    expect(insightErrorMessage(apiError(401))).toMatch(/sign in again/i)
  })

  it('suggests a retry when Claude produced nothing usable', () => {
    expect(insightErrorMessage(apiError(502))).toMatch(/try again/i)
  })

  it('reads a 503 and a network failure as an outage', () => {
    expect(insightErrorMessage(apiError(503))).toMatch(/unreachable/)
    expect(insightErrorMessage(new TypeError('Failed to fetch'))).toMatch(
      /unreachable/
    )
  })

  it('falls back to a generic message', () => {
    expect(insightErrorMessage(apiError(500))).toMatch(/went wrong/)
  })
})
