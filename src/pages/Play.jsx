import Button from '../components/Button/Button'
import Card from '../components/Card/Card'
import GameCanvas from '../components/GameCanvas/GameCanvas'
import GameHud from '../components/GameHud/GameHud'
import { useGameSession } from '../hooks/useGameSession'

const MATCH_SECONDS = 30

// Dimmed overlay shown on top of the canvas between/within matches.
const CanvasOverlay = ({ children }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg/70 backdrop-blur-sm">
    {children}
  </div>
)

const Play = () => {
  const { engine, phase, hud, isPaused, start, togglePause } = useGameSession({
    duration: MATCH_SECONDS,
    showFps: true,
  })

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-heading">
          Play
        </h1>
        {phase === 'running' && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={togglePause}>
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button variant="ghost" size="sm" onClick={start}>
              Restart
            </Button>
          </div>
        )}
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
              <Button size="lg" onClick={start}>
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
    </section>
  )
}

export default Play
