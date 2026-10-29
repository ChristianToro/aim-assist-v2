import { memo } from 'react'
import StatStrip from '../StatStrip/StatStrip'
import { formatScore } from '../../utils/leaderboardFormat'

// A figure with its unit as a smaller grey suffix ("12 s").
const withUnit = (value, unit) => (
  <>
    {value}
    <span className="text-meta text-muted"> {unit}</span>
  </>
)

// The round's limit: time left on the clock, or lives left before the
// miss limit ends it.
const limitItem = (hud, mode) => {
  if (hud?.timeRemaining !== undefined) {
    return { label: 'Time', value: withUnit(hud.timeRemaining, 's') }
  }
  if (hud?.lives !== undefined) return { label: 'Lives', value: hud.lives }
  if (!hud && Number.isFinite(mode.duration)) {
    return { label: 'Time', value: withUnit(mode.duration, 's') }
  }
  return { label: 'Lives', value: mode.missLimit }
}

/*
 * Live match statistics. Re-renders only when the scene pushes a new
 * snapshot (hit, miss, or timer tick) — never per animation frame.
 * Before the first snapshot it shows the round's starting values, so the
 * strip is already in place and the canvas below never shifts as a match
 * begins. Accuracy and combo have no value until the first shot.
 */
const GameHud = ({ hud, mode }) => (
  <StatStrip
    items={[
      limitItem(hud, mode),
      { label: 'Score', value: formatScore(hud?.score ?? 0) },
      {
        label: 'Accuracy',
        value: hud ? `${hud.accuracy.toFixed(0)}%` : null,
      },
      {
        label: 'Combo',
        value: hud ? `${hud.combo}×${hud.multiplier.toFixed(1)}` : null,
      },
      { label: 'Hits', value: String(hud?.hits ?? 0) },
      { label: 'Misses', value: String(hud?.misses ?? 0) },
    ]}
  />
)

export default memo(GameHud)
