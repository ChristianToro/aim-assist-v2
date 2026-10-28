// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { parseScoreSubmission } from './scoreInput.js'

const VALID = {
  mode: 'Gridshot',
  score: 4200,
  accuracy: 87.5,
  reactionTime: 412,
}

const invalidFields = (overrides) =>
  parseScoreSubmission({ ...VALID, ...overrides }).invalid

describe('parseScoreSubmission', () => {
  it('accepts a valid match', () => {
    expect(parseScoreSubmission(VALID)).toEqual({ score: VALID })
  })

  it('drops unknown keys, including a uid', () => {
    const { score } = parseScoreSubmission({ ...VALID, uid: 'someone-else' })
    expect(score).toEqual(VALID)
  })

  it('accepts the inclusive bounds and a null reaction time', () => {
    const edges = { score: 0, accuracy: 0, reactionTime: null }
    expect(parseScoreSubmission({ ...VALID, ...edges }).score).toMatchObject(
      edges
    )
    const maxima = { score: 10_000_000, accuracy: 100, reactionTime: 60_000 }
    expect(parseScoreSubmission({ ...VALID, ...maxima }).score).toMatchObject(
      maxima
    )
  })

  it('rejects an unknown or mis-cased mode', () => {
    expect(invalidFields({ mode: 'Aimbot' })).toEqual(['mode'])
    expect(invalidFields({ mode: 'gridshot' })).toEqual(['mode'])
  })

  it('rejects scores that are fractional, negative, too large or strings', () => {
    for (const score of [1.5, -1, 10_000_001, '4200']) {
      expect(invalidFields({ score })).toEqual(['score'])
    }
  })

  it('rejects accuracy outside 0–100 or not a finite number', () => {
    for (const accuracy of [-0.1, 100.1, Number.NaN, '87.5', null]) {
      expect(invalidFields({ accuracy })).toEqual(['accuracy'])
    }
  })

  it('requires reactionTime to be present, null or a bounded integer', () => {
    for (const reactionTime of [undefined, -1, 60_001, 412.5]) {
      expect(invalidFields({ reactionTime })).toEqual(['reactionTime'])
    }
  })

  it('lists every invalid field at once', () => {
    expect(invalidFields({ mode: 'x', score: -1 })).toEqual(['mode', 'score'])
  })

  it('rejects a body that is not an object', () => {
    for (const body of [null, [], 'score', 42]) {
      expect(parseScoreSubmission(body).invalid).toHaveLength(4)
    }
  })
})
