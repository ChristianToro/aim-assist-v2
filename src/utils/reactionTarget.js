// Pure helpers for the landing page's warm-up target (useWarmupTarget).

// Keep the target's centre this far (in % of the arena) from every edge,
// so the whole ring stays inside at any arena size.
export const TARGET_MARGIN_PCT = 15

const inRange = (random) =>
  TARGET_MARGIN_PCT + random() * (100 - 2 * TARGET_MARGIN_PCT)

// A new target centre as percentages of the arena: { x, y }.
export const randomTargetPosition = (random = Math.random) => ({
  x: inRange(random),
  y: inRange(random),
})

// Whole milliseconds between the target appearing and the hit.
export const reactionMs = (shownAt, hitAt) =>
  Math.max(0, Math.round(hitAt - shownAt))

export const bestReaction = (best, latest) =>
  best === null ? latest : Math.min(best, latest)
