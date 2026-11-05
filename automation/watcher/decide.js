import { periodStart } from '../../api/_lib/leaderboardView.js'

/*
 * The leaderboard watcher's change detection (PLAN-AUTOMATION.md): compares
 * a board's current #1 with the #1 saved at the last check and says what
 * happened. Pure, so the Node-RED function node only moves data in and out.
 *
 * `saved` is the state from the last check: undefined before the first one,
 * else { top }, where top is null for an empty board. `entries` is the
 * board as GET /api/leaderboard returns it, best first.
 *
 * Returns { action, state, event }:
 * - 'none': nothing changed. No state, nothing to save.
 * - 'seed', 'empty', 'removal': save `state` now, no alert.
 * - 'takeover', 'extended' (ALERTS): post `event`, then save `state`, so a
 *   failed post is tried again at the next check.
 */

export const ALERTS = ['takeover', 'extended']

// Only what the alert needs, so the saved state stays small.
const snapshot = (entry) => ({
  id: entry.id,
  uid: entry.uid,
  displayName: entry.displayName,
  mode: entry.mode,
  score: entry.score,
  accuracy: entry.accuracy,
  reactionTime: entry.reactionTime,
  createdAt: entry.createdAt,
})

const at = (entry) => new Date(entry.createdAt)

// The saved #1 if it still belongs to the board's current window. A daily
// board's #1 from yesterday isn't one today's #1 took over from.
const previousTop = (saved, view, now) => {
  const start = periodStart(view, now)
  if (!saved.top || (start && at(saved.top) < start)) return null
  return saved.top
}

export const decide = ({ saved, entries, view, now = new Date() }) => {
  const top = entries[0] ? snapshot(entries[0]) : null
  const state = { top }

  // First check ever: remember the board without alerting.
  if (saved === undefined) return { action: 'seed', state }
  if (top?.id === saved.top?.id) return { action: 'none' }
  if (!top) return { action: 'empty', state }

  const previous = previousTop(saved, view, now)
  // Scores are only ever added, and ties rank the earlier score higher, so
  // a #1 older than the saved one means the saved one was deleted (its
  // account was, and its scores with it): no one took anything.
  if (previous && at(top) < at(previous)) return { action: 'removal', state }

  const kind = previous?.uid === top.uid ? 'extended' : 'takeover'
  const runnerUp = entries[1] ? snapshot(entries[1]) : null
  return {
    action: kind,
    state,
    event: { kind, view, current: top, previous, runnerUp },
  }
}
