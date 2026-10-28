import { verifyRequest } from '../_lib/auth.js'
import * as hardwareAdvice from '../_lib/hardwareAdvice.js'
import { badRequest, handle, json, readJson } from '../_lib/http.js'
import { requestInsight } from '../_lib/insightRequest.js'

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
      kind: 'hardware',
      advice: hardwareAdvice,
      context: { setup },
    })
  )
})
