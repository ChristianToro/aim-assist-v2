// Combo multiplier: +0.1x per consecutive hit, capped at 2x.
const MULTIPLIER_STEP = 0.1
const MULTIPLIER_MAX_COMBO = 10
export const MAX_MULTIPLIER = 1 + MULTIPLIER_MAX_COMBO * MULTIPLIER_STEP

/*
 * ScoreManager — owns all match statistics.
 *
 * Pure bookkeeping: no canvas, no React, no timing sources of its own.
 * It's fed through scoring.js's applyEvent, so the live HUD and a replay
 * of the match's event log produce the same figures.
 */
export class ScoreManager {
  score = 0
  hits = 0
  misses = 0
  combo = 0
  maxCombo = 0
  #reactionTimesMs = []

  // Multiplier earned by the current streak; applies to the next hit.
  get multiplier() {
    return 1 + Math.min(this.combo, MULTIPLIER_MAX_COMBO) * MULTIPLIER_STEP
  }

  get accuracy() {
    const total = this.hits + this.misses
    return total === 0 ? 100 : (this.hits / total) * 100
  }

  // A hit on a target worth `value` base points, `reactionMs` after it
  // spawned. Returns the points awarded (used for floating score text).
  registerHit(value, reactionMs) {
    const points = Math.round(value * this.multiplier)
    this.score += points
    this.hits += 1
    this.combo += 1
    this.maxCombo = Math.max(this.maxCombo, this.combo)
    this.#reactionTimesMs.push(reactionMs)
    return points
  }

  registerMiss() {
    this.misses += 1
    this.combo = 0
  }

  // Live stats for the HUD.
  snapshot() {
    return {
      score: this.score,
      hits: this.hits,
      misses: this.misses,
      combo: this.combo,
      maxCombo: this.maxCombo,
      multiplier: this.multiplier,
      accuracy: this.accuracy,
    }
  }

  // Full match statistics for the results screen.
  summary() {
    const times = this.#reactionTimesMs
    const average = times.length
      ? times.reduce((sum, t) => sum + t, 0) / times.length
      : null
    return {
      ...this.snapshot(),
      averageReactionMs: average === null ? null : Math.round(average),
      bestReactionMs: times.length ? Math.min(...times) : null,
      worstReactionMs: times.length ? Math.max(...times) : null,
    }
  }

  reset() {
    this.score = 0
    this.hits = 0
    this.misses = 0
    this.combo = 0
    this.maxCombo = 0
    this.#reactionTimesMs = []
  }
}
