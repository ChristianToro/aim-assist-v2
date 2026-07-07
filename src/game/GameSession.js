import { Spawner } from './Spawner'
import { ScoreManager } from './ScoreManager'
import { Timer } from './Timer'
import { findHitTarget } from './Collision'

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
        scores.registerHit(hit)
        hit.destroy()
      } else {
        scores.registerMiss()
      }
    })

    // Sweep dead targets (clicked or expired).
    for (let i = targets.length - 1; i >= 0; i -= 1) {
      if (!targets[i].isAlive) targets.splice(i, 1)
    }

    targets.forEach((target) => target.update(dt))
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
  }

  const reset = () => {
    targets.length = 0
    spawner.reset()
    scores.reset()
    timer.reset()
    isOver = false
    lastDisplayedSecond = timer.displaySeconds
    emitHud()
  }

  return { targets, update, render, reset }
}
