import { maxPlausibleScore } from '../../api/_lib/scoreBound.js'
import { GAME_MODES } from '../../src/game/modes.js'

/*
 * The rule-based half of the takeover triage (PLAN-AUTOMATION.md): any
 * flag here sends the alert to review, whatever Claude says.
 */

// The highest score the server accepts in each mode, by display label.
export const MODE_CEILINGS = Object.fromEntries(
  GAME_MODES.map((mode) => [mode.label, maxPlausibleScore(mode)])
)

// The rule thresholds, also stated in Claude's prompt (claude.js).
export const NEAR_CEILING = 0.9
// Sustained average reaction under this is beyond human (~200–300 ms).
export const MIN_HUMAN_REACTION_MS = 150
export const BIG_LEAD_RATIO = 1.5

// A run's score as a whole percentage of its mode's ceiling.
export const pctOfCeiling = ({ mode, score }) =>
  MODE_CEILINGS[mode] ? Math.round((score / MODE_CEILINGS[mode]) * 100) : null

const nearCeiling = (run) =>
  MODE_CEILINGS[run.mode] && run.score >= NEAR_CEILING * MODE_CEILINGS[run.mode]

// Scores only compare within a mode, so the lead counts only when #2
// played the same one.
const leadPct = (run, runnerUp) =>
  runnerUp?.mode === run.mode && runnerUp.score > 0
    ? Math.round((run.score / runnerUp.score - 1) * 100)
    : null

// The flags a decide() event raises, as short sentences for the prompt and
// the review post.
export const ruleFlags = ({ current, runnerUp }) => {
  const flags = []
  if (nearCeiling(current)) {
    flags.push(
      `Score is ${pctOfCeiling(current)}% of the ${current.mode} ceiling.`
    )
  }
  if (
    current.reactionTime !== null &&
    current.reactionTime < MIN_HUMAN_REACTION_MS
  ) {
    flags.push(`Average reaction time is ${current.reactionTime} ms.`)
  }
  const lead = leadPct(current, runnerUp)
  if (lead !== null && lead >= (BIG_LEAD_RATIO - 1) * 100) {
    flags.push(`Score is ${lead}% ahead of #2 in ${current.mode}.`)
  }
  return flags
}
