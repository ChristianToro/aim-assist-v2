import { Spawner } from './Spawner'
import { ScoreManager } from './ScoreManager'
import { findHitTarget } from './Collision'

/*
 * Target scene: continuously spawning, expiring, clickable targets with
 * live scoring. Stats flow up to React via onHud — emitted only when
 * they change (hit or miss), never per frame.
 */
export const createTargetScene = ({ onHud } = {}) => {
  const targets = []
  const spawner = new Spawner()
  const scores = new ScoreManager()

  const emitHud = () => onHud?.(scores.snapshot())

  const update = (dt, size, input) => {
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
    if (clicks.length > 0) emitHud()

    // Sweep dead targets (clicked or expired).
    for (let i = targets.length - 1; i >= 0; i -= 1) {
      if (!targets[i].isAlive) targets.splice(i, 1)
    }

    targets.forEach((target) => target.update(dt))
    spawner.update(dt, size, targets)
  }

  const render = (ctx) => {
    targets.forEach((target) => target.draw(ctx))
  }

  return { targets, update, render }
}
