import { GAME_MODES } from '../../src/game/modes.js'
import { isIntegerIn, isPlainObject } from './checks.js'
import { matchTtlSeconds } from './matchPolicy.js'

/*
 * The shape check for a POST /api/scores body, { matchId, events }. It
 * runs before matchCheck.js, which may then assume well-formed events.
 * The score itself is never read from the body: the server computes it
 * from the events (scoring.js).
 */

// About 40 minutes of Survival at 4 clicks a second, far past the longest
// run so far, and it fits MAX_SUBMISSION_BYTES (~48 bytes per event).
export const MAX_EVENTS = 10_000
export const MAX_SUBMISSION_BYTES = 512 * 1024

// No match outlives its ticket, so no game time can pass the longest one.
const MAX_GAME_MS = Math.max(...GAME_MODES.map(matchTtlSeconds)) * 1000
const EVENT_KINDS = new Set(['hit', 'miss', 'expire'])
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const isGameTime = (value) => isIntegerIn(value, 0, MAX_GAME_MS)

const isEvent = (event) =>
  isPlainObject(event) &&
  EVENT_KINDS.has(event.kind) &&
  isGameTime(event.t) &&
  (event.kind !== 'hit' || isGameTime(event.spawnedAt))

const RULES = {
  matchId: (value) => typeof value === 'string' && UUID.test(value),
  events: (value) =>
    Array.isArray(value) && value.length <= MAX_EVENTS && value.every(isEvent),
}

// Only an event's known fields go on to the checks and the scoring.
const toEvent = ({ t, kind, spawnedAt }) =>
  kind === 'hit' ? { t, kind, spawnedAt } : { t, kind }

/*
 * Returns { submission } holding only the known fields, or { invalid }
 * listing every field that failed. Any other key (a uid, a score, the old
 * client's whole body) is dropped or fails here.
 */
export const parseScoreSubmission = (body) => {
  if (!isPlainObject(body)) return { invalid: Object.keys(RULES) }

  const invalid = Object.entries(RULES)
    .filter(([field, isValid]) => !isValid(body[field]))
    .map(([field]) => field)
  if (invalid.length > 0) return { invalid }

  return {
    submission: {
      matchId: body.matchId.toLowerCase(),
      events: body.events.map(toEvent),
    },
  }
}
