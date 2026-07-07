import { useState } from 'react'
import GameArea from '../components/GameArea/GameArea'
import ModePicker from '../components/ModePicker/ModePicker'
import SessionHistory from '../components/SessionHistory/SessionHistory'
import { DEFAULT_MODE_ID, GAME_MODES, getModeById } from '../game/modes'

const Play = () => {
  const [modeId, setModeId] = useState(DEFAULT_MODE_ID)
  // Finished matches this session, newest first. Lives here (not in
  // GameArea) so it survives mode switches, which remount GameArea.
  const [history, setHistory] = useState([])
  const mode = getModeById(modeId)

  const addToHistory = (match) => setHistory((prev) => [match, ...prev])

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
        <GameArea key={mode.id} mode={mode} onMatchFinished={addToHistory} />
      </div>

      <div className="mt-10">
        <SessionHistory matches={history} />
      </div>
    </section>
  )
}

export default Play
