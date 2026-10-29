import { ScoreManager } from './ScoreManager.js'
import { lerp } from '../utils/math.js'

/*
 * Scoring from a match's event log — the one definition of a score that
 * the client (live HUD, results screen) and the server (api/_lib) share,
 * so the two can't drift. Pure: no canvas, no clock, no React.
 *
 * Event log entries, with `t` and `spawnedAt` in game-time ms (pauses
 * excluded, see GameSession):
 *   { t, kind: 'hit', spawnedAt }  — a click on a target spawned at spawnedAt
 *   { t, kind: 'miss' }            — a click on empty space
 *   { t, kind: 'expire' }          — a target timed out (miss-limited modes)
 */
export const DEFAULT_TARGET_VALUE = 100

const MS_PER_SECOND = 1000

// A target's base points, from the game time it spawned at. Modes with a
// `scaling` ramp (Survival) grow it from the base value to
// base × (1 + valueFactor) over rampSeconds.
export const targetValueAt = (mode, spawnedAtMs) => {
  const base = mode.spawner.targetValue ?? DEFAULT_TARGET_VALUE
  if (!mode.scaling) return base
  const { rampSeconds, valueFactor } = mode.scaling
  const progress = spawnedAtMs / MS_PER_SECOND / rampSeconds
  return Math.round(lerp(base, base * (1 + valueFactor), progress))
}

// Applies one event to a ScoreManager; returns the points a hit earned.
// Expiries cost the streak exactly like a missed click.
export const applyEvent = (scores, mode, { t, kind, spawnedAt }) =>
  kind === 'hit'
    ? scores.registerHit(targetValueAt(mode, spawnedAt), t - spawnedAt)
    : scores.registerMiss()

// A whole match's statistics, replayed from its log (ScoreManager.summary).
export const scoreEvents = (mode, events) => {
  const scores = new ScoreManager()
  events.forEach((event) => applyEvent(scores, mode, event))
  return scores.summary()
}
