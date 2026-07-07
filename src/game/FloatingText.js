const RISE_SPEED = 55 // px per second
const LIFE_SECONDS = 0.7

// Score text ("+150") that rises and fades where a target was hit.
export class FloatingText {
  constructor(text, x, y) {
    this.text = text
    this.x = x
    this.y = y
    this.life = LIFE_SECONDS
  }

  get isAlive() {
    return this.life > 0
  }

  update(dt) {
    this.life -= dt
    this.y -= RISE_SPEED * dt
  }

  draw(ctx) {
    ctx.globalAlpha = Math.max(this.life / LIFE_SECONDS, 0)
    ctx.font = '600 16px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillStyle = '#e4e4e7'
    ctx.fillText(this.text, this.x, this.y)
    ctx.globalAlpha = 1
    ctx.textAlign = 'start'
  }
}
