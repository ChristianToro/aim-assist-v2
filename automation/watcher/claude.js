import { MODE_REFERENCE } from '../../api/_lib/modeReference.js'
import {
  BIG_LEAD_RATIO,
  MIN_HUMAN_REACTION_MS,
  NEAR_CEILING,
  pctOfCeiling,
} from './flags.js'

/*
 * The AI step of the takeover triage (PLAN-AUTOMATION.md): the request
 * Node-RED's http request node sends to the Messages API, and a check of
 * the answer. Claude sees numbers only, never a player's name, so a name
 * can't steer the label; it writes {player} where the name goes.
 */

export const MESSAGES_URL = 'https://api.anthropic.com/v1/messages'
export const API_VERSION = '2026-10-21'
export const MODEL = 'claude-haiku-5-5'
// Room for adaptive thinking at low effort plus a short JSON answer.
const MAX_TOKENS = 2048
const MAX_REASONS = 3
const MAX_MESSAGE_CHARS = 280
const MS_PER_HOUR = 60 * 60 * 1000

const asPct = (ratio) => Math.round(ratio * 100)
const NEAR_CEILING_PCT = asPct(NEAR_CEILING)
const BIG_LEAD_PCT = asPct(BIG_LEAD_RATIO - 1)

export const LABELS = ['celebrate', 'review']

export const SYSTEM_PROMPT = `You triage takeovers of first place on the leaderboard of Aim Assist, a browser aim trainer. The owner gets one Discord alert per takeover and wants to know which ones deserve a closer look before players see them.

The server scores every match from its click log and rejects matches that are impossible for the mode, so every score you see is possible. The question is whether it is plausible for a human.

Game modes:
${MODE_REFERENCE}

Each mode has a ceiling, the highest score the server accepts; pctOfModeCeiling is a score as a percentage of it. The ceiling is a theoretical maximum (every target hit at the fastest spawn rate with the full combo multiplier), so strong human play lands well below it, often between 60% and 85%. reactionMs is the average time from a target appearing to its hit: it runs longer in modes where targets wait to be hit, and an average under about ${MIN_HUMAN_REACTION_MS} ms is not humanly sustainable. The all-time board ranks raw scores across modes, so a gap between runs in different modes means little.

The input gives the new #1 (new), the #1 it replaced (previous, null when the board was empty), the current #2 (runnerUp), whether the new #1 is the same player raising their own score (samePlayer), and the rule-based flags already raised (ruleFlags).

Rules already send three cases to review, and appear in ruleFlags when they fire: a score at ${NEAR_CEILING_PCT}% of the ceiling or more, an average reaction under ${MIN_HUMAN_REACTION_MS} ms, and a lead of ${BIG_LEAD_PCT}% or more over #2 in the same mode. Your job is what they miss.

Label "review" only for a concrete reason tied to figures in the input: a combination that is unlikely together (such as perfect accuracy with a reaction time near the floor), or a jump far beyond the previous #1 in the same mode. A score under ${NEAR_CEILING_PCT}% of the ceiling is not a reason on its own, and neither is high accuracy on its own. Otherwise label "celebrate". When rule flags were raised, still give your own label and reasons. Give your confidence in the label from 0 to 1.

Give at most ${MAX_REASONS} reasons, each one short sentence tied to a figure from the input.

Write message as a Discord announcement of at most ${MAX_MESSAGE_CHARS} characters, upbeat and specific: name the mode, the score and the accuracy. You don't know the player's name: write {player} where it goes. No hashtags, no @mentions.`

export const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    label: { type: 'string', enum: LABELS },
    confidence: { type: 'number' },
    reasons: { type: 'array', items: { type: 'string' } },
    message: { type: 'string' },
  },
  required: ['label', 'confidence', 'reasons', 'message'],
  additionalProperties: false,
}

const round1 = (value) => Math.round(value * 10) / 10

const describeRun = (run) =>
  run && {
    mode: run.mode,
    score: run.score,
    accuracy: round1(run.accuracy),
    reactionMs: run.reactionTime,
    pctOfModeCeiling: pctOfCeiling(run),
  }

const hoursBetween = (earlier, later) =>
  round1(
    (new Date(later.createdAt) - new Date(earlier.createdAt)) / MS_PER_HOUR
  )

// What Claude sees of a decide() event: figures only, no names or ids.
export const claudeInput = (event, flags) => ({
  board: event.view,
  new: describeRun(event.current),
  previous: event.previous && {
    ...describeRun(event.previous),
    heldForHours: hoursBetween(event.previous, event.current),
  },
  runnerUp: describeRun(event.runnerUp),
  samePlayer: event.kind === 'extended',
  ruleFlags: flags,
})

// The Messages API request body.
export const claudeRequest = (input) => ({
  model: MODEL,
  max_tokens: MAX_TOKENS,
  system: SYSTEM_PROMPT,
  messages: [{ role: 'user', content: JSON.stringify(input, null, 2) }],
  output_config: {
    effort: 'low',
    format: { type: 'json_schema', schema: VERDICT_SCHEMA },
  },
})

const parseJson = (text) => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const clamp01 = (value) => Math.min(1, Math.max(0, value))

/*
 * The verdict from a Messages API response body, or null when there is
 * none to trust (a refusal, a cut-off answer, a shape the schema forbids).
 * The schema can't carry length or range limits, so they're applied here.
 */
export const parseVerdict = (response) => {
  if (response?.stop_reason !== 'end_turn') return null
  const text = response.content?.find((block) => block.type === 'text')?.text
  const verdict = text ? parseJson(text) : null
  if (
    !LABELS.includes(verdict?.label) ||
    typeof verdict.confidence !== 'number' ||
    !Array.isArray(verdict.reasons) ||
    !verdict.reasons.every((reason) => typeof reason === 'string') ||
    typeof verdict.message !== 'string'
  ) {
    return null
  }
  return {
    label: verdict.label,
    confidence: clamp01(verdict.confidence),
    reasons: verdict.reasons.slice(0, MAX_REASONS),
    message: verdict.message.slice(0, MAX_MESSAGE_CHARS),
  }
}
