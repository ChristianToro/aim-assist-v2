import { verifyRequest } from '../_lib/auth.js'
import { handle, json } from '../_lib/http.js'
import { listInsights, requestInsight } from '../_lib/insightRequest.js'
import * as platformAdvice from '../_lib/platformAdvice.js'

const KIND = 'platforms'

// GET /api/insights/platforms: the caller's past game picks, in the same
// shape and order as GET /api/insights/hardware.
export const GET = handle(async (request) => {
  const { uid } = await verifyRequest(request)
  return json({
    entries: await listInsights({ uid, kind: KIND, advice: platformAdvice }),
  })
})

/*
 * POST /api/insights/platforms (no body). Recommends 3–5 shooter games,
 * with their platforms, that suit the caller's aim profile. Same cache and
 * daily limit as the hardware insight, counted separately.
 */
export const POST = handle(async (request) => {
  const { uid } = await verifyRequest(request)
  return json(await requestInsight({ uid, kind: KIND, advice: platformAdvice }))
})
