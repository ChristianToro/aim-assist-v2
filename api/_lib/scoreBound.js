import { settingAt } from '../../src/game/difficulty.js'
import { MAX_MULTIPLIER } from '../../src/game/ScoreManager.js'
import { targetValueAt } from '../../src/game/scoring.js'
import {
  CLOCK_TOLERANCE_MS,
  MAX_CLICKS_PER_SECOND,
  ROUNDING_MS,
} from './matchCheck.js'
import { matchTtlSeconds } from './matchPolicy.js'

const MS_PER_SECOND = 1000

/*
 * The highest score any event log can earn in `mode` and still pass
 * matchCheck.js: an upper bound, not a likely score. It's derived from
 * the same rules, so it applies to scores saved before matches existed,
 * which have no log to check (scripts/legacy-report.js).
 */

// The longest game time a passing log can span: a timed mode's duration,
// or for Survival, its ticket's lifetime plus the clock tolerance.
const maxGameMs = (mode) =>
  Number.isFinite(mode.duration)
    ? mode.duration * MS_PER_SECOND
    : matchTtlSeconds(mode) * MS_PER_SECOND + CLOCK_TOLERANCE_MS

// The ramp is linear, so a setting's extremes are at its two ends.
const extremes = (mode, setting, base, endMs) => [
  settingAt(mode, setting, base, 0),
  settingAt(mode, setting, base, endMs),
]

export const maxPlausibleScore = (mode) => {
  const gameMs = maxGameMs(mode)
  // spawnRate: hit targets spawn at least the fastest interval apart.
  const fastestIntervalMs =
    Math.min(
      ...extremes(mode, 'spawnInterval', mode.spawner.spawnInterval, gameMs)
    ) * MS_PER_SECOND
  const spawnLimited = Math.floor(gameMs / (fastestIntervalMs - ROUNDING_MS))
  // clickRate: at most the cap in each whole second of the match.
  const clickLimited =
    MAX_CLICKS_PER_SECOND * (Math.floor(gameMs / MS_PER_SECOND) + 1)
  const topValue = Math.max(targetValueAt(mode, 0), targetValueAt(mode, gameMs))
  const topPoints = Math.round(topValue * MAX_MULTIPLIER)
  return Math.min(spawnLimited, clickLimited) * topPoints
}
