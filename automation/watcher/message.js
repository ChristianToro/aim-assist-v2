/*
 * Discord webhook bodies for the leaderboard watcher's alerts. The plain
 * post states the facts of a takeover. It's the A2 alert, and the fallback
 * when Claude's verdict is missing (alert.js).
 */

const BOARD_NAMES = { all: 'all-time', daily: 'daily', weekly: 'weekly' }

const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS
// Under two days reads better in hours ("31 h") than as "1 day".
const HOURS_UP_TO_MS = 2 * DAY_MS

// Player names are user-controlled: escape Discord markdown so a name can't
// restyle the message or hide a link. allowed_mentions (below) stops pings.
export const escapeMarkdown = (text) =>
  String(text ?? 'A player').replace(/[\\*_~`|>[\]()]/g, '\\$&')

export const formatDuration = (ms) => {
  if (ms < HOUR_MS) return `${Math.max(1, Math.round(ms / MINUTE_MS))} min`
  if (ms < HOURS_UP_TO_MS) return `${Math.round(ms / HOUR_MS)} h`
  return `${Math.round(ms / DAY_MS)} days`
}

const formatScore = (score) => score.toLocaleString('en-US')

const describeRun = ({ score, mode, accuracy }) =>
  `${formatScore(score)} in ${mode} (${accuracy.toFixed(1)}% accuracy)`

const heldFor = (previous, current) =>
  formatDuration(new Date(current.createdAt) - new Date(previous.createdAt))

const takeoverLines = ({ current, previous }, name, board) => [
  `${name} took #1 on the ${board} board: ${describeRun(current)}.`,
  previous
    ? `Previous #1: ${escapeMarkdown(previous.displayName)} with ${formatScore(previous.score)} in ${previous.mode}, held for ${heldFor(previous, current)}.`
    : 'First #1 on this board.',
]

const extendedLines = ({ current, previous }, name, board) => [
  `${name} raised their own #1 on the ${board} board: ${describeRun(current)}, up from ${formatScore(previous.score)} in ${previous.mode}.`,
]

// The new #1's name, escaped and bold.
export const playerName = (event) =>
  `**${escapeMarkdown(event.current.displayName)}**`

// A webhook body that can never ping anyone, whatever the text holds.
export const webhookBody = (content) => ({
  content,
  allowed_mentions: { parse: [] },
})

// The plain alert for a decide() event: the facts, no AI.
export const plainPost = (event) => {
  const board = BOARD_NAMES[event.view] ?? event.view
  const lines =
    event.kind === 'extended'
      ? extendedLines(event, playerName(event), board)
      : takeoverLines(event, playerName(event), board)
  return webhookBody(lines.join('\n'))
}
