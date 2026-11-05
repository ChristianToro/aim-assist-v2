import { boardName, webhookBody } from './message.js'

/*
 * The leaderboard watcher's watchdog (PLAN-AUTOMATION.md): after
 * FAILURES_BEFORE_NOTICE failed fetches in a row it tells #mod-alerts once,
 * and once more when the board is reachable again. At one check every 30
 * minutes, that's about 90 minutes of silence before anyone hears.
 *
 * `saved` is { failures, noticed } from the last check (undefined before
 * the first). Returns the state to save and the notice to post, if any.
 */

export const FAILURES_BEFORE_NOTICE = 3

const HEALTHY = { failures: 0, noticed: false }

export const trackFetch = (saved = HEALTHY, ok) => {
  if (ok) {
    return { state: HEALTHY, notice: saved.noticed ? 'recovered' : null }
  }
  const failures = saved.failures + 1
  const down = !saved.noticed && failures >= FAILURES_BEFORE_NOTICE
  return {
    state: { failures, noticed: saved.noticed || down },
    notice: down ? 'down' : null,
  }
}

// The #mod-alerts post for a notice. `status` is the last fetch's status.
export const watchdogPost = (notice, { view, failures, status }) => {
  const board = boardName(view)
  const content =
    notice === 'down'
      ? `**Watcher:** the ${board} leaderboard can't be reached: ${failures} checks in a row failed (last: ${status}). No takeover alerts until it's back.`
      : `**Watcher:** the ${board} leaderboard is reachable again, and checks have resumed.`
  return webhookBody(content)
}
