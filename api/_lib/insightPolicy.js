import { createHash } from 'node:crypto'
import * as rateLimit from './rateLimit.js'

// Fresh recommendations per player and kind in any rolling 24 hours. A
// cached answer (same inputs as the last one) doesn't count.
export const DAILY_LIMIT = 5
export const WINDOW_MS = 24 * 60 * 60 * 1000

// Fewer matches than this tell Claude too little to recommend anything.
export const MIN_MATCHES = 5

const sortKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value === null || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortKeys(value[key])])
  )
}

// A stable fingerprint of everything a recommendation was generated
// from: equal inputs hash equally regardless of key order.
export const inputHash = (inputs) =>
  createHash('sha256')
    .update(JSON.stringify(sortKeys(inputs)))
    .digest('hex')

export const windowStart = (now) => rateLimit.windowStart(now, WINDOW_MS)

// When the next fresh recommendation is allowed (rateLimit.js).
export const retryAfterSeconds = (oldestAt, now) =>
  rateLimit.retryAfterSeconds(oldestAt, now, WINDOW_MS)
