import { verifyRequest } from '../_lib/auth.js'
import { askClaudeForJson } from '../_lib/claude.js'
import { insightRunner, scoreStore } from '../_lib/db.js'
import {
  ADVICE_SCHEMA,
  PROMPT_VERSION,
  SYSTEM_PROMPT,
  buildPrompt,
  parseAdvice,
  parseSetup,
} from '../_lib/hardwareAdvice.js'
import { HttpError, badRequest, handle, json, readJson } from '../_lib/http.js'
import { MIN_MATCHES } from '../_lib/insightPolicy.js'

const UNPROCESSABLE = 422
const BAD_GATEWAY = 502

const totalMatches = (modeStats) =>
  modeStats.reduce((sum, { matches }) => sum + matches, 0)

/*
 * POST /api/insights/hardware, body { setup?: { dpi?, pollingRateHz? } }.
 * Recommends DPI, sensitivity and polling rate from the caller's per-mode
 * stats. Answers are cached until the stats or setup change, and fresh
 * ones are capped per day (insightRunner.js).
 */
export const POST = handle(async (request) => {
  const { uid } = await verifyRequest(request)

  const { setup, invalid } = parseSetup(await readJson(request))
  if (invalid) throw badRequest('Invalid setup', { invalid })

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
      system: SYSTEM_PROMPT,
      prompt: buildPrompt(modeStats, setup),
      schema: ADVICE_SCHEMA,
    })
    const result = parseAdvice(data)
    if (!result) {
      throw new HttpError(BAD_GATEWAY, 'No recommendation was produced', {
        reason: 'invalid',
      })
    }
    return { result, model }
  }

  return json(
    await insightRunner({
      uid,
      kind: 'hardware',
      inputs: { version: PROMPT_VERSION, modeStats, setup },
      generate,
    })
  )
})
