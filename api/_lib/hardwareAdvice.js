import { GAME_MODES } from '../../src/game/modes.js'

// Bumped whenever the prompt or schema changes, so cached answers built
// from the old wording are regenerated instead of reused.
export const PROMPT_VERSION = 1

const MIN_DPI = 100
const MAX_DPI = 32_000
export const POLLING_RATES_HZ = [125, 250, 500, 1000, 2000, 4000, 8000]

const isInteger = (value, min, max) =>
  Number.isInteger(value) && value >= min && value <= max

const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isText = (value) => typeof value === 'string' && value.trim() !== ''

/*
 * The player's current mouse setup from the request body, all optional:
 * { setup: { dpi, pollingRateHz } }. Returns { setup } with only the
 * known, valid fields, or { invalid } naming the bad ones.
 */
export const parseSetup = (body) => {
  const raw = body?.setup ?? {}
  if (!isPlainObject(raw)) return { invalid: ['setup'] }

  const invalid = []
  if (raw.dpi !== undefined && !isInteger(raw.dpi, MIN_DPI, MAX_DPI)) {
    invalid.push('setup.dpi')
  }
  if (
    raw.pollingRateHz !== undefined &&
    !POLLING_RATES_HZ.includes(raw.pollingRateHz)
  ) {
    invalid.push('setup.pollingRateHz')
  }
  if (invalid.length > 0) return { invalid }

  return {
    setup: {
      dpi: raw.dpi ?? null,
      pollingRateHz: raw.pollingRateHz ?? null,
    },
  }
}

const describeMode = ({ label, description, duration, missLimit, spawner }) => {
  const length = Number.isFinite(duration)
    ? `${duration} s`
    : `endless, ends after ${missLimit} misses`
  const lifespan = Number.isFinite(spawner.targetLifespan)
    ? `targets expire after ${spawner.targetLifespan} s`
    : 'targets stay until hit'
  return `- ${label} (${length}): ${description} Target radius ${spawner.minRadius}–${spawner.maxRadius} px; ${lifespan}.`
}

export const SYSTEM_PROMPT = `You advise players of Aim Assist, a browser-based aim trainer, on their mouse hardware settings: DPI, sensitivity and polling rate.

The game runs in a browser and reads the operating system's cursor, so it has no in-game sensitivity: sensitivity means the OS pointer speed and acceleration settings, and their combination with DPI.

Game modes (the player's statistics are grouped by these):
${GAME_MODES.map(describeMode).join('\n')}

Base each recommendation on the player's statistics, and say which numbers led to it. The statistics can't measure hardware directly, so frame advice as likely improvements, not certainties. If the player gave their current DPI or polling rate, recommend changes relative to it; if not, recommend a sensible starting value. Keep every rationale to one or two sentences.`

export const ADVICE_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: "Two or three sentences on the player's aim profile.",
    },
    dpi: {
      type: 'object',
      properties: {
        recommended: { type: 'integer' },
        rationale: { type: 'string' },
      },
      required: ['recommended', 'rationale'],
      additionalProperties: false,
    },
    sensitivity: {
      type: 'object',
      properties: {
        recommendation: {
          type: 'string',
          description: 'OS pointer speed and acceleration advice.',
        },
        rationale: { type: 'string' },
      },
      required: ['recommendation', 'rationale'],
      additionalProperties: false,
    },
    pollingRateHz: {
      type: 'object',
      properties: {
        recommended: { type: 'integer', enum: POLLING_RATES_HZ },
        rationale: { type: 'string' },
      },
      required: ['recommended', 'rationale'],
      additionalProperties: false,
    },
  },
  required: ['summary', 'dpi', 'sensitivity', 'pollingRateHz'],
  additionalProperties: false,
}

export const buildPrompt = (modeStats, setup) =>
  `Current setup (null means the player didn't say):
${JSON.stringify(setup)}

Statistics per mode (accuracy in %, reaction time in ms, null when no target was hit):
${JSON.stringify(modeStats, null, 2)}

Recommend DPI, sensitivity and polling rate for this player.`

/*
 * Checks Claude's answer beyond what structured outputs guarantee: the
 * schema can't carry numeric bounds, so an out-of-range DPI is caught
 * here. Returns the advice or null.
 */
export const parseAdvice = (data) => {
  const valid =
    isPlainObject(data) &&
    isText(data.summary) &&
    isInteger(data.dpi?.recommended, MIN_DPI, MAX_DPI) &&
    isText(data.dpi.rationale) &&
    isText(data.sensitivity?.recommendation) &&
    isText(data.sensitivity.rationale) &&
    POLLING_RATES_HZ.includes(data.pollingRateHz?.recommended) &&
    isText(data.pollingRateHz.rationale)
  return valid ? data : null
}
