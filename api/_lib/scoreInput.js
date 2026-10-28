import { GAME_MODES } from '../../src/game/modes.js'
import { isIntegerIn, isNumberIn, isPlainObject } from './checks.js'

// The same bounds as the CHECK constraints in db/migrations/001_init.sql,
// so a bad submission gets a 400 naming its fields, not a database error.
const MAX_SCORE = 10_000_000
const MAX_ACCURACY = 100
const MAX_REACTION_MS = 60_000

// Scores are stored under the mode's display label, as the client sends it.
const MODE_LABELS = new Set(GAME_MODES.map(({ label }) => label))

const RULES = {
  mode: (value) => MODE_LABELS.has(value),
  score: (value) => isIntegerIn(value, 0, MAX_SCORE),
  accuracy: (value) => isNumberIn(value, 0, MAX_ACCURACY),
  // Null when a match ends with zero hits (ScoreManager.summary).
  reactionTime: (value) =>
    value === null || isIntegerIn(value, 0, MAX_REACTION_MS),
}

/*
 * Validates a POST /api/scores body. Returns { score } holding only the
 * known fields, or { invalid } listing every field that failed. Any other
 * key, such as a uid, is dropped: identity comes from the token alone.
 */
export const parseScoreSubmission = (body) => {
  if (!isPlainObject(body)) return { invalid: Object.keys(RULES) }

  const invalid = Object.entries(RULES)
    .filter(([field, isValid]) => !isValid(body[field]))
    .map(([field]) => field)
  if (invalid.length > 0) return { invalid }

  const { mode, score, accuracy, reactionTime } = body
  return { score: { mode, score, accuracy, reactionTime } }
}
