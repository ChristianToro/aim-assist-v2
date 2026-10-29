/*
 * One factual line about a game mode, built from its config so the landing
 * page can't drift from what the engine really does, e.g.
 * "Up to 3 targets at once, each gone in 0.9 s, 30-second rounds."
 */
const targetCount = ({ maxTargets }) =>
  maxTargets === 1
    ? 'One target at a time'
    : `Up to ${maxTargets} targets at once`

const targetLife = ({ targetLifespan }) =>
  Number.isFinite(targetLifespan)
    ? `each gone in ${targetLifespan} s`
    : 'each up until you hit it'

const roundLength = ({ duration, missLimit }) =>
  Number.isFinite(duration)
    ? `${duration}-second rounds`
    : `the round ends after ${missLimit} misses`

export const modeFacts = (mode) =>
  `${targetCount(mode.spawner)}, ${targetLife(mode.spawner)}, ${roundLength(mode)}.`
