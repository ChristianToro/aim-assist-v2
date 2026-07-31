import { Spawner } from './Spawner'
import { ScoreManager } from './ScoreManager'
import { Timer } from './Timer'
import { findHitTarget } from './Collision'
import { createBurst } from './Particle'
import { FloatingText } from './FloatingText'
import { FALLBACK_PALETTE } from './palette'
import { lerp } from '../utils/math'

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
 *
 * The one inbound channel is setPalette(), which swaps the theme colors
 * used at draw time. It deliberately isn't a rebuild: recoloring a live
 * match shouldn't reset it.
 */
const COUNTDOWN_TICK_FROM_SECONDS = 3

export const createGameSession = ({
  mode,
  audio,
  reducedMotion = false,
  palette = FALLBACK_PALETTE,
  onHud,
  onGameOver,
} = {}) => {
  const targets = []
  const particles = []
  const floaters = []
  const spawner = new Spawner(mode.spawner)
  const scores = new ScoreManager()
  const timer = new Timer(mode.duration)
  // Baseline spawner values for difficulty interpolation.
  const base = {
    spawnInterval: spawner.spawnInterval,
    minRadius: spawner.minRadius,
    maxRadius: spawner.maxRadius,
    spacing: spawner.spacing,
    targetLifespan: spawner.targetLifespan,
    targetValue: spawner.targetValue,
  }
  let elapsed = 0
  let isOver = false
  let lastDisplayedSecond = timer.displaySeconds
  let activePalette = palette

  const livesRemaining = () => Math.max(mode.missLimit - scores.misses, 0)

  const emitHud = () =>
    onHud?.({
      ...scores.snapshot(),
      ...(Number.isFinite(timer.remaining) && {
        timeRemaining: timer.displaySeconds,
      }),
      ...(mode.missLimit && { lives: livesRemaining() }),
    })

  // Difficulty ramp (modes with a `scaling` config, e.g. Survival):
  // as elapsed time approaches rampSeconds, targets get smaller, spawn
  // faster and farther apart, expire sooner, and are worth more points.
  const applyDifficulty = () => {
    if (!mode.scaling) return
    const s = mode.scaling
    const progress = elapsed / s.rampSeconds
    spawner.spawnInterval = lerp(
      base.spawnInterval,
      base.spawnInterval * s.intervalFactor,
      progress
    )
    spawner.minRadius = lerp(
      base.minRadius,
      base.minRadius * s.radiusFactor,
      progress
    )
    spawner.maxRadius = lerp(
      base.maxRadius,
      base.maxRadius * s.radiusFactor,
      progress
    )
    spawner.spacing = lerp(
      base.spacing,
      base.spacing * s.spacingFactor,
      progress
    )
    spawner.targetLifespan = lerp(
      base.targetLifespan,
      base.targetLifespan * s.lifespanFactor,
      progress
    )
    spawner.targetValue = Math.round(
      lerp(base.targetValue, base.targetValue * (1 + s.valueFactor), progress)
    )
  }

  const update = (dt, size, input) => {
    if (isOver) return

    elapsed += dt
    timer.update(dt)
    applyDifficulty()

    // Resolve clicks first so hit targets disappear this frame.
    const clicks = input.consumeClicks()
    clicks.forEach(({ x, y }) => {
      const hit = findHitTarget(x, y, targets)
      if (hit) {
        const points = scores.registerHit(hit)
        hit.destroy()
        // Under prefers-reduced-motion, keep the informative score text
        // but skip the decorative burst.
        if (!reducedMotion) particles.push(...createBurst(hit.x, hit.y))
        floaters.push(new FloatingText(`+${points}`, hit.x, hit.y - hit.radius))
        audio?.playHit()
      } else {
        scores.registerMiss()
        audio?.playMiss()
      }
    })

    // In miss-limited modes, letting a target expire also costs a life.
    let expiries = 0
    if (mode.expiryCountsAsMiss) {
      targets.forEach((target) => {
        if (target.expired) {
          scores.registerMiss()
          expiries += 1
        }
      })
      if (expiries > 0) audio?.playMiss()
    }

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
    if (clicks.length > 0 || expiries > 0 || secondChanged) emitHud()

    // Tick through the final seconds (3, 2, 1 — not the game-over 0).
    if (
      secondChanged &&
      !timer.isFinished &&
      timer.displaySeconds <= COUNTDOWN_TICK_FROM_SECONDS
    ) {
      audio?.playCountdown()
    }

    const outOfLives = mode.missLimit && livesRemaining() === 0
    if (timer.isFinished || outOfLives) {
      isOver = true
      audio?.playGameOver()
      onGameOver?.(scores.summary())
    }
  }

  const setPalette = (next) => {
    activePalette = next
  }

  const render = (ctx) => {
    targets.forEach((target) => target.draw(ctx, activePalette))
    particles.forEach((particle) => particle.draw(ctx, activePalette))
    floaters.forEach((floater) => floater.draw(ctx, activePalette))
  }

  const reset = () => {
    targets.length = 0
    particles.length = 0
    floaters.length = 0
    spawner.reset()
    Object.assign(spawner, base) // undo any difficulty scaling
    scores.reset()
    timer.reset()
    elapsed = 0
    isOver = false
    lastDisplayedSecond = timer.displaySeconds
    emitHud()
  }

  return { targets, update, render, reset, setPalette }
}
