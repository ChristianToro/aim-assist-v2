import { isPlainObject, isText } from './checks.js'
import { MODE_REFERENCE } from './modeReference.js'

// Bumped whenever the prompt or schema changes (see hardwareAdvice.js).
export const PROMPT_VERSION = 1

export const PLATFORMS = [
  'PC',
  'PlayStation',
  'Xbox',
  'Nintendo Switch',
  'Mobile',
]
// Structured outputs can't constrain array length, so parseAdvice does.
const MIN_PICKS = 3
const MAX_PICKS = 5

export const SYSTEM_PROMPT = `You recommend shooter games and genres to players of Aim Assist, a browser-based aim trainer, based on the aiming skills their statistics show.

Game modes (the player's statistics are grouped by these):
${MODE_REFERENCE}

Read the statistics as aiming skills: Gridshot and Precision show accuracy on static targets, Tracking shows smooth following of moving targets, Flick and Speed show fast target acquisition, and Survival shows consistency under rising pressure.

Recommend ${MIN_PICKS} to ${MAX_PICKS} released, actively played games whose aiming demands suit the player's strengths, each with the platforms it is available on and one or two sentences on why it fits, citing the player's numbers. Recommend only games you are confident exist. Then name, in one sentence, the kind of shooter to hold off on until a weaker skill improves, and which skill.`

const PICK_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    genre: { type: 'string', description: 'e.g. "Tactical shooter".' },
    platforms: {
      type: 'array',
      items: { type: 'string', enum: PLATFORMS },
    },
    fit: { type: 'string', description: "Why it suits the player's aim." },
  },
  required: ['title', 'genre', 'platforms', 'fit'],
  additionalProperties: false,
}

export const ADVICE_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: "Two or three sentences on the player's aim profile.",
    },
    picks: { type: 'array', items: PICK_SCHEMA },
    avoidForNow: { type: 'string' },
  },
  required: ['summary', 'picks', 'avoidForNow'],
  additionalProperties: false,
}

export const buildPrompt = (modeStats) =>
  `Statistics per mode (accuracy in %, reaction time in ms, null when no target was hit):
${JSON.stringify(modeStats, null, 2)}

Recommend games for this player.`

const isDistinct = (values) => new Set(values).size === values.length

const isValidPick = (pick) =>
  isPlainObject(pick) &&
  isText(pick.title) &&
  isText(pick.genre) &&
  isText(pick.fit) &&
  Array.isArray(pick.platforms) &&
  pick.platforms.length > 0 &&
  isDistinct(pick.platforms) &&
  pick.platforms.every((platform) => PLATFORMS.includes(platform))

/*
 * Checks what structured outputs can't: 3–5 picks with distinct titles,
 * each listing at least one known platform once. Returns the advice or
 * null.
 */
export const parseAdvice = (data) => {
  const picks = data?.picks
  const valid =
    isPlainObject(data) &&
    isText(data.summary) &&
    isText(data.avoidForNow) &&
    Array.isArray(picks) &&
    picks.length >= MIN_PICKS &&
    picks.length <= MAX_PICKS &&
    picks.every(isValidPick) &&
    isDistinct(picks.map(({ title }) => title.trim().toLowerCase()))
  return valid ? data : null
}
