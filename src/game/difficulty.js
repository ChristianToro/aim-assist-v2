import { clamp, lerp } from '../utils/math.js'

/*
 * The difficulty ramp of modes with a `scaling` config (Survival), as
 * pure functions of game time in ms. GameSession ramps its spawner with
 * them, and the server (api/_lib/matchCheck.js) checks a match's log
 * against the same values, so the two can't drift.
 */
const MS_PER_SECOND = 1000

// Each spawner setting the ramp changes, and the mode.scaling factor it
// reaches by the ramp's end.
export const RAMP_FACTORS = {
  spawnInterval: 'intervalFactor',
  minRadius: 'radiusFactor',
  maxRadius: 'radiusFactor',
  spacing: 'spacingFactor',
  targetLifespan: 'lifespanFactor',
}

// 0 at the start of a match, 1 from rampSeconds on; always 0 without a ramp.
export const rampProgress = (mode, ms) =>
  mode.scaling ? clamp(ms / MS_PER_SECOND / mode.scaling.rampSeconds, 0, 1) : 0

// One spawner setting at game time ms, ramped from its base value.
export const settingAt = (mode, setting, base, ms) => {
  if (!mode.scaling) return base
  const factor = mode.scaling[RAMP_FACTORS[setting]]
  return lerp(base, base * factor, rampProgress(mode, ms))
}
