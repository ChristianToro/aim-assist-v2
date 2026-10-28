import { HttpError } from './http.js'
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
 *
 * The limit is checked, then the row is written after generation, so two
 * simultaneous requests can both slip under it: a soft cap, which is
 * enough to bound cost per player.
 */
export const createInsightRunner =
  (store) =>
  async ({ uid, kind, inputs, generate, now = new Date() }) => {
    const hash = inputHash(inputs)

    const latest = await store.latest(uid, kind)
    if (latest?.inputHash === hash) {
      return {
        recommendation: latest.result,
        model: latest.model,
        generatedAt: latest.createdAt,
        cached: true,
      }
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
    const { createdAt } = await store.save(uid, kind, {
      inputHash: hash,
      result,
      model,
    })
    return {
      recommendation: result,
      model,
      generatedAt: createdAt,
      cached: false,
    }
  }
