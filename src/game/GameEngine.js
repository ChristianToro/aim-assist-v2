/*
 * GameEngine — owns the gameplay loop, independent of React.
 *
 * React's entire interface to gameplay is the lifecycle API below
 * (attach/start/pause/resume/stop), per ARCHITECTURE.md. Each frame the
 * engine advances the current scene
 * ({ update(dt, size, input), render(ctx, size) }) with a clamped delta
 * time, then draws it. The engine owns pointer input so scenes consume
 * clicks during update rather than in DOM event handlers.
 */
import { Input } from './Input'

// Cap delta time so returning from a background tab (rAF stops firing)
// doesn't produce one huge physics step.
const MAX_DELTA_SECONDS = 0.1

// Smoothing factor for the debug FPS readout (exponential moving average).
const FPS_SMOOTHING = 0.95

export class GameEngine {
  #canvas = null
  #ctx = null
  #scene = null
  #rafId = null
  #lastFrameTime = 0
  #smoothedFps = 0
  // Reused every frame — one object for the whole engine lifetime
  // instead of a fresh allocation at 60/s.
  #size = { width: 0, height: 0 }

  isRunning = false
  isPaused = false
  showFps = false
  input = new Input()

  constructor(scene, { showFps = false } = {}) {
    this.#scene = scene
    this.showFps = showFps
  }

  /* ---- lifecycle (the only surface React should touch) ---- */

  attach(canvas) {
    this.#canvas = canvas
    this.#ctx = canvas.getContext('2d')
    this.input.attach(canvas)
  }

  detach() {
    this.stop()
    this.input.detach()
    this.#canvas = null
    this.#ctx = null
  }

  start() {
    if (!this.#canvas || this.isRunning) return
    this.isRunning = true
    this.isPaused = false
    // Drop clicks queued while the engine wasn't running.
    this.input.clear()
    this.#lastFrameTime = performance.now()
    this.#rafId = requestAnimationFrame(this.#frame)
  }

  stop() {
    if (this.#rafId !== null) cancelAnimationFrame(this.#rafId)
    this.#rafId = null
    this.isRunning = false
    this.isPaused = false
  }

  pause() {
    if (!this.isRunning || this.isPaused) return
    cancelAnimationFrame(this.#rafId)
    this.#rafId = null
    this.isPaused = true
  }

  resume() {
    if (!this.isRunning || !this.isPaused) return
    this.isPaused = false
    // Drop clicks queued while paused and re-anchor the clock so time
    // paused doesn't count as elapsed.
    this.input.clear()
    this.#lastFrameTime = performance.now()
    this.#rafId = requestAnimationFrame(this.#frame)
  }

  reset() {
    this.#scene.reset?.()
  }

  /* ---- frame loop ---- */

  #frame = (now) => {
    const dt = Math.min(
      Math.max((now - this.#lastFrameTime) / 1000, 0.000001),
      MAX_DELTA_SECONDS
    )
    this.#lastFrameTime = now

    const size = this.#size
    size.width = this.#canvas.clientWidth
    size.height = this.#canvas.clientHeight

    this.#scene.update(dt, size, this.input)
    this.#ctx.clearRect(0, 0, size.width, size.height)
    this.#scene.render(this.#ctx, size)
    if (this.showFps) this.#drawFps(dt)

    // Only reschedule if update() didn't stop or pause the engine
    // (e.g. a scene's game-over callback calling stop()).
    if (this.isRunning && !this.isPaused) {
      this.#rafId = requestAnimationFrame(this.#frame)
    }
  }

  #drawFps(dt) {
    this.#smoothedFps =
      this.#smoothedFps * FPS_SMOOTHING + (1 / dt) * (1 - FPS_SMOOTHING)
    this.#ctx.font = '12px ui-monospace, Consolas, monospace'
    this.#ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    this.#ctx.textBaseline = 'top'
    this.#ctx.fillText(`${Math.round(this.#smoothedFps)} FPS`, 10, 10)
  }
}
