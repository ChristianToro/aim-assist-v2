import { plainPost, playerName, webhookBody } from './message.js'

/*
 * Merges the rule flags and Claude's verdict into the final alert
 * (PLAN-AUTOMATION.md): its label, which picks the Discord channel, and
 * the webhook body. `verdict` is parseVerdict()'s result, null when Claude
 * failed, in which case the rules alone decide and the plain post goes out.
 */

export const label = (flags, verdict) =>
  flags.length > 0 || verdict?.label === 'review' ? 'review' : 'celebrate'

// Claude's announcement with the real name put in. The name never went
// to Claude, so it's filled in only here.
const announcement = (event, verdict) =>
  verdict.message.replaceAll('{player}', playerName(event))

const bullets = (lines) => lines.map((line) => `- ${line}`)

// For #mod-alerts: the facts, then why it needs a look.
const reviewContent = (event, flags, verdict) => {
  const why = [
    ...bullets(flags.map((flag) => `Rule: ${flag}`)),
    ...bullets(verdict?.reasons ?? []),
  ]
  const source = verdict
    ? `Claude: ${verdict.label} (confidence ${verdict.confidence.toFixed(2)})`
    : 'Claude was unavailable: flagged by the rules alone.'
  return [
    `**Review:** ${plainPost(event).content}`,
    ...why,
    `_${source}_`,
  ].join('\n')
}

export const alertPost = ({ event, flags, verdict }) => {
  const final = label(flags, verdict)
  if (final === 'review') {
    return {
      label: final,
      payload: webhookBody(reviewContent(event, flags, verdict)),
    }
  }
  return {
    label: final,
    payload: verdict
      ? webhookBody(announcement(event, verdict))
      : plainPost(event),
  }
}
