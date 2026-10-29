// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { getModeById } from '../src/game/modes.js'
import { maxPlausibleScore } from '../api/_lib/scoreBound.js'
import { legacyScoreFailures } from './legacyScores.js'

const GRIDSHOT_MAX = maxPlausibleScore(getModeById('gridshot'))

const row = (overrides) => ({
  mode: 'Gridshot',
  score: 9_880,
  reactionTime: 650,
  ...overrides,
})

describe('legacyScoreFailures', () => {
  it('passes a plausible score', () => {
    expect(legacyScoreFailures(row())).toEqual([])
  })

  it("passes a score at the mode's bound, and fails one above it", () => {
    expect(legacyScoreFailures(row({ score: GRIDSHOT_MAX }))).toEqual([])
    expect(legacyScoreFailures(row({ score: GRIDSHOT_MAX + 1 }))).toEqual([
      'score',
    ])
  })

  it('fails the 9,999,999 Survival score from the audit', () => {
    expect(
      legacyScoreFailures(row({ mode: 'Survival', score: 9_999_999 }))
    ).toEqual(['score'])
  })

  it('judges each score against its own mode', () => {
    // Fine for Gridshot, impossible for Precision.
    expect(
      legacyScoreFailures(row({ mode: 'Precision', score: 9_880 }))
    ).toEqual(['score'])
  })

  it('fails an inhumanly fast average reaction', () => {
    expect(legacyScoreFailures(row({ reactionTime: 119 }))).toEqual([
      'reaction',
    ])
    expect(legacyScoreFailures(row({ reactionTime: 120 }))).toEqual([])
  })

  it('fails points without hits', () => {
    expect(legacyScoreFailures(row({ reactionTime: null }))).toEqual(['noHits'])
    expect(legacyScoreFailures(row({ score: 0, reactionTime: null }))).toEqual(
      []
    )
  })
})
