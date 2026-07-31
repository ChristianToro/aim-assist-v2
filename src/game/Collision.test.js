import { describe, expect, it } from 'vitest'
import { findHitTarget } from './Collision'
import { Target } from './Target'

const targetAt = (x, y, radius = 20) => new Target({ x, y, radius })

describe('findHitTarget', () => {
  it('returns the target containing the point', () => {
    const targets = [targetAt(100, 100), targetAt(300, 300)]
    expect(findHitTarget(305, 295, targets)).toBe(targets[1])
  })

  it('returns null when nothing is hit (a miss)', () => {
    const targets = [targetAt(100, 100)]
    expect(findHitTarget(200, 200, targets)).toBeNull()
  })

  it('prefers the topmost (last-drawn) of overlapping targets', () => {
    const bottom = targetAt(100, 100, 30)
    const top = targetAt(110, 100, 30)
    expect(findHitTarget(105, 100, [bottom, top])).toBe(top)
  })

  it('ignores dead targets', () => {
    const dead = targetAt(100, 100)
    dead.destroy()
    expect(findHitTarget(100, 100, [dead])).toBeNull()
  })

  it('hits exactly on the edge radius', () => {
    const target = targetAt(100, 100, 20)
    expect(findHitTarget(120, 100, [target])).toBe(target)
    expect(findHitTarget(121, 100, [target])).toBeNull()
  })
})
