import { HttpError } from './http.js'
import { toEntry } from './insightHistory.js'
import {
  DAILY_LIMIT,
  inputHash,
  retryAfterSeconds,
  windowStart,
} from './insightPolicy.js'

const TOO_MANY_REQUESTS = 429

/*
 * The cache-then-limit-then-generate policy shared by every insight kind.
 * `inputs` is everything the answer depends on; if it hashes the same as
 * the player's latest answer of this kind, that answer is returned without
 * calling Claude. Otherwise a fresh one counts against DAILY_LIMIT.
 * `context` (the request's own part of `inputs`) is stored with a fresh
 * answer, so the history can show what it was for.
 *
 * The limit is checked, then the row is written after generation, so two
 * simultaneous requests can both slip under it: a soft cap, which is
 * enough to bound cost per player.
 */
export const createInsightRunner =
  (store) =>
  async ({ uid, kind, inputs, context = {}, generate, now = new Date() }) => {
    const hash = inputHash(inputs)

    const latest = await store.latest(uid, kind)
    if (latest?.inputHash === hash) {
      return { ...toEntry(latest), cached: true }
    }

    const { count, oldestAt } = await store.countSince(
      uid,
      kind,
      windowStart(now)
    )
    if (count >= DAILY_LIMIT) {
      const retryAfter = retryAfterSeconds(oldestAt, now)
      throw new HttpError(
        TOO_MANY_REQUESTS,
        'Daily recommendation limit reached',
        { limit: DAILY_LIMIT, retryAfterSeconds: retryAfter },
        { 'Retry-After': String(retryAfter) }
      )
    }

    const { result, model } = await generate()
    const { id, createdAt } = await store.save(uid, kind, {
      inputHash: hash,
      result,
      context,
      model,
    })
    return {
      ...toEntry({ id, result, context, model, createdAt }),
      cached: false,
    }
  }
