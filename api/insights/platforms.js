import { verifyRequest } from '../_lib/auth.js'
import { handle, json } from '../_lib/http.js'
import { requestInsight } from '../_lib/insightRequest.js'
import * as platformAdvice from '../_lib/platformAdvice.js'

/*
 * POST /api/insights/platforms (no body). Recommends 3–5 shooter games,
 * with their platforms, that suit the caller's aim profile. Same cache and
 * daily limit as the hardware insight, counted separately.
 */
export const POST = handle(async (request) => {
  const { uid } = await verifyRequest(request)
  return json(
    await requestInsight({ uid, kind: 'platforms', advice: platformAdvice })
  )
})
