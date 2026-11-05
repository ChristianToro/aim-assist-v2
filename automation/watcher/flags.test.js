// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { MODE_CEILINGS, pctOfCeiling, ruleFlags } from './flags.js'

const run = (overrides) => ({
  mode: 'Speed',
  score: 13125,
  reactionTime: 977,
  ...overrides,
})

describe('MODE_CEILINGS', () => {
  it("holds every mode's highest accepted score", () => {
    expect(MODE_CEILINGS).toEqual({
      Gridshot: 93000,
      Precision: 5400,
      Speed: 19800,
      Tracking: 7400,
      Flick: 13500,
      Survival: 9624000,
    })
  })
})

describe('pctOfCeiling', () => {
  it('rounds to a whole percentage', () => {
    expect(pctOfCeiling(run())).toBe(66)
  })

  it('is null for a mode it does not know', () => {
    expect(pctOfCeiling(run({ mode: 'Unknown' }))).toBeNull()
  })
})

describe('ruleFlags', () => {
  it('raises nothing for an ordinary #1', () => {
    expect(ruleFlags({ current: run(), runnerUp: null })).toEqual([])
  })

  it('flags a score at 90% of its ceiling or more', () => {
    expect(
      ruleFlags({ current: run({ score: 17820 }), runnerUp: null })
    ).toEqual(['Score is 90% of the Speed ceiling.'])
  })

  it('flags an average reaction under 150 ms', () => {
    expect(
      ruleFlags({ current: run({ reactionTime: 149 }), runnerUp: null })
    ).toEqual(['Average reaction time is 149 ms.'])
  })

  it('ignores a missing reaction time', () => {
    expect(
      ruleFlags({ current: run({ reactionTime: null }), runnerUp: null })
    ).toEqual([])
  })

  it('flags a lead of 50% or more over #2 in the same mode', () => {
    const runnerUp = run({ score: 8000 })
    expect(ruleFlags({ current: run({ score: 12000 }), runnerUp })).toEqual([
      'Score is 50% ahead of #2 in Speed.',
    ])
  })

  it("ignores a lead over #2 in another mode, where scores don't compare", () => {
    const runnerUp = run({ mode: 'Precision', score: 3000 })
    expect(ruleFlags({ current: run(), runnerUp })).toEqual([])
  })
})
