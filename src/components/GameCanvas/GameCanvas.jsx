import { useEffect, useRef } from 'react'

/*
 * Thin React↔DOM bridge for the game engine.
 *
 * Handles what only React/DOM can: mounting the canvas element and keeping
 * its backing store in sync with layout size × devicePixelRatio. The frame
 * loop itself lives in GameEngine — this component never re-renders during
 * gameplay.
 */
const GameCanvas = ({ engine, autoStart = false, className = '' }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Match the backing store to CSS size × devicePixelRatio, then scale
    // the context so scenes draw in CSS pixels.
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

    engine.attach(canvas)
    if (autoStart) engine.start()

    return () => {
      observer.disconnect()
      engine.detach()
    }
  }, [engine, autoStart])

  return <canvas ref={canvasRef} className={className} />
}

export default GameCanvas
