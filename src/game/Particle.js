import { randomInRange } from '../utils/random'
import { FALLBACK_PALETTE } from './palette'

const DRAG = 0.92 // per-frame velocity retention at 60fps (see update)
const BURST_COUNT = 14
const BURST_COLOR_COUNT = 3 // palette.burst entries a burst cycles through

export class Particle {
  // Particles store an index into the palette's burst colors rather than a
  // hex value, so a theme change recolors particles already in flight.
  constructor({ x, y, vx, vy, size, colorIndex, life }) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.size = size
    this.colorIndex = colorIndex
    this.life = life
    this.initialLife = life
  }

  get isAlive() {
    return this.life > 0
  }

  update(dt) {
    this.life -= dt
    this.x += this.vx * dt
    this.y += this.vy * dt
    // Frame-rate-independent drag: DRAG is calibrated for a 60fps step.
    const drag = Math.pow(DRAG, dt * 60)
    this.vx *= drag
    this.vy *= drag
  }

  draw(ctx, palette = FALLBACK_PALETTE) {
    const opacity = Math.max(this.life / this.initialLife, 0)
    ctx.globalAlpha = opacity
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size * opacity, 0, Math.PI * 2)
    ctx.fillStyle = palette.burst[this.colorIndex]
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

// Radial burst emitted where a target is destroyed.
export const createBurst = (x, y) =>
  Array.from({ length: BURST_COUNT }, (_, i) => {
    // Even angular spread with jitter so bursts feel organic, not spoked.
    const angle = (i / BURST_COUNT) * Math.PI * 2 + randomInRange(-0.25, 0.25)
    const speed = randomInRange(120, 340)
    return new Particle({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: randomInRange(2, 5),
      colorIndex: i % BURST_COLOR_COUNT,
      life: randomInRange(0.35, 0.6),
    })
  })
