import { describe, expect, it } from 'vitest'
import { getModeById } from './modes'
import { DEFAULT_TARGET_VALUE, scoreEvents, targetValueAt } from './scoring'

const gridshot = getModeById('gridshot')
const speed = getModeById('speed')
const survival = getModeById('survival')

const hit = (t, spawnedAt = t - 300) => ({ t, kind: 'hit', spawnedAt })
const miss = (t) => ({ t, kind: 'miss' })
const expire = (t) => ({ t, kind: 'expire' })

describe('targetValueAt', () => {
  it("is a fixed mode's base value at any time", () => {
    expect(targetValueAt(gridshot, 0)).toBe(DEFAULT_TARGET_VALUE)
    expect(targetValueAt(speed, 25_000)).toBe(150)
  })

  it("ramps Survival's value from 1x to 3x over 90 s", () => {
    expect(targetValueAt(survival, 0)).toBe(100)
    expect(targetValueAt(survival, 45_000)).toBe(200)
    expect(targetValueAt(survival, 90_000)).toBe(300)
  })

  it('holds the ramped value after the ramp ends', () => {
    expect(targetValueAt(survival, 600_000)).toBe(300)
  })

  it('rounds to whole points', () => {
    expect(targetValueAt(survival, 1_000)).toBe(102) // 102.2
  })
})

describe('scoreEvents', () => {
  it('scores an empty log as an untouched match', () => {
    expect(scoreEvents(gridshot, [])).toMatchObject({
      score: 0,
      hits: 0,
      misses: 0,
      accuracy: 100,
      averageReactionMs: null,
    })
  })

  it('applies the combo multiplier and its reset on a miss', () => {
    // 100 + 110 + 120, miss, 100
    const events = [hit(1000), hit(1500), hit(2000), miss(2400), hit(3000)]
    expect(scoreEvents(gridshot, events)).toMatchObject({
      score: 430,
      hits: 4,
      misses: 1,
      maxCombo: 3,
      accuracy: 80,
    })
  })

  it("values each hit by its target's spawn time, not the click's", () => {
    const late = hit(95_000, 90_000)
    const early = hit(95_000, 0)
    expect(scoreEvents(survival, [late]).score).toBe(300)
    expect(scoreEvents(survival, [early]).score).toBe(100)
  })

  it('counts an expiry as a miss that breaks the streak', () => {
    // Both targets spawned at 0 ms, so each is worth the base 100.
    const events = [hit(1000, 0), expire(1200), hit(2000, 0)]
    expect(scoreEvents(survival, events)).toMatchObject({
      score: 200,
      misses: 1,
      combo: 1,
    })
  })

  it('derives reaction times from spawn to click', () => {
    const events = [hit(1200, 1000), hit(2400, 2000), hit(3600, 3000)]
    expect(scoreEvents(gridshot, events)).toMatchObject({
      averageReactionMs: 400,
      bestReactionMs: 200,
      worstReactionMs: 600,
    })
  })
})
