import { AuthError, verifyRequest } from './_lib/auth.js'
import { scoreStore } from './_lib/db.js'
import { badRequest, handle, json, readJson } from './_lib/http.js'
import { parseScoreSubmission } from './_lib/scoreInput.js'

const CREATED = 201
const FOREIGN_KEY_VIOLATION = '23503'

// POST /api/scores: records a finished match for the signed-in caller.
export const POST = handle(async (request) => {
  const { uid } = await verifyRequest(request)

  const { score, invalid } = parseScoreSubmission(await readJson(request))
  if (invalid) throw badRequest('Invalid score', { invalid })

  try {
    return json(await scoreStore.insert(uid, score), { status: CREATED })
  } catch (error) {
    // The token is still valid but its user was deleted (see /api/me).
    if (error.code === FOREIGN_KEY_VIOLATION) {
      throw new AuthError('User no longer exists', { cause: error })
    }
    throw error
  }
})
