// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { GAME_MODES, getModeById } from '../../src/game/modes.js'
import { scoreEvents } from '../../src/game/scoring.js'
import { playMatch, SURVIVAL_SCRIPT } from '../../src/game/testing/playMatch.js'
import realMatches from './fixtures/real-matches.json'
import { maxPlausibleScore } from './scoreBound.js'

describe('maxPlausibleScore', () => {
  it('caps Gridshot by its click rate: 465 clicks at 200 points', () => {
    // 15 clicks in each of 31 seconds (0–30 s inclusive), each worth the
    // base 100 at the 2x multiplier.
    expect(maxPlausibleScore(getModeById('gridshot'))).toBe(465 * 200)
  })

  it('caps Flick by its spawn rate: 54 targets at 250 points', () => {
    // Targets 0.55 s apart (less the 1 ms rounding slack) over 30 s.
    expect(maxPlausibleScore(getModeById('flick'))).toBe(54 * 250)
  })

  it("keeps Survival's bound under the database's 10,000,000 check", () => {
    const bound = maxPlausibleScore(getModeById('survival'))
    expect(bound).toBeGreaterThan(1_000_000)
    expect(bound).toBeLessThan(10_000_000)
  })

  it.each(realMatches.map(({ mode, events }) => [mode, events]))(
    'is above the real %s match',
    (modeId, events) => {
      const mode = getModeById(modeId)
      expect(scoreEvents(mode, events).score).toBeLessThanOrEqual(
        maxPlausibleScore(mode)
      )
    }
  )

  it.each(GAME_MODES.map((mode) => [mode.id, mode]))(
    'is above a scripted %s match',
    (modeId, mode) => {
      const script = modeId === 'survival' ? SURVIVAL_SCRIPT : {}
      const { score } = playMatch(modeId, script).summary
      expect(score).toBeLessThanOrEqual(maxPlausibleScore(mode))
    }
  )
})
