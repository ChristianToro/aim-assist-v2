import { useEffect, useMemo, useRef, useState } from 'react'
import { GameEngine } from '../game/GameEngine'
import { AudioManager } from '../game/AudioManager'
import { createGameSession } from '../game/GameSession'

/*
 * useGameSession — the React side of a match.
 *
 * Owns the engine instance and match phase ('idle' | 'running' | 'over').
 * The engine/session hold gameplay truth; React state here only mirrors
 * what the UI needs, updated by the session's event callbacks.
 */
export const useGameSession = ({
  duration = 30,
  showFps = false,
  onGameOver,
} = {}) => {
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

  const { engine, audio } = useMemo(() => {
    const audioManager = new AudioManager()
    // `engineInstance` is assigned before any callback can fire — the
    // session only calls onGameOver from inside the engine's own loop.
    let engineInstance
    // onGameOverRef.current is only read inside the game-over callback
    // (event time), never during render — safe despite the refs rule.
    // eslint-disable-next-line react-hooks/refs
    const session = createGameSession({
      duration,
      audio: audioManager,
      onHud: setHud,
      onGameOver: (result) => {
        engineInstance.stop()
        setSummary(result)
        setPhase('over')
        onGameOverRef.current?.(result)
      },
    })
    engineInstance = new GameEngine(session, { showFps })
    return { engine: engineInstance, audio: audioManager }
  }, [duration, showFps])
  const [isMuted, setIsMuted] = useState(audio.muted)

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
