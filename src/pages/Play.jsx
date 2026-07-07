import { useMemo, useState } from 'react'
import Button from '../components/Button/Button'
import Card from '../components/Card/Card'
import GameCanvas from '../components/GameCanvas/GameCanvas'
import { GameEngine } from '../game/GameEngine'
import { createDemoScene } from '../game/demoScene'

const Play = () => {
  // One engine per mount; a stable reference keeps GameCanvas's effect
  // from re-attaching on re-renders.
  const engine = useMemo(
    () => new GameEngine(createDemoScene(), { showFps: true }),
    []
  )
  // React mirrors pause state for the UI; the engine holds the truth.
  const [isPaused, setIsPaused] = useState(false)

  const togglePause = () => {
    if (engine.isPaused) engine.resume()
    else engine.pause()
    setIsPaused(engine.isPaused)
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-heading">
          Play
        </h1>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted">
            Engine demo — targets and scoring arrive in Milestones 5–7
          </p>
          <Button variant="secondary" size="sm" onClick={togglePause}>
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        </div>
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <GameCanvas
          engine={engine}
          className="block h-[60vh] min-h-96 w-full cursor-crosshair"
        />
      </Card>
    </section>
  )
}

export default Play
