import { clamp, distance } from '../utils/math'

// Concentric rings, outermost first (cyan-900 → cyan-700 → cyan-400).
const RINGS = [
  { scale: 1, color: '#164e63' },
  { scale: 0.66, color: '#0e7490' },
  { scale: 0.33, color: '#22d3ee' },
]

const SPAWN_ANIMATION_SECONDS = 0.15
const DESPAWN_ANIMATION_SECONDS = 0.2

export class Target {
  constructor({ x, y, radius, lifespan = Infinity, value = 100 }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.lifespan = lifespan
    this.value = value
    this.age = 0
    this.isAlive = true
  }

  update(dt) {
    this.age += dt
    if (this.age >= this.lifespan) this.isAlive = false
  }

  // Visual scale: grows in on spawn, shrinks out as lifespan runs down.
  get scale() {
    const growIn = clamp(this.age / SPAWN_ANIMATION_SECONDS, 0, 1)
    if (this.lifespan === Infinity) return growIn
    const shrinkOut = clamp(
      (this.lifespan - this.age) / DESPAWN_ANIMATION_SECONDS,
      0,
      1
    )
    return Math.min(growIn, shrinkOut)
  }

  draw(ctx) {
    const drawRadius = this.radius * this.scale
    RINGS.forEach(({ scale, color }) => {
      ctx.beginPath()
      ctx.arc(this.x, this.y, drawRadius * scale, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    })
  }

  // Hit test against the full radius (not the animated visual scale),
  // so shrinking targets stay fair to click.
  containsPoint(pointX, pointY) {
    return distance(this.x, this.y, pointX, pointY) <= this.radius
  }

  destroy() {
    this.isAlive = false
  }
}
