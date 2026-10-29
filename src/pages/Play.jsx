import { useId, useState } from 'react'
import GameArea from '../components/GameArea/GameArea'
import SessionHistory from '../components/SessionHistory/SessionHistory'
import Tabs from '../components/Tabs/Tabs'
import { DEFAULT_MODE_ID, GAME_MODES, getModeById } from '../game/modes'

const Play = () => {
  const [modeId, setModeId] = useState(DEFAULT_MODE_ID)
  // Finished matches this session, newest first. Lives here (not in
  // GameArea) so it survives mode switches, which remount GameArea.
  const [history, setHistory] = useState([])
  const mode = getModeById(modeId)
  const idPrefix = useId()

  const addToHistory = (match) => setHistory((prev) => [match, ...prev])
  const tabId = (id) => `${idPrefix}-mode-${id}`
  const panelId = `${idPrefix}-panel`

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-title font-medium tracking-tight text-heading">
        Play
      </h1>

      {/* Switching modes remounts the game area, abandoning any match in
          progress. */}
      <Tabs
        items={GAME_MODES}
        selectedId={modeId}
        onSelect={setModeId}
        label="Game mode"
        panelId={panelId}
        tabId={tabId}
        className="mt-6"
      />

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId(modeId)}
        className="mt-6"
      >
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
