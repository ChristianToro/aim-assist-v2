import { useEffect, useRef } from 'react'

/*
 * Bridge between React and the canvas world.
 *
 * Owns the requestAnimationFrame loop, devicePixelRatio-aware resizing,
 * and the debug FPS readout. Everything drawn comes from the `scene`
 * object ({ update(dt, size), render(ctx, size) }), keeping game logic
 * out of React per ARCHITECTURE.md. React re-renders never touch the
 * loop — state lives in refs and the scene itself.
 */
const GameCanvas = ({ scene, showFps = false, className = '' }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Match the backing store to CSS size × devicePixelRatio, then scale
    // the context so the scene draws in CSS pixels.
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    let rafId
    let last = performance.now()
    let smoothedFps = 0

    const frame = (now) => {
      // Clamp dt so a background tab doesn't produce a huge jump on return.
      const dt = Math.min(Math.max((now - last) / 1000, 0.000001), 0.1)
      last = now
      const size = { width: canvas.clientWidth, height: canvas.clientHeight }

      scene.update(dt, size)
      ctx.clearRect(0, 0, size.width, size.height)
      scene.render(ctx, size)

      if (showFps) {
        smoothedFps = smoothedFps * 0.95 + (1 / dt) * 0.05
        ctx.font = '12px ui-monospace, Consolas, monospace'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.textBaseline = 'top'
        ctx.fillText(`${Math.round(smoothedFps)} FPS`, 10, 10)
      }

      rafId = requestAnimationFrame(frame)
    }
    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [scene, showFps])

  return <canvas ref={canvasRef} className={className} />
}

export default GameCanvas
