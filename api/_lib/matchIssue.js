import { HttpError } from './http.js'
import { ISSUE_LIMIT, ISSUE_WINDOW_MS, matchTtlSeconds } from './matchPolicy.js'
import { retryAfterSeconds, windowStart } from './rateLimit.js'

const TOO_MANY_REQUESTS = 429

/*
 * Issues a match ticket for `uid` in `mode` (a GAME_MODES entry), unless
 * the player has hit the issue limit: then a 429 with Retry-After. Takes
 * the store as an argument so tests can pass an in-memory one.
 *
 * Like the insight cap, the limit is soft: two requests at the same
 * instant can both pass the count. That still bounds tickets per player.
 */
export const issueMatch = async (store, { uid, mode, now = new Date() }) => {
  const { count, oldestAt } = await store.countSince(
    uid,
    windowStart(now, ISSUE_WINDOW_MS)
  )
  if (count >= ISSUE_LIMIT) {
    const retryAfter = retryAfterSeconds(oldestAt, now, ISSUE_WINDOW_MS)
    throw new HttpError(
      TOO_MANY_REQUESTS,
      'Match limit reached',
      { limit: ISSUE_LIMIT, retryAfterSeconds: retryAfter },
      { 'Retry-After': String(retryAfter) }
    )
  }
  return store.issue(uid, mode.label, matchTtlSeconds(mode))
}
