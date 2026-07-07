import { Spawner } from './Spawner'

/*
 * Target scene: continuously spawning, expiring targets.
 * Exposes the live target list so Milestone 6 input/collision can
 * hit-test clicks against it.
 */
export const createTargetScene = () => {
  const targets = []
  const spawner = new Spawner()

  const update = (dt, size) => {
    // Sweep dead targets (expired now; clicked ones from Milestone 6 on).
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
