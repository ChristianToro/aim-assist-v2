import { describe, expect, it } from 'vitest'
import { getModeById } from './modes'
import { rampProgress, settingAt } from './difficulty'

const gridshot = getModeById('gridshot')
const survival = getModeById('survival')

describe('rampProgress', () => {
  it('runs from 0 to 1 over the ramp and holds there', () => {
    expect(rampProgress(survival, 0)).toBe(0)
    expect(rampProgress(survival, 45_000)).toBe(0.5)
    expect(rampProgress(survival, 90_000)).toBe(1)
    expect(rampProgress(survival, 600_000)).toBe(1)
  })

  it('is always 0 for a mode without a ramp', () => {
    expect(rampProgress(gridshot, 25_000)).toBe(0)
  })
})

describe('settingAt', () => {
  it('ramps a setting toward its factor', () => {
    expect(settingAt(survival, 'spawnInterval', 1, 0)).toBe(1)
    expect(settingAt(survival, 'spawnInterval', 1, 90_000)).toBeCloseTo(0.45)
    expect(settingAt(survival, 'targetLifespan', 2.6, 45_000)).toBeCloseTo(
      (2.6 + 2.6 * 0.55) / 2
    )
  })

  it("returns the base unchanged for a mode without a ramp, even if it's Infinity", () => {
    expect(settingAt(gridshot, 'targetLifespan', Infinity, 20_000)).toBe(
      Infinity
    )
  })
})
