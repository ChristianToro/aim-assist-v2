import { useState } from 'react'
import Button from '../components/Button/Button'
import Card from '../components/Card/Card'
import GameCanvas from '../components/GameCanvas/GameCanvas'
import GameHud from '../components/GameHud/GameHud'
import ResultsModal from '../components/ResultsModal/ResultsModal'
import { useGameSession } from '../hooks/useGameSession'
import { useAuth } from '../hooks/useAuth'
import { saveMatchResult } from '../services/scores'

const MATCH_SECONDS = 30
const GAME_MODE = 'Classic' // mode selection arrives in Milestone 18

// Dimmed overlay shown on top of the canvas between/within matches.
const CanvasOverlay = ({ children }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg/70 backdrop-blur-sm">
    {children}
  </div>
)

const Play = () => {
  const { user } = useAuth()
  // null | 'saving' | 'saved' | 'error' — 'signed-out' is derived below.
  const [saveStatus, setSaveStatus] = useState(null)

  // Persist the finished match (event-driven, once per game over).
  const handleGameOver = (result) => {
    if (!user) return
    setSaveStatus('saving')
    saveMatchResult({ user, mode: GAME_MODE, summary: result })
      .then(() => setSaveStatus('saved'))
      .catch((error) => {
        console.error('Failed to save match:', error)
        setSaveStatus('error')
      })
  }

  const {
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
  } = useGameSession({
    duration: MATCH_SECONDS,
    showFps: true,
    onGameOver: handleGameOver,
  })

  const handleStart = () => {
    setSaveStatus(null)
    start()
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-heading">
          Play
        </h1>
        <div className="flex items-center gap-2">
          {phase === 'running' && (
            <>
              <Button variant="secondary" size="sm" onClick={togglePause}>
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleStart}>
                Restart
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            aria-pressed={isMuted}
          >
            {isMuted ? 'Sound: Off' : 'Sound: On'}
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <GameHud hud={hud} />

        <Card className="relative overflow-hidden p-0">
          <GameCanvas
            engine={engine}
            className="block h-[60vh] min-h-96 w-full cursor-crosshair"
          />

          {phase === 'idle' && (
            <CanvasOverlay>
              <h2 className="text-2xl font-semibold text-heading">
                {MATCH_SECONDS}-second match
              </h2>
              <p className="max-w-sm text-center text-sm text-muted">
                Click as many targets as you can. Consecutive hits build a score
                multiplier — misses reset it.
              </p>
              <Button size="lg" onClick={handleStart}>
                Start Match
              </Button>
            </CanvasOverlay>
          )}

          {isPaused && (
            <CanvasOverlay>
              <h2 className="text-2xl font-semibold text-heading">Paused</h2>
              <Button onClick={togglePause}>Resume</Button>
            </CanvasOverlay>
          )}
        </Card>
      </div>

      <ResultsModal
        open={phase === 'over'}
        summary={summary}
        saveStatus={user ? saveStatus : 'signed-out'}
        onRestart={handleStart}
        onClose={dismissResults}
      />
    </section>
  )
}

export default Play
