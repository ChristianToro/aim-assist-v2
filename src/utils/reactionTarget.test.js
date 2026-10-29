import { describe, expect, it } from 'vitest'
import {
  TARGET_MARGIN_PCT,
  bestReaction,
  randomTargetPosition,
  reactionMs,
} from './reactionTarget'

describe('randomTargetPosition', () => {
  it('keeps the target clear of every edge', () => {
    expect(randomTargetPosition(() => 0)).toEqual({
      x: TARGET_MARGIN_PCT,
      y: TARGET_MARGIN_PCT,
    })
    expect(randomTargetPosition(() => 1)).toEqual({
      x: 100 - TARGET_MARGIN_PCT,
      y: 100 - TARGET_MARGIN_PCT,
    })
  })

  it('draws x and y independently', () => {
    const values = [0.5, 0]
    const { x, y } = randomTargetPosition(() => values.shift())
    expect(x).toBe(50)
    expect(y).toBe(TARGET_MARGIN_PCT)
  })
})

describe('reactionMs', () => {
  it('rounds to whole milliseconds', () => {
    expect(reactionMs(1000, 1312.6)).toBe(313)
  })

  it('never reports a negative time', () => {
    expect(reactionMs(500, 400)).toBe(0)
  })
})

describe('bestReaction', () => {
  it('takes the first time as the best', () => {
    expect(bestReaction(null, 320)).toBe(320)
  })

  it('keeps the faster of two times', () => {
    expect(bestReaction(280, 320)).toBe(280)
    expect(bestReaction(280, 250)).toBe(250)
  })
})
