import { Spawner } from './Spawner'
import { findHitTarget } from './Collision'

/*
 * Target scene: continuously spawning, expiring, clickable targets.
 */
export const createTargetScene = () => {
  const targets = []
  const spawner = new Spawner()

  const update = (dt, size, input) => {
    // Resolve clicks first so hit targets disappear this frame.
    input.consumeClicks().forEach(({ x, y }) => {
      const hit = findHitTarget(x, y, targets)
      if (hit) hit.destroy()
      // else: a miss — recorded by ScoreManager in Milestone 7
    })

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
