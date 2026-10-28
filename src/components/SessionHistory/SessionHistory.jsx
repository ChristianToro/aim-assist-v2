import { memo } from 'react'
import Card from '../Card/Card'

const formatMs = (ms) => (ms == null ? '—' : `${ms} ms`)

/*
 * Matches played this browser session (kept in React state, newest
 * first — this is deliberately ephemeral; persistent history lives in
 * Neon via the Profile page).
 */
const SessionHistory = ({ matches }) => {
  if (matches.length === 0) return null

  return (
    <div>
      <h2 className="text-xl font-semibold text-heading">This Session</h2>
      <Card className="mt-4 overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-edge text-xs tracking-wide text-muted uppercase">
              <th className="px-4 py-3 font-medium">Mode</th>
              <th className="px-4 py-3 text-right font-medium">Score</th>
              <th className="px-4 py-3 text-right font-medium">Accuracy</th>
              <th className="px-4 py-3 text-right font-medium">Max Combo</th>
              <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">
                Avg Reaction
              </th>
              <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">
                Best Reaction
              </th>
              <th className="px-4 py-3 text-right font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match, index) => (
              <tr
                key={`${match.finishedAt.getTime()}-${index}`}
                className="border-b border-edge last:border-b-0"
              >
                <td className="px-4 py-3 text-body">{match.mode}</td>
                <td className="px-4 py-3 text-right font-semibold text-heading tabular-nums">
                  {match.score}
                </td>
                <td className="px-4 py-3 text-right text-body tabular-nums">
                  {match.accuracy.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right text-body tabular-nums">
                  {match.maxCombo}×
                </td>
                <td className="hidden px-4 py-3 text-right text-muted tabular-nums sm:table-cell">
                  {formatMs(match.averageReactionMs)}
                </td>
                <td className="hidden px-4 py-3 text-right text-muted tabular-nums sm:table-cell">
                  {formatMs(match.bestReactionMs)}
                </td>
                <td className="px-4 py-3 text-right text-muted tabular-nums">
                  {match.finishedAt.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export default memo(SessionHistory)
