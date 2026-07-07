const Stat = ({ label, value, accent = false }) => (
  <div className="rounded-lg border border-edge bg-surface/50 px-4 py-2 text-center">
    <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
    <p
      className={`text-lg font-semibold tabular-nums ${
        accent ? 'text-accent' : 'text-heading'
      }`}
    >
      {value}
    </p>
  </div>
)

// Live match statistics. Re-renders only when the scene pushes a new
// snapshot (hit, miss, or timer tick) — never per animation frame.
const GameHud = ({ hud }) => {
  if (!hud) return null

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {hud.timeRemaining !== undefined && (
        <Stat label="Time" value={`${hud.timeRemaining}s`} accent />
      )}
      <Stat label="Score" value={hud.score} accent />
      <Stat label="Accuracy" value={`${hud.accuracy.toFixed(0)}%`} />
      <Stat label="Combo" value={`${hud.combo}×${hud.multiplier.toFixed(1)}`} />
      <Stat label="Hits" value={hud.hits} />
      <Stat label="Misses" value={hud.misses} />
    </div>
  )
}

export default GameHud
