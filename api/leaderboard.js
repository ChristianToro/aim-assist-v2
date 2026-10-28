import { verifyRequest } from './_lib/auth.js'
import { scoreStore } from './_lib/db.js'
import { badRequest, handle, json } from './_lib/http.js'
import { VIEWS, periodStart } from './_lib/leaderboardView.js'

/*
 * GET /api/leaderboard?view=all|daily|weekly|personal (default 'all').
 * The public boards need no sign-in; 'personal' lists the caller's own
 * best matches and needs a token.
 */
export const GET = handle(async (request) => {
  const view = new URL(request.url).searchParams.get('view') ?? 'all'
  if (!VIEWS.includes(view)) {
    throw badRequest('Unknown view', { views: VIEWS })
  }

  if (view === 'personal') {
    const { uid } = await verifyRequest(request)
    return json({ entries: await scoreStore.personalBests(uid) })
  }
  return json({ entries: await scoreStore.topScores(periodStart(view)) })
})
