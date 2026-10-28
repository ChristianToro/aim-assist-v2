import { GAME_MODES } from '../../src/game/modes.js'

const describeMode = ({ label, description, duration, missLimit, spawner }) => {
  const length = Number.isFinite(duration)
    ? `${duration} s`
    : `endless, ends after ${missLimit} misses`
  const lifespan = Number.isFinite(spawner.targetLifespan)
    ? `targets expire after ${spawner.targetLifespan} s`
    : 'targets stay until hit'
  return `- ${label} (${length}): ${description} Target radius ${spawner.minRadius}–${spawner.maxRadius} px; ${lifespan}.`
}

// One line per game mode, for the insight system prompts: what each mode
// asks of the player, so Claude can read the per-mode statistics.
export const MODE_REFERENCE = GAME_MODES.map(describeMode).join('\n')
