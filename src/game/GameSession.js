import { Spawner } from './Spawner'
import { ScoreManager } from './ScoreManager'
import { Timer } from './Timer'
import { findHitTarget } from './Collision'
import { createBurst } from './Particle'
import { FloatingText } from './FloatingText'

// Sweep any list of entities with an isAlive flag, newest-safe.
const sweepDead = (entities) => {
  for (let i = entities.length - 1; i >= 0; i -= 1) {
    if (!entities[i].isAlive) entities.splice(i, 1)
  }
}

const DEFAULT_DURATION_SECONDS = 30

/*
 * GameSession — one playable match: spawning targets, scoring, and a
 * countdown. Implements the engine's scene contract.
 *
 * Communication with React is one-way and event-driven:
 *   onHud(snapshot)     — on hit, miss, or displayed-second change
 *   onGameOver(summary) — once, when the countdown reaches zero
 */
export const createGameSession = ({
  duration = DEFAULT_DURATION_SECONDS,
  onHud,
  onGameOver,
} = {}) => {
  const targets = []
  const particles = []
  const floaters = []
  const spawner = new Spawner()
  const scores = new ScoreManager()
  const timer = new Timer(duration)
  let isOver = false
  let lastDisplayedSecond = timer.displaySeconds

  const emitHud = () =>
    onHud?.({ ...scores.snapshot(), timeRemaining: timer.displaySeconds })

  const update = (dt, size, input) => {
    if (isOver) return

    timer.update(dt)

    // Resolve clicks first so hit targets disappear this frame.
    const clicks = input.consumeClicks()
    clicks.forEach(({ x, y }) => {
      const hit = findHitTarget(x, y, targets)
      if (hit) {
        const points = scores.registerHit(hit)
        hit.destroy()
        particles.push(...createBurst(hit.x, hit.y))
        floaters.push(new FloatingText(`+${points}`, hit.x, hit.y - hit.radius))
      } else {
        scores.registerMiss()
      }
    })

    // Sweep dead entities (clicked, expired, or faded out).
    sweepDead(targets)
    sweepDead(particles)
    sweepDead(floaters)

    targets.forEach((target) => target.update(dt))
    particles.forEach((particle) => particle.update(dt))
    floaters.forEach((floater) => floater.update(dt))
    spawner.update(dt, size, targets)

    // Push stats to React only when something displayed changed.
    const secondChanged = timer.displaySeconds !== lastDisplayedSecond
    lastDisplayedSecond = timer.displaySeconds
    if (clicks.length > 0 || secondChanged) emitHud()

    if (timer.isFinished) {
      isOver = true
      onGameOver?.(scores.summary())
    }
  }

  const render = (ctx) => {
    targets.forEach((target) => target.draw(ctx))
    particles.forEach((particle) => particle.draw(ctx))
    floaters.forEach((floater) => floater.draw(ctx))
  }

  const reset = () => {
    targets.length = 0
    particles.length = 0
    floaters.length = 0
    spawner.reset()
    scores.reset()
    timer.reset()
    isOver = false
    lastDisplayedSecond = timer.displaySeconds
    emitHud()
  }

  return { targets, update, render, reset }
}
