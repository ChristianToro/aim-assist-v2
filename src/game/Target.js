import { clamp, distance } from '../utils/math'
import { FALLBACK_PALETTE } from './palette'

// Concentric rings, outermost first. Colors come from the active theme's
// palette at draw time (see palette.js), so targets restyle themselves
// without any target needing to be rebuilt.
const RINGS = [
  { scale: 1, token: 'targetOuter' },
  { scale: 0.66, token: 'targetMid' },
  { scale: 0.33, token: 'targetInner' },
]

const SPAWN_ANIMATION_SECONDS = 0.15
const DESPAWN_ANIMATION_SECONDS = 0.2

export class Target {
  constructor({
    x,
    y,
    radius,
    lifespan = Infinity,
    value = 100,
    vx = 0,
    vy = 0,
  }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.lifespan = lifespan
    this.value = value
    this.vx = vx
    this.vy = vy
    this.age = 0
    this.isAlive = true
    this.expired = false // died of old age (vs. clicked) — see GameSession
  }

  update(dt, bounds) {
    this.age += dt
    if (this.age >= this.lifespan) {
      this.isAlive = false
      this.expired = true
      return
    }

    // Moving targets (Tracking mode) bounce off the canvas edges.
    if ((this.vx !== 0 || this.vy !== 0) && bounds) {
      this.x += this.vx * dt
      this.y += this.vy * dt
      const { radius } = this
      if (this.x < radius || this.x > bounds.width - radius) {
        this.vx *= -1
        this.x = clamp(this.x, radius, bounds.width - radius)
      }
      if (this.y < radius || this.y > bounds.height - radius) {
        this.vy *= -1
        this.y = clamp(this.y, radius, bounds.height - radius)
      }
    }
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

  draw(ctx, palette = FALLBACK_PALETTE) {
    const drawRadius = this.radius * this.scale
    RINGS.forEach(({ scale, token }) => {
      ctx.beginPath()
      ctx.arc(this.x, this.y, drawRadius * scale, 0, Math.PI * 2)
      ctx.fillStyle = palette[token]
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
