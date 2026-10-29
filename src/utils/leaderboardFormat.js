/*
 * How a leaderboard row's figures read on screen, and the board's one-line
 * finding. Pure, so the table and its tests share one definition.
 */

const LOCALE = 'en-US'
const ordinalRules = new Intl.PluralRules(LOCALE, { type: 'ordinal' })
const ORDINAL_SUFFIX = { one: 'st', two: 'nd', few: 'rd', other: 'th' }

export const formatScore = (score) => Number(score).toLocaleString(LOCALE)

export const formatAccuracy = (accuracy) => `${Number(accuracy).toFixed(1)}%`

// Null when the match recorded no reaction time (the column is nullable).
export const formatReactionMs = (ms) =>
  ms == null ? null : Math.round(ms).toLocaleString(LOCALE)

// ISO form (2026-10-28) in the player's own time zone, so rows compare
// digit for digit.
export const formatDay = (iso) => {
  if (!iso) return null
  const date = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const ordinal = (n) => `${n}${ORDINAL_SUFFIX[ordinalRules.select(n)]}`

const plural = (n, noun) => `${n} ${noun}${n === 1 ? '' : 's'}`

/*
 * The board's finding, read just before its rows: who leads, and where the
 * signed-in player stands. Null for an empty board, which has its own line.
 */
export const boardSummary = (
  entries,
  { personal = false, uid = null } = {}
) => {
  if (entries.length === 0) return null

  const [leader] = entries
  if (personal) {
    return `Your best is ${formatScore(leader.score)} in ${leader.mode}.`
  }

  const leads =
    leader.uid === uid
      ? 'You lead'
      : `${leader.displayName ?? 'Anonymous'} leads`
  const rank = entries.findIndex((entry) => entry.uid === uid) + 1
  const standing =
    rank > 1
      ? `You're ${ordinal(rank)} of ${entries.length}.`
      : `${plural(entries.length, 'player')} on this board.`

  return `${leads} with ${formatScore(leader.score)} in ${leader.mode}. ${standing}`
}
