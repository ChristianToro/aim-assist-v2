import { describe, expect, it } from 'vitest'
import { Spawner } from './Spawner'
import { distance } from '../utils/math'

const SIZE = { width: 500, height: 500 }

describe('Spawner', () => {
  it('spawns one target after the interval elapses', () => {
    const spawner = new Spawner({ spawnInterval: 0.5 })
    const targets = []
    spawner.update(0.4, SIZE, targets)
    expect(targets).toHaveLength(0)
    spawner.update(0.2, SIZE, targets)
    expect(targets).toHaveLength(1)
  })

  it('places targets fully inside the canvas', () => {
    const spawner = new Spawner({ spawnInterval: 0.1, maxTargets: 20 })
    const targets = []
    for (let i = 0; i < 40; i += 1) spawner.update(0.2, SIZE, targets)
    expect(targets.length).toBeGreaterThan(0)
    targets.forEach(({ x, y, radius }) => {
      expect(x).toBeGreaterThanOrEqual(radius)
      expect(x).toBeLessThanOrEqual(SIZE.width - radius)
      expect(y).toBeGreaterThanOrEqual(radius)
      expect(y).toBeLessThanOrEqual(SIZE.height - radius)
    })
  })

  it('never spawns overlapping targets', () => {
    const spacing = 10
    const spawner = new Spawner({
      spawnInterval: 0.01,
      maxTargets: 12,
      minRadius: 10,
      maxRadius: 14,
      spacing,
    })
    const targets = []
    for (let i = 0; i < 100; i += 1) spawner.update(0.02, SIZE, targets)

    for (let a = 0; a < targets.length; a += 1) {
      for (let b = a + 1; b < targets.length; b += 1) {
        const gap = distance(
          targets[a].x,
          targets[a].y,
          targets[b].x,
          targets[b].y
        )
        expect(gap).toBeGreaterThanOrEqual(
          targets[a].radius + targets[b].radius + spacing
        )
      }
    }
  })

  it('respects maxTargets, then refills a freed slot immediately', () => {
    const spawner = new Spawner({ spawnInterval: 0.5, maxTargets: 2 })
    const targets = []
    for (let i = 0; i < 10; i += 1) spawner.update(0.6, SIZE, targets)
    expect(targets).toHaveLength(2)

    // A destroyed target's slot refills on the next tick (timer is
    // capped at one interval while the field is full).
    targets.pop()
    spawner.update(0.016, SIZE, targets)
    expect(targets).toHaveLength(2)
  })

  it('skips spawning when the canvas is too small', () => {
    const spawner = new Spawner({ spawnInterval: 0.1 })
    const targets = []
    spawner.update(0.2, { width: 40, height: 40 }, targets)
    expect(targets).toHaveLength(0)
  })
})
