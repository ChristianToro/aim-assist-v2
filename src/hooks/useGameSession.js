import { useEffect, useMemo, useRef, useState } from 'react'
import { GameEngine } from '../game/GameEngine'
import { AudioManager } from '../game/AudioManager'
import { createGameSession } from '../game/GameSession'
import { readCanvasPalette } from '../game/palette'
import { useTheme } from './useTheme'

/*
 * useGameSession — the React side of a match.
 *
 * Owns the engine instance and match phase ('idle' | 'running' | 'over').
 * The engine/session hold gameplay truth; React state here only mirrors
 * what the UI needs, updated by the session's event callbacks.
 */
export const useGameSession = ({ mode, showFps = false, onGameOver } = {}) => {
  const { themeId } = useTheme()
  const [phase, setPhase] = useState('idle')
  const [hud, setHud] = useState(null)
  const [summary, setSummary] = useState(null)
  const [isPaused, setIsPaused] = useState(false)

  // Latest-callback ref so the engine (created once) always calls the
  // caller's current onGameOver without invalidating the useMemo.
  const onGameOverRef = useRef(onGameOver)
  useEffect(() => {
    onGameOverRef.current = onGameOver
  })

  const { engine, session, audio } = useMemo(() => {
    const audioManager = new AudioManager()
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    // `engineInstance` is assigned before any callback can fire — the
    // session only calls onGameOver from inside the engine's own loop.
    let engineInstance
    // onGameOverRef.current is only read inside the game-over callback
    // (event time), never during render — safe despite the refs rule.
    // eslint-disable-next-line react-hooks/refs
    const gameSession = createGameSession({
      mode,
      audio: audioManager,
      reducedMotion,
      palette: readCanvasPalette(),
      onHud: setHud,
      onGameOver: (result) => {
        engineInstance.stop()
        setSummary(result)
        setPhase('over')
        onGameOverRef.current?.(result)
      },
    })
    engineInstance = new GameEngine(gameSession, { showFps })
    return {
      engine: engineInstance,
      session: gameSession,
      audio: audioManager,
    }
  }, [mode, showFps])
  const [isMuted, setIsMuted] = useState(audio.muted)

  // Recolor on theme change. ThemeProvider stamps <html data-theme>
  // synchronously in its setter, so the variables are already resolved by
  // the time this effect reads them. Swapping the palette leaves the match
  // untouched — no engine rebuild, no reset.
  useEffect(() => {
    session.setPalette(readCanvasPalette())
  }, [session, themeId])

  const toggleMute = () => setIsMuted(audio.toggleMute())

  // Starts a fresh match (also serves as restart).
  const start = () => {
    engine.stop()
    engine.reset()
    setSummary(null)
    setIsPaused(false)
    setPhase('running')
    engine.start()
  }

  const togglePause = () => {
    if (engine.isPaused) engine.resume()
    else engine.pause()
    setIsPaused(engine.isPaused)
  }

  const dismissResults = () => setPhase('idle')

  return {
    engine,
    phase,
    hud,
    summary,
    isPaused,
    isMuted,
    start,
    togglePause,
    toggleMute,
    dismissResults,
  }
}
