import { AuthError, verifyRequest } from './_lib/auth.js'
import { matchStore, scoreStore } from './_lib/db.js'
import { badRequest, handle, json, readJson } from './_lib/http.js'
import { submitMatch } from './_lib/matchSubmit.js'
import {
  MAX_SUBMISSION_BYTES,
  parseScoreSubmission,
} from './_lib/scoreInput.js'

const CREATED = 201
// From 002_scores_user_fk.sql. Scores also reference their match, so
// only this key's violation means the caller's user is gone.
const USER_FOREIGN_KEY = 'scores_user_id_fkey'

/*
 * POST /api/scores, body { matchId, events }: saves a finished match for
 * the signed-in caller. The server computes the score from the events
 * (matchSubmit.js); a score in the body is ignored.
 */
export const POST = handle(async (request) => {
  const { uid } = await verifyRequest(request)

  const body = await readJson(request, { maxBytes: MAX_SUBMISSION_BYTES })
  const { submission, invalid } = parseScoreSubmission(body)
  if (invalid) throw badRequest('Invalid score', { invalid })

  try {
    const saved = await submitMatch(
      { matchStore, scoreStore },
      { uid, ...submission }
    )
    return json(saved, { status: CREATED })
  } catch (error) {
    // The token is still valid but its user was deleted (see /api/me).
    if (error.constraint === USER_FOREIGN_KEY) {
      throw new AuthError('User no longer exists', { cause: error })
    }
    throw error
  }
})
