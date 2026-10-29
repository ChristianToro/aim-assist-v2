import Button from '../Button/Button'
import GameCanvas from '../GameCanvas/GameCanvas'
import GameHud from '../GameHud/GameHud'
import ResultsModal from '../ResultsModal/ResultsModal'
import { useGameSession } from '../../hooks/useGameSession'
import { useAuth } from '../../hooks/useAuth'
import { useMatchSave } from '../../hooks/useMatchSave'

// The scrim over the canvas between and within matches: opaque enough to
// read on, with no blur (glass is off-style, and the canvas is still).
const CanvasOverlay = ({ children }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/85 p-6 text-center">
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
  // 'signed-out' is derived at render; useMatchSave covers the rest.
  const { saveStatus, beginMatch, saveMatch } = useMatchSave({ mode, user })

  const handleGameOver = (result) => {
    onMatchFinished?.({ ...result, mode: mode.label, finishedAt: new Date() })
    saveMatch(result.events)
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
    beginMatch()
    start()
  }

  // Mid-match, so the round's match ticket carries over (useMatchSave).
  const handleRestart = () => {
    beginMatch({ restart: true })
    start()
  }

  const isEndless = !Number.isFinite(mode.duration)
  const matchTitle = isEndless
    ? 'Endless match'
    : `${mode.duration}-second match`
  const overlayHint = mode.missLimit
    ? `Targets get smaller, faster, and more valuable over time. ${mode.missLimit} misses (or expired targets) ends the run.`
    : 'Click as many targets as you can. Consecutive hits build a score multiplier, and a miss resets it.'

  return (
    <div className="space-y-4">
      {/* On phones the controls take their own 36px line, so Pause and
          Restart appearing at the start of a match never push the HUD and
          canvas down. */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-ui text-body">{mode.description}</p>
        <div className="flex min-h-9 items-center gap-2">
          {phase === 'running' && (
            <>
              <Button variant="secondary" size="sm" onClick={togglePause}>
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleRestart}>
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

      {/* Between matches the strip shows the next round's starting
          values, not the last match's (those are in the results). */}
      <GameHud hud={phase === 'idle' ? null : hud} mode={mode} />

      {/* A plain surface: the canvas fills it edge to edge. */}
      <div className="relative overflow-hidden bg-surface">
        <GameCanvas
          engine={engine}
          label={`${mode.label} game area: click targets as they appear`}
          className="block h-[60vh] min-h-96 w-full cursor-crosshair"
        />

        {phase === 'idle' && (
          <CanvasOverlay>
            <h2 className="text-title font-medium tracking-tight text-heading">
              {mode.label}
            </h2>
            <p className="text-ui text-body">{matchTitle}</p>
            <p className="max-w-sm text-ui text-muted">{overlayHint}</p>
            <Button variant="solid" className="mt-3" onClick={handleStart}>
              Start match
            </Button>
          </CanvasOverlay>
        )}

        {isPaused && (
          <CanvasOverlay>
            <h2 className="text-title font-medium tracking-tight text-heading">
              Paused
            </h2>
            <Button variant="solid" className="mt-3" onClick={togglePause}>
              Resume
            </Button>
          </CanvasOverlay>
        )}
      </div>

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
