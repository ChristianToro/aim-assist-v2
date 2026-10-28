import { AuthError, verifyRequest } from './_lib/auth.js'
import { scoreStore } from './_lib/db.js'
import { handle, json } from './_lib/http.js'

// GET /api/me: the signed-in caller's identity and profile stats.
export const GET = handle(async (request) => {
  const { uid } = await verifyRequest(request)
  const stats = await scoreStore.profileStats(uid)
  // A token outlives its user by up to 15 minutes after a deletion.
  if (!stats) throw new AuthError('User no longer exists')
  return json({ uid, ...stats })
})
