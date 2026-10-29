import { AuthError, verifyRequest } from './_lib/auth.js'
import { matchStore } from './_lib/db.js'
import { badRequest, handle, json, readJson } from './_lib/http.js'
import { issueMatch } from './_lib/matchIssue.js'
import { parseMatchRequest } from './_lib/matchPolicy.js'

const CREATED = 201
const FOREIGN_KEY_VIOLATION = '23503'

/*
 * POST /api/matches, body { mode }: issues a match for the signed-in
 * caller when they press Start. Returns 201 { matchId, startedAt,
 * expiresAt }; POST /api/scores redeems the matchId once (S4).
 */
export const POST = handle(async (request) => {
  const { uid } = await verifyRequest(request)

  const { mode, invalid } = parseMatchRequest(await readJson(request))
  if (invalid) throw badRequest('Invalid match', { invalid })

  try {
    return json(await issueMatch(matchStore, { uid, mode }), {
      status: CREATED,
    })
  } catch (error) {
    // The token is still valid but its user was deleted (see /api/me).
    if (error.code === FOREIGN_KEY_VIOLATION) {
      throw new AuthError('User no longer exists', { cause: error })
    }
    throw error
  }
})
