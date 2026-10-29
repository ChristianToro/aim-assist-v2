import { verifyRequest } from '../_lib/auth.js'
import * as hardwareAdvice from '../_lib/hardwareAdvice.js'
import { badRequest, handle, json, readJson } from '../_lib/http.js'
import { listInsights, requestInsight } from '../_lib/insightRequest.js'

const KIND = 'hardware'

/*
 * GET /api/insights/hardware: the caller's past mouse-settings answers,
 * { entries: [{ id, recommendation, context, model, generatedAt }] },
 * newest first. Free to call (a database read, no Claude).
 */
export const GET = handle(async (request) => {
  const { uid } = await verifyRequest(request)
  return json({
    entries: await listInsights({ uid, kind: KIND, advice: hardwareAdvice }),
  })
})

/*
 * POST /api/insights/hardware, body { setup?: { dpi?, pollingRateHz? } }.
 * Recommends DPI, sensitivity and polling rate from the caller's per-mode
 * stats. Answers are cached until the stats or setup change, and fresh
 * ones are capped per day (insightRunner.js).
 */
export const POST = handle(async (request) => {
  const { uid } = await verifyRequest(request)

  const { setup, invalid } = hardwareAdvice.parseSetup(await readJson(request))
  if (invalid) throw badRequest('Invalid setup', { invalid })

  return json(
    await requestInsight({
      uid,
      kind: KIND,
      advice: hardwareAdvice,
      context: { setup },
    })
  )
})
