import { describe, expect, it } from 'vitest'
import { Target } from './Target'

describe('Target', () => {
  it('expires when its lifespan runs out (expired flag set)', () => {
    const target = new Target({ x: 0, y: 0, radius: 20, lifespan: 1 })
    target.update(1.5)
    expect(target.isAlive).toBe(false)
    expect(target.expired).toBe(true)
  })

  it('destroy() kills without marking as expired', () => {
    const target = new Target({ x: 0, y: 0, radius: 20 })
    target.destroy()
    expect(target.isAlive).toBe(false)
    expect(target.expired).toBe(false)
  })

  it('never expires with an infinite lifespan', () => {
    const target = new Target({ x: 0, y: 0, radius: 20 })
    target.update(9999)
    expect(target.isAlive).toBe(true)
  })

  it('grows in over the spawn animation, clamped at full scale', () => {
    const target = new Target({ x: 0, y: 0, radius: 20 })
    expect(target.scale).toBe(0)
    target.update(0.075)
    expect(target.scale).toBeCloseTo(0.5)
    target.update(1)
    expect(target.scale).toBe(1)
  })

  it('shrinks out as the lifespan runs down', () => {
    const target = new Target({ x: 0, y: 0, radius: 20, lifespan: 1 })
    target.update(0.95)
    // 0.05s remaining of a 0.2s despawn window → 25% scale.
    expect(target.scale).toBeCloseTo(0.25)
  })

  it('bounces off the canvas edges when moving', () => {
    const target = new Target({ x: 25, y: 200, radius: 20, vx: -100, vy: 0 })
    target.update(1, { width: 400, height: 400 })
    expect(target.vx).toBe(100)
    expect(target.x).toBe(20) // clamped to the wall
  })

  it('hit-tests against the full radius regardless of animation scale', () => {
    // Freshly spawned (scale 0, visually invisible) and nearly-despawned
    // (visually tiny) targets are both clickable at full radius.
    const fresh = new Target({ x: 100, y: 100, radius: 20 })
    expect(fresh.scale).toBe(0)
    expect(fresh.containsPoint(118, 100)).toBe(true)

    const fading = new Target({ x: 100, y: 100, radius: 20, lifespan: 1 })
    fading.update(0.95)
    expect(fading.scale).toBeLessThan(0.5)
    expect(fading.containsPoint(118, 100)).toBe(true)
  })
})
