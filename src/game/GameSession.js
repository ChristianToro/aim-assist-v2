import { Spawner } from './Spawner'
import { ScoreManager } from './ScoreManager'
import { Timer } from './Timer'
import { findHitTarget } from './Collision'
import { createBurst } from './Particle'
import { FloatingText } from './FloatingText'
import { FALLBACK_PALETTE } from './palette'
import { applyEvent, scoreEvents } from './scoring'
import { RAMP_FACTORS, settingAt } from './difficulty'

const toMs = (seconds) => Math.round(seconds * 1000)

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
 * Every hit, miss and expiry is recorded in an event log (see scoring.js)
 * and scored from it, so the match's figures can be recomputed from the
 * log alone.
 *
 * Communication with React is one-way and event-driven:
 *   onHud(snapshot)     — on hit, miss, or displayed-second change
 *   onGameOver(summary) — once, when the match ends; the summary is
 *                         scoreEvents' figures plus the log as `events`
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
  // Baseline spawner values for the difficulty ramp.
  const base = Object.fromEntries(
    Object.keys(RAMP_FACTORS).map((setting) => [setting, spawner[setting]])
  )
  let events = []
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

  // Logs an event and scores it; returns the points a hit earned.
  const record = (event) => {
    events.push(event)
    return applyEvent(scores, mode, event)
  }

  // Difficulty ramp (modes with a `scaling` config, e.g. Survival):
  // as the match goes on, targets get smaller, spawn faster and farther
  // apart and expire sooner (difficulty.js). Their growing point value is
  // scoring.js's targetValueAt, from each target's spawn time.
  const applyDifficulty = () => {
    if (!mode.scaling) return
    const now = toMs(elapsed)
    Object.keys(RAMP_FACTORS).forEach((setting) => {
      spawner[setting] = settingAt(mode, setting, base[setting], now)
    })
  }

  const update = (dt, size, input) => {
    if (isOver) return

    // Clicks and expiries resolve against the world as last drawn, so
    // they're stamped with its game time, before this frame advances it.
    // A hit's reaction time (t − spawnedAt) is then its target's age.
    const now = toMs(elapsed)

    // Resolve clicks first so hit targets disappear this frame.
    const clicks = input.consumeClicks()
    clicks.forEach(({ x, y }) => {
      const hit = findHitTarget(x, y, targets)
      if (hit) {
        const points = record({ t: now, kind: 'hit', spawnedAt: hit.spawnedAt })
        hit.destroy()
        // Under prefers-reduced-motion, keep the informative score text
        // but skip the decorative burst.
        if (!reducedMotion) particles.push(...createBurst(hit.x, hit.y))
        floaters.push(new FloatingText(`+${points}`, hit.x, hit.y - hit.radius))
        audio?.playHit()
      } else {
        record({ t: now, kind: 'miss' })
        audio?.playMiss()
      }
    })

    // In miss-limited modes, letting a target expire also costs a life.
    let expiries = 0
    if (mode.expiryCountsAsMiss) {
      targets.forEach((target) => {
        if (target.expired) {
          record({ t: now, kind: 'expire' })
          expiries += 1
        }
      })
      if (expiries > 0) audio?.playMiss()
    }

    elapsed += dt
    timer.update(dt)
    applyDifficulty()

    // Sweep dead entities (clicked, expired, or faded out).
    sweepDead(targets)
    sweepDead(particles)
    sweepDead(floaters)

    targets.forEach((target) => target.update(dt, size))
    particles.forEach((particle) => particle.update(dt))
    floaters.forEach((floater) => floater.update(dt))
    spawner.update(dt, size, targets, toMs(elapsed))

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
      // Replayed from the log, so the results screen shows exactly what
      // the server will compute from the same events.
      onGameOver?.({ ...scoreEvents(mode, events), events })
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
    events = [] // a fresh array: the last summary still holds the old log
    elapsed = 0
    isOver = false
    lastDisplayedSecond = timer.displaySeconds
    emitHud()
  }

  return { targets, update, render, reset, setPalette }
}
