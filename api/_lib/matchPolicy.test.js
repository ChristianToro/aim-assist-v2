// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { GAME_MODES, getModeById } from '../../src/game/modes.js'
import { matchTtlSeconds, parseMatchRequest } from './matchPolicy.js'

describe('matchTtlSeconds', () => {
  it("is a timed match's duration plus 30 minutes", () => {
    expect(matchTtlSeconds(getModeById('gridshot'))).toBe(30 + 30 * 60)
  })

  it('is 2 hours for endless Survival', () => {
    expect(matchTtlSeconds(getModeById('survival'))).toBe(2 * 60 * 60)
  })
})

describe('parseMatchRequest', () => {
  it.each(GAME_MODES.map((mode) => [mode.label, mode]))(
    'accepts %s, returning its configuration',
    (label, mode) => {
      expect(parseMatchRequest({ mode: label })).toEqual({ mode })
    }
  )

  it.each([
    ['an unknown mode', { mode: 'Aimbot' }],
    ['a mode id instead of its label', { mode: 'gridshot' }],
    ['a missing mode', {}],
    ['an array', ['Gridshot']],
    ['null', null],
  ])('rejects %s', (_, body) => {
    expect(parseMatchRequest(body)).toEqual({ invalid: ['mode'] })
  })

  it('ignores a uid in the body', () => {
    const { mode } = parseMatchRequest({ mode: 'Speed', uid: 'someone-else' })
    expect(mode.id).toBe('speed')
  })
})
