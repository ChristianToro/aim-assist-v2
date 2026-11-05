// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { MAX_WAIT_MS, retryDelayMs } from './retry.js'

const rateLimited = (payload, headers = {}) => ({
  statusCode: 429,
  headers,
  payload,
})

describe('retryDelayMs', () => {
  it('does not retry anything but a 429', () => {
    for (const statusCode of [204, 400, 404, 500, 'ECONNREFUSED']) {
      expect(retryDelayMs({ statusCode, headers: {}, payload: '' })).toBeNull()
    }
  })

  it("waits for the body's retry_after, rounded up to a millisecond", () => {
    const body = JSON.stringify({
      message: 'Rate limited',
      retry_after: 1.2345,
    })
    expect(retryDelayMs(rateLimited(body))).toBe(1235)
  })

  it('falls back to the Retry-After header', () => {
    expect(retryDelayMs(rateLimited('', { 'retry-after': '2' }))).toBe(2000)
  })

  it('waits 5 s when Discord gives no usable wait', () => {
    expect(retryDelayMs(rateLimited('not json'))).toBe(5000)
    expect(retryDelayMs(rateLimited(JSON.stringify({ retry_after: -1 })))).toBe(
      5000
    )
  })

  it('leaves a long wait to the next check', () => {
    const body = JSON.stringify({ retry_after: MAX_WAIT_MS / 1000 + 1 })
    expect(retryDelayMs(rateLimited(body))).toBeNull()
    const atLimit = JSON.stringify({ retry_after: MAX_WAIT_MS / 1000 })
    expect(retryDelayMs(rateLimited(atLimit))).toBe(MAX_WAIT_MS)
  })
})
