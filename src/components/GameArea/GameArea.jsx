import { useState } from 'react'
import Button from '../Button/Button'
import Card from '../Card/Card'
import GameCanvas from '../GameCanvas/GameCanvas'
import GameHud from '../GameHud/GameHud'
import ResultsModal from '../ResultsModal/ResultsModal'
import { useGameSession } from '../../hooks/useGameSession'
import { useAuth } from '../../hooks/useAuth'
import { saveMatchResult } from '../../services/scores'

// Dimmed overlay shown on top of the canvas between/within matches.
const CanvasOverlay = ({ children }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg/70 backdrop-blur-sm">
    {children}
  </div>
)

/*
 * One mode's complete match UI: controls, HUD, canvas, results.
 * Rendered with key={mode.id} so switching modes remounts everything —
 * engine, session, and HUD state reset together.
 */
const GameArea = ({ mode, onMatchFinished }) => {
  const { user } = useAuth()
  // null | 'saving' | 'saved' | 'error' — 'signed-out' derived at render.
  const [saveStatus, setSaveStatus] = useState(null)

  const handleGameOver = (result) => {
    onMatchFinished?.({ ...result, mode: mode.label, finishedAt: new Date() })
    if (!user) return
    setSaveStatus('saving')
    saveMatchResult({ user, mode: mode.label, summary: result })
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
  } = useGameSession({ mode, showFps: true, onGameOver: handleGameOver })

  const handleStart = () => {
    setSaveStatus(null)
    start()
  }

  const isEndless = !Number.isFinite(mode.duration)
  const matchTitle = isEndless
    ? 'Endless match'
    : `${mode.duration}-second match`
  const overlayHint = mode.missLimit
    ? `Targets get smaller, faster, and more valuable over time. ${mode.missLimit} misses (or expired targets) ends the run.`
    : 'Click as many targets as you can. Consecutive hits build a score multiplier — misses reset it.'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">{mode.description}</p>
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

      <GameHud hud={hud} />

      <Card className="relative overflow-hidden p-0">
        <GameCanvas
          engine={engine}
          label={`${mode.label} game area — click targets as they appear`}
          className="block h-[60vh] min-h-96 w-full cursor-crosshair"
        />

        {phase === 'idle' && (
          <CanvasOverlay>
            <h2 className="text-2xl font-semibold text-heading">
              {mode.label} — {matchTitle}
            </h2>
            <p className="max-w-sm text-center text-sm text-muted">
              {overlayHint}
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

      <ResultsModal
        open={phase === 'over'}
        summary={summary}
        saveStatus={user ? saveStatus : 'signed-out'}
        title={isEndless ? 'Run over!' : "Time's up!"}
        onRestart={handleStart}
        onClose={dismissResults}
      />
    </div>
  )
}

export default GameArea
