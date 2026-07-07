/*
 * Timer — match countdown.
 *
 * Advanced by the game loop's delta time, so pausing the engine pauses
 * the timer for free (no wall-clock reads).
 */
export class Timer {
  constructor(duration) {
    this.duration = duration
    this.remaining = duration
  }

  get isFinished() {
    return this.remaining <= 0
  }

  // Whole seconds for display (10 → "10", 0.4 → "1", 0 → "0").
  get displaySeconds() {
    return Math.ceil(this.remaining)
  }

  update(dt) {
    this.remaining = Math.max(this.remaining - dt, 0)
  }

  reset(duration = this.duration) {
    this.duration = duration
    this.remaining = duration
  }
}
