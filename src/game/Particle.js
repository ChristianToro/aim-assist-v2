import { randomInRange } from '../utils/random'

const DRAG = 0.92 // per-frame velocity retention at 60fps (see update)
const BURST_COUNT = 14
const BURST_COLORS = ['#22d3ee', '#0e7490', '#e4e4e7']

export class Particle {
  constructor({ x, y, vx, vy, size, color, life }) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.size = size
    this.color = color
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

  draw(ctx) {
    const opacity = Math.max(this.life / this.initialLife, 0)
    ctx.globalAlpha = opacity
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size * opacity, 0, Math.PI * 2)
    ctx.fillStyle = this.color
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
      color: BURST_COLORS[i % BURST_COLORS.length],
      life: randomInRange(0.35, 0.6),
    })
  })
