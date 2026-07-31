import { beforeEach, describe, expect, it } from 'vitest'
import { ScoreManager } from './ScoreManager'

const target = (value = 100, age = 0.3) => ({ value, age })

describe('ScoreManager', () => {
  let scores

  beforeEach(() => {
    scores = new ScoreManager()
  })

  it('starts with 100% accuracy and a 1x multiplier', () => {
    expect(scores.accuracy).toBe(100)
    expect(scores.multiplier).toBe(1)
  })

  it('awards base value on the first hit (no streak yet)', () => {
    expect(scores.registerHit(target(100))).toBe(100)
    expect(scores.score).toBe(100)
    expect(scores.hits).toBe(1)
  })

  it('grows the multiplier by 0.1x per consecutive hit', () => {
    scores.registerHit(target()) // streak 0 → 1x
    const second = scores.registerHit(target()) // streak 1 → 1.1x
    expect(second).toBe(110)
  })

  it('caps the multiplier at 2x after a 10-hit streak', () => {
    for (let i = 0; i < 12; i += 1) scores.registerHit(target())
    expect(scores.multiplier).toBe(2)
    expect(scores.registerHit(target(100))).toBe(200)
  })

  it('resets the combo (not the score) on a miss', () => {
    scores.registerHit(target())
    scores.registerHit(target())
    scores.registerMiss()
    expect(scores.combo).toBe(0)
    expect(scores.maxCombo).toBe(2)
    expect(scores.score).toBeGreaterThan(0)
    expect(scores.multiplier).toBe(1)
  })

  it('computes accuracy from hits and misses', () => {
    scores.registerHit(target())
    scores.registerHit(target())
    scores.registerHit(target())
    scores.registerMiss()
    expect(scores.accuracy).toBe(75)
  })

  it('summarizes reaction times in milliseconds', () => {
    scores.registerHit(target(100, 0.2))
    scores.registerHit(target(100, 0.4))
    scores.registerHit(target(100, 0.6))
    const summary = scores.summary()
    expect(summary.averageReactionMs).toBe(400)
    expect(summary.bestReactionMs).toBe(200)
    expect(summary.worstReactionMs).toBe(600)
  })

  it('reports null reaction stats with no hits', () => {
    const summary = scores.summary()
    expect(summary.averageReactionMs).toBeNull()
    expect(summary.bestReactionMs).toBeNull()
    expect(summary.worstReactionMs).toBeNull()
  })

  it('reset clears everything', () => {
    scores.registerHit(target())
    scores.registerMiss()
    scores.reset()
    expect(scores.score).toBe(0)
    expect(scores.hits).toBe(0)
    expect(scores.misses).toBe(0)
    expect(scores.maxCombo).toBe(0)
    expect(scores.summary().averageReactionMs).toBeNull()
  })
})
