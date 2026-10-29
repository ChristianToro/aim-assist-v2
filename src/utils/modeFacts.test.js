import { describe, expect, it } from 'vitest'
import { GAME_MODES, getModeById } from '../game/modes'
import { modeFacts } from './modeFacts'

describe('modeFacts', () => {
  it('states target count, lifespan and round length from the config', () => {
    expect(modeFacts(getModeById('flick'))).toBe(
      'Up to 3 targets at once, each gone in 0.9 s, 30-second rounds.'
    )
  })

  it('handles targets that never expire', () => {
    expect(modeFacts(getModeById('gridshot'))).toBe(
      'Up to 3 targets at once, each up until you hit it, 30-second rounds.'
    )
  })

  it('describes an untimed round by its miss limit', () => {
    expect(modeFacts(getModeById('survival'))).toMatch(
      /the round ends after 5 misses\.$/
    )
  })

  it('reads naturally for a single target', () => {
    const mode = {
      duration: 30,
      spawner: { maxTargets: 1, targetLifespan: 2 },
    }
    expect(modeFacts(mode)).toBe(
      'One target at a time, each gone in 2 s, 30-second rounds.'
    )
  })

  it('covers every shipped mode', () => {
    for (const mode of GAME_MODES) {
      expect(modeFacts(mode)).toMatch(/^(Up to \d+ targets|One target)/)
    }
  })
})
