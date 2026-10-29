import { GAME_MODES } from '../../src/game/modes.js'
import { isPlainObject } from './checks.js'

// Matches a player can start in any rolling 10 minutes. Each ticket allows
// one save, so this caps how many parallel tickets can reach the boards.
export const ISSUE_LIMIT = 20
export const ISSUE_WINDOW_MS = 10 * 60 * 1000

const SECONDS_PER_MINUTE = 60
// How long after a timed match's end it can still be submitted.
const SUBMIT_GRACE_SECONDS = 30 * SECONDS_PER_MINUTE
// Survival is endless, so its tickets get a fixed lifetime instead.
const ENDLESS_TTL_SECONDS = 2 * 60 * SECONDS_PER_MINUTE

// Seconds from issue until an unsubmitted match expires.
export const matchTtlSeconds = (mode) =>
  Number.isFinite(mode.duration)
    ? mode.duration + SUBMIT_GRACE_SECONDS
    : ENDLESS_TTL_SECONDS

// Matches are stored under the mode's display label, like scores.
const MODES_BY_LABEL = new Map(GAME_MODES.map((mode) => [mode.label, mode]))

// A stored match's mode configuration, from its label.
export const modeByLabel = (label) => MODES_BY_LABEL.get(label)

/*
 * Validates a POST /api/matches body, { mode: <label> }. Returns { mode }
 * holding the mode's configuration, or { invalid: ['mode'] }. Any other
 * key is ignored: the player comes from the token alone.
 */
export const parseMatchRequest = (body) => {
  const mode = isPlainObject(body) ? modeByLabel(body.mode) : undefined
  return mode ? { mode } : { invalid: ['mode'] }
}
