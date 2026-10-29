import { askClaudeForJson } from './claude.js'
import { insightRunner, insightStore, scoreStore } from './db.js'
import { HttpError } from './http.js'
import { HISTORY_LIMIT, historyEntries } from './insightHistory.js'
import { MIN_MATCHES } from './insightPolicy.js'

const UNPROCESSABLE = 422
const BAD_GATEWAY = 502

const totalMatches = (modeStats) =>
  modeStats.reduce((sum, { matches }) => sum + matches, 0)

/*
 * The steps every insight route shares, after authentication: load the
 * caller's per-mode stats, require MIN_MATCHES, then hand one Claude call
 * to the cache-and-limit runner.
 *
 * `advice` is a kind's module (hardwareAdvice.js, platformAdvice.js):
 * PROMPT_VERSION, SYSTEM_PROMPT, ADVICE_SCHEMA, buildPrompt, parseAdvice.
 * `context` is the request's own input (e.g. { setup }); it goes into the
 * prompt and the cache key alongside the stats.
 */
export const requestInsight = async ({ uid, kind, advice, context = {} }) => {
  const modeStats = await scoreStore.modeStats(uid)
  const played = totalMatches(modeStats)
  if (played < MIN_MATCHES) {
    throw new HttpError(UNPROCESSABLE, 'Not enough matches yet', {
      needed: MIN_MATCHES,
      played,
    })
  }

  const generate = async () => {
    const { data, model } = await askClaudeForJson({
      system: advice.SYSTEM_PROMPT,
      prompt: advice.buildPrompt(modeStats, context),
      schema: advice.ADVICE_SCHEMA,
    })
    const result = advice.parseAdvice(data)
    if (!result) {
      throw new HttpError(BAD_GATEWAY, 'No recommendation was produced', {
        reason: 'invalid',
      })
    }
    return { result, model }
  }

  return insightRunner({
    uid,
    kind,
    inputs: { version: advice.PROMPT_VERSION, modeStats, ...context },
    context,
    generate,
  })
}

// The caller's recent answers of a kind that `advice` can still parse,
// newest first. A read only: no stats, no Claude call, no limit.
export const listInsights = async ({ uid, kind, advice }) =>
  historyEntries(
    await insightStore.history(uid, kind, HISTORY_LIMIT),
    advice.parseAdvice
  )
