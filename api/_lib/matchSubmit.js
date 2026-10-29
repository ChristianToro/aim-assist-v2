import { scoreEvents } from '../../src/game/scoring.js'
import { badRequest, HttpError } from './http.js'
import { checkMatch } from './matchCheck.js'
import { modeByLabel } from './matchPolicy.js'

const NOT_FOUND = 404
const CONFLICT = 409
const GONE = 410

/*
 * Redeems a match ticket with its event log (shape-checked by
 * scoreInput.js): checks the log is plausible for the match's mode and
 * real elapsed time, scores it on the server, and stores the figures in
 * the same statement that claims the match. Takes the stores as
 * arguments so tests can pass in-memory ones.
 *
 * Returns the stored score's { id, createdAt, score, accuracy,
 * reactionTime }.
 */
export const submitMatch = async (
  { matchStore, scoreStore },
  { uid, matchId, events }
) => {
  const match = await matchStore.find(uid, matchId)
  if (!match) throw new HttpError(NOT_FOUND, 'Match not found')
  if (match.submitted) throw new HttpError(CONFLICT, 'Match already submitted')
  if (match.expired) throw new HttpError(GONE, 'Match expired')

  const mode = modeByLabel(match.mode)
  const invalid = checkMatch({ mode, events, elapsedMs: match.elapsedMs })
  if (invalid.length > 0) throw badRequest('Implausible match', { invalid })

  const { score, accuracy, averageReactionMs } = scoreEvents(mode, events)
  const figures = { score, accuracy, reactionTime: averageReactionMs }
  const saved = await scoreStore.insertForMatch(uid, matchId, figures)
  // Another submit claimed it (or it expired) since the read above.
  if (!saved) throw new HttpError(CONFLICT, 'Match already submitted')
  return { ...saved, ...figures }
}
