import { settingAt } from '../../src/game/difficulty.js'

/*
 * Plausibility checks for a match's event log (src/game/scoring.js), run
 * by POST /api/scores before it scores the log. Each rule is derived from
 * the engine's own behavior or a human limit; the engine-derived ones
 * hold exactly for every real match, up to the log's 1 ms rounding.
 *
 * Takes a log that already passed the body's shape check: an array of
 * { t, kind, spawnedAt? } with whole-ms times. `elapsedMs` is the
 * wall-clock time since the server issued the match.
 *
 * This bounds what a log can claim; it doesn't prove a human made it
 * (see PLAN-SCORING.md).
 */

// Human limits. Checked in S2 against the real matches in
// fixtures/real-matches.json: their peak was 8 clicks/s and their lowest
// average reaction 648 ms, so both leave room for faster players.
export const MAX_CLICKS_PER_SECOND = 15
export const MIN_AVERAGE_REACTION_MS = 120
// Slack between the server's clock and the game's: the match is issued
// in parallel with the engine starting, and the submit takes a moment.
export const CLOCK_TOLERANCE_MS = 2000

// Game times are rounded to whole ms, so a difference can be off by one.
export const ROUNDING_MS = 1
const MS_PER_SECOND = 1000

const isClick = ({ kind }) => kind !== 'expire'

// The most clicks within any one-second window (two pointers over times).
const peakClicksPerSecond = (clicks) => {
  let peak = 0
  let start = 0
  clicks.forEach(({ t }, end) => {
    while (t - clicks[start].t >= MS_PER_SECOND) start += 1
    peak = Math.max(peak, end - start + 1)
  })
  return peak
}

// A setting the spawner held when it spawned a target at `ms`, in ms.
const spawnerMsAt = (mode, setting, ms) =>
  settingAt(mode, setting, mode.spawner[setting], ms) * MS_PER_SECOND

// A hit lands no earlier than its target spawned and before it expired.
const isTimelyHit =
  (mode) =>
  ({ t, spawnedAt }) =>
    spawnedAt >= 0 &&
    t >= spawnedAt &&
    t - spawnedAt <=
      spawnerMsAt(mode, 'targetLifespan', spawnedAt) + ROUNDING_MS

/*
 * The Spawner waits a full spawn interval after each spawn (and after
 * the start) before the next, so the hit targets' spawn times, in order,
 * are at least the interval in force at the later one apart. A target
 * can't be hit twice, since two never share a spawn time.
 */
const hasPlausibleSpawns = (mode, hits) => {
  const spawns = hits.map(({ spawnedAt }) => spawnedAt).sort((a, b) => a - b)
  return spawns.every((spawnedAt, i) => {
    const previous = i === 0 ? 0 : spawns[i - 1]
    const interval = spawnerMsAt(mode, 'spawnInterval', spawnedAt)
    return spawnedAt - previous >= interval - ROUNDING_MS
  })
}

const averageReactionMs = (hits) =>
  hits.reduce((sum, { t, spawnedAt }) => sum + t - spawnedAt, 0) / hits.length

// Survival ends in the frame its misses reach the limit, so the limit is
// reached, and reached only at the log's last game time.
const endsAtMissLimit = (mode, events) => {
  const lastT = events.at(-1)?.t
  const misses = events.filter(({ kind }) => kind !== 'hit')
  const missesBeforeEnd = misses.filter(({ t }) => t < lastT).length
  return misses.length >= mode.missLimit && missesBeforeEnd < mode.missLimit
}

// Each rule names a failure in the 400's `invalid` list. A rule that
// doesn't apply to the mode passes.
const RULES = {
  order: ({ events }) =>
    events.every(({ t }, i) => t >= (i === 0 ? 0 : events[i - 1].t)),
  expiry: ({ mode, events }) =>
    mode.expiryCountsAsMiss || events.every(({ kind }) => kind !== 'expire'),
  hitTiming: ({ mode, hits }) => hits.every(isTimelyHit(mode)),
  spawnRate: ({ mode, hits }) => hasPlausibleSpawns(mode, hits),
  clickRate: ({ clicks }) =>
    peakClicksPerSecond(clicks) <= MAX_CLICKS_PER_SECOND,
  reaction: ({ hits }) =>
    hits.length === 0 || averageReactionMs(hits) >= MIN_AVERAGE_REACTION_MS,
  duration: ({ durationMs, events }) =>
    events.every(({ t }) => t <= durationMs),
  tooEarly: ({ durationMs, elapsedMs }) =>
    !Number.isFinite(durationMs) ||
    elapsedMs >= durationMs - CLOCK_TOLERANCE_MS,
  missLimit: ({ mode, events }) =>
    !mode.missLimit || endsAtMissLimit(mode, events),
  clock: ({ events, elapsedMs }) =>
    (events.at(-1)?.t ?? 0) <= elapsedMs + CLOCK_TOLERANCE_MS,
}

// Returns the names of the rules the match fails; empty when plausible.
export const checkMatch = ({ mode, events, elapsedMs }) => {
  const match = {
    mode,
    events,
    elapsedMs,
    durationMs: mode.duration * MS_PER_SECOND,
    hits: events.filter(({ kind }) => kind === 'hit'),
    clicks: events.filter(isClick),
  }
  return Object.entries(RULES)
    .filter(([, isPlausible]) => !isPlausible(match))
    .map(([name]) => name)
}
