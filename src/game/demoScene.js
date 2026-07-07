/*
 * Milestone 3 demo scene: a target-style circle bouncing around the canvas.
 * Proves out the GameCanvas loop (update/render contract, delta time,
 * resizing). Replaced by the real GameEngine in Milestone 4.
 */
const RADIUS = 36
const RINGS = [
  { scale: 1, color: '#164e63' }, // outer (cyan-900)
  { scale: 0.66, color: '#0e7490' }, // middle (cyan-700)
  { scale: 0.33, color: '#22d3ee' }, // bullseye (cyan-400)
]

export const createDemoScene = () => {
  const circle = { x: 100, y: 100, radius: RADIUS, vx: 240, vy: 170 }

  const update = (dt, { width, height }) => {
    circle.x += circle.vx * dt
    circle.y += circle.vy * dt

    // Bounce off the edges, clamping so a resize can't trap the circle outside.
    const { radius } = circle
    if (circle.x < radius || circle.x > width - radius) {
      circle.vx *= -1
      circle.x = Math.min(Math.max(circle.x, radius), width - radius)
    }
    if (circle.y < radius || circle.y > height - radius) {
      circle.vy *= -1
      circle.y = Math.min(Math.max(circle.y, radius), height - radius)
    }
  }

  const render = (ctx) => {
    RINGS.forEach(({ scale, color }) => {
      ctx.beginPath()
      ctx.arc(circle.x, circle.y, circle.radius * scale, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    })
  }

  return { update, render }
}
