import { useMemo } from 'react'
import Card from '../components/Card/Card'
import GameCanvas from '../components/GameCanvas/GameCanvas'
import { createDemoScene } from '../game/demoScene'

const Play = () => {
  // One scene instance per mount; a stable reference keeps GameCanvas's
  // effect (and its rAF loop) from restarting on re-renders.
  const scene = useMemo(() => createDemoScene(), [])

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-heading">
          Play
        </h1>
        <p className="text-sm text-muted">
          Engine demo — targets and scoring arrive in Milestones 4–7
        </p>
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <GameCanvas
          scene={scene}
          showFps
          className="block h-[60vh] min-h-96 w-full cursor-crosshair"
        />
      </Card>
    </section>
  )
}

export default Play
