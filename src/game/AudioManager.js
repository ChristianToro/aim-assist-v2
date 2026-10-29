const STORAGE_KEY = 'aim-assist:muted'

// The saved sound choice, also shown on the Settings page.
export const readStoredMute = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    // Storage unavailable (private mode) — default to sound on.
    return false
  }
}

/*
 * AudioManager — gameplay sound effects, synthesized with the Web Audio
 * API (no audio assets to load). The AudioContext is created lazily on
 * first playback, which always follows a user gesture (Start Match),
 * satisfying browser autoplay policies.
 */
export class AudioManager {
  #ctx = null
  #master = null

  muted = readStoredMute()

  // Returns the new muted state.
  toggleMute() {
    this.muted = !this.muted
    try {
      localStorage.setItem(STORAGE_KEY, String(this.muted))
    } catch {
      // Preference just won't persist.
    }
    return this.muted
  }

  /* ---- effects ---- */

  playHit() {
    // Bright falling pop.
    this.#tone({
      from: 880,
      to: 520,
      duration: 0.08,
      type: 'triangle',
      volume: 0.3,
    })
  }

  playMiss() {
    // Low dull thud.
    this.#tone({
      from: 200,
      to: 120,
      duration: 0.12,
      type: 'sine',
      volume: 0.2,
    })
  }

  playCountdown() {
    // Short tick for the final seconds.
    this.#tone({
      from: 990,
      to: 990,
      duration: 0.06,
      type: 'square',
      volume: 0.1,
    })
  }

  playGameOver() {
    // Three-note descending motif.
    this.#tone({
      from: 523,
      to: 523,
      duration: 0.16,
      type: 'triangle',
      volume: 0.25,
    })
    this.#tone({
      from: 392,
      to: 392,
      duration: 0.16,
      type: 'triangle',
      volume: 0.25,
      delay: 0.17,
    })
    this.#tone({
      from: 262,
      to: 262,
      duration: 0.32,
      type: 'triangle',
      volume: 0.25,
      delay: 0.34,
    })
  }

  /* ---- synthesis ---- */

  #ensureContext() {
    if (!this.#ctx) {
      if (!window.AudioContext) return null
      this.#ctx = new AudioContext()
      this.#master = this.#ctx.createGain()
      this.#master.gain.value = 0.5
      this.#master.connect(this.#ctx.destination)
    }
    // Browsers suspend contexts created before any gesture; recover here.
    if (this.#ctx.state === 'suspended') this.#ctx.resume()
    return this.#ctx
  }

  // One oscillator note: frequency glide `from → to` with a fast-decay
  // gain envelope (the exponential ramp gives a natural percussive tail).
  #tone({ from, to, duration, type = 'sine', volume = 0.2, delay = 0 }) {
    if (this.muted) return
    const ctx = this.#ensureContext()
    if (!ctx) return

    const start = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(from, start)
    if (to !== from) {
      osc.frequency.exponentialRampToValueAtTime(to, start + duration)
    }
    gain.gain.setValueAtTime(volume, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    osc.connect(gain)
    gain.connect(this.#master)
    osc.start(start)
    osc.stop(start + duration + 0.02)
  }
}
