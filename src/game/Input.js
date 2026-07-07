/*
 * Input — canvas pointer state for the game layer.
 *
 * Clicks are queued (in canvas-space coordinates) rather than handled in
 * the DOM event, so the scene consumes them at a deterministic point in
 * the frame: update → collision → render. `position` tracks the live
 * pointer for future modes (e.g. Tracking).
 */
export class Input {
  #canvas = null
  #clicks = []

  position = { x: 0, y: 0 }

  attach(canvas) {
    this.#canvas = canvas
    canvas.addEventListener('pointerdown', this.#onPointerDown)
    canvas.addEventListener('pointermove', this.#onPointerMove)
  }

  detach() {
    if (!this.#canvas) return
    this.#canvas.removeEventListener('pointerdown', this.#onPointerDown)
    this.#canvas.removeEventListener('pointermove', this.#onPointerMove)
    this.#canvas = null
    this.clear()
  }

  // Returns queued clicks and empties the queue.
  consumeClicks() {
    const clicks = this.#clicks
    this.#clicks = []
    return clicks
  }

  clear() {
    this.#clicks = []
  }

  #toCanvasSpace(event) {
    const rect = this.#canvas.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  #onPointerDown = (event) => {
    this.#clicks.push(this.#toCanvasSpace(event))
  }

  #onPointerMove = (event) => {
    this.position = this.#toCanvasSpace(event)
  }
}
