// Returns the topmost live target containing the point, or null (a miss).
// Targets render in array order, so iterate from the end to hit the one
// drawn on top when targets are close together.
export const findHitTarget = (x, y, targets) => {
  for (let i = targets.length - 1; i >= 0; i -= 1) {
    const target = targets[i]
    if (target.isAlive && target.containsPoint(x, y)) return target
  }
  return null
}
