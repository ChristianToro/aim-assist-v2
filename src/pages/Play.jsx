import { useState } from 'react'
import GameArea from '../components/GameArea/GameArea'
import ModePicker from '../components/ModePicker/ModePicker'
import { DEFAULT_MODE_ID, GAME_MODES, getModeById } from '../game/modes'

const Play = () => {
  const [modeId, setModeId] = useState(DEFAULT_MODE_ID)
  const mode = getModeById(modeId)

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-heading">
          Play
        </h1>
        <ModePicker
          modes={GAME_MODES}
          selectedId={modeId}
          onSelect={setModeId}
        />
      </div>

      <div className="mt-6">
        {/* key remounts the game area so mode switches reset cleanly */}
        <GameArea key={mode.id} mode={mode} />
      </div>
    </section>
  )
}

export default Play
