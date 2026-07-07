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

/*
 * GameSession — one playable match of a given mode: spawning targets,
 * scoring, and a countdown. Implements the engine's scene contract.
 * Mode presets (see modes.js) fully parameterize the session.
 *
 * Communication with React is one-way and event-driven:
 *   onHud(snapshot)     — on hit, miss, or displayed-second change
 *   onGameOver(summary) — once, when the match ends
 */
const COUNTDOWN_TICK_FROM_SECONDS = 3

export const createGameSession = ({ mode, audio, onHud, onGameOver } = {}) => {
  const targets = []
  const particles = []
  const floaters = []
  const spawner = new Spawner(mode.spawner)
  const scores = new ScoreManager()
  const timer = new Timer(mode.duration)
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
        audio?.playHit()
      } else {
        scores.registerMiss()
        audio?.playMiss()
      }
    })

    // Sweep dead entities (clicked, expired, or faded out).
    sweepDead(targets)
    sweepDead(particles)
    sweepDead(floaters)

    targets.forEach((target) => target.update(dt, size))
    particles.forEach((particle) => particle.update(dt))
    floaters.forEach((floater) => floater.update(dt))
    spawner.update(dt, size, targets)

    // Push stats to React only when something displayed changed.
    const secondChanged = timer.displaySeconds !== lastDisplayedSecond
    lastDisplayedSecond = timer.displaySeconds
    if (clicks.length > 0 || secondChanged) emitHud()

    // Tick through the final seconds (3, 2, 1 — not the game-over 0).
    if (
      secondChanged &&
      !timer.isFinished &&
      timer.displaySeconds <= COUNTDOWN_TICK_FROM_SECONDS
    ) {
      audio?.playCountdown()
    }

    if (timer.isFinished) {
      isOver = true
      audio?.playGameOver()
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
