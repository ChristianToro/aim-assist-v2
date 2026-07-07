import StatTile from '../StatTile/StatTile'

// Live match statistics. Re-renders only when the scene pushes a new
// snapshot (hit, miss, or timer tick) — never per animation frame.
const GameHud = ({ hud }) => {
  if (!hud) return null

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {hud.timeRemaining !== undefined && (
        <StatTile label="Time" value={`${hud.timeRemaining}s`} accent />
      )}
      {hud.lives !== undefined && (
        <StatTile label="Lives" value={hud.lives} accent />
      )}
      <StatTile label="Score" value={hud.score} accent />
      <StatTile label="Accuracy" value={`${hud.accuracy.toFixed(0)}%`} />
      <StatTile
        label="Combo"
        value={`${hud.combo}×${hud.multiplier.toFixed(1)}`}
      />
      <StatTile label="Hits" value={hud.hits} />
      <StatTile label="Misses" value={hud.misses} />
    </div>
  )
}

export default GameHud
