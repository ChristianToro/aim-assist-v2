import { Target } from './Target'
import { distance } from '../utils/math'
import { randomInRange } from '../utils/random'

/*
 * Spawner — creates targets on an interval, never overlapping live ones.
 *
 * Placement uses rejection sampling: pick a random point inside the canvas
 * margins, reject it if it crowds an existing target, retry up to
 * maxAttempts. On a crowded canvas the spawn is simply skipped this
 * interval rather than looping forever.
 */
export class Spawner {
  #sinceLastSpawn = 0

  constructor({
    spawnInterval = 0.8, // seconds between spawns
    maxTargets = 5,
    minRadius = 22,
    maxRadius = 42,
    spacing = 14, // minimum gap between target edges
    targetLifespan = 3, // seconds before an unclicked target expires
    targetSpeed = null, // [min, max] px/s for moving targets, or null
    maxAttempts = 30,
  } = {}) {
    this.spawnInterval = spawnInterval
    this.maxTargets = maxTargets
    this.minRadius = minRadius
    this.maxRadius = maxRadius
    this.spacing = spacing
    this.targetLifespan = targetLifespan
    this.targetSpeed = targetSpeed
    this.maxAttempts = maxAttempts
  }

  reset() {
    this.#sinceLastSpawn = 0
  }

  // Advances the spawn timer; pushes at most one new target per interval.
  // The timer caps at one interval, so when the field is full a freed
  // slot is refilled immediately (Gridshot-style). `now` is the game time
  // in ms, stamped on the new target for the match's event log.
  update(dt, size, targets, now = 0) {
    this.#sinceLastSpawn = Math.min(
      this.#sinceLastSpawn + dt,
      this.spawnInterval
    )
    if (this.#sinceLastSpawn < this.spawnInterval) return
    if (targets.length >= this.maxTargets) return

    const target = this.#trySpawn(size, targets, now)
    if (target) {
      targets.push(target)
      this.#sinceLastSpawn = 0
    }
  }

  #trySpawn({ width, height }, targets, now) {
    const radius = randomInRange(this.minRadius, this.maxRadius)
    const margin = radius + this.spacing

    // Canvas too small to fit this target (e.g. mid-resize) — skip.
    if (width <= margin * 2 || height <= margin * 2) return null

    for (let attempt = 0; attempt < this.maxAttempts; attempt += 1) {
      const x = randomInRange(margin, width - margin)
      const y = randomInRange(margin, height - margin)
      const crowded = targets.some(
        (other) =>
          distance(x, y, other.x, other.y) <
          radius + other.radius + this.spacing
      )
      if (!crowded) {
        let vx = 0
        let vy = 0
        if (this.targetSpeed) {
          const angle = randomInRange(0, Math.PI * 2)
          const speed = randomInRange(...this.targetSpeed)
          vx = Math.cos(angle) * speed
          vy = Math.sin(angle) * speed
        }
        return new Target({
          x,
          y,
          radius,
          lifespan: this.targetLifespan,
          spawnedAt: now,
          vx,
          vy,
        })
      }
    }
    return null
  }
}
