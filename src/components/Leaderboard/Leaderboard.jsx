import { memo } from 'react'
import Card from '../Card/Card'
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'

const formatDate = (createdAt) =>
  createdAt?.toDate ? createdAt.toDate().toLocaleDateString() : '—'

const rankClass = (rank) =>
  rank <= 3 ? 'font-semibold text-accent' : 'text-muted'

const PlayerCell = ({ entry }) => (
  <div className="flex items-center gap-2">
    {entry.photoURL ? (
      <img
        src={entry.photoURL}
        alt=""
        referrerPolicy="no-referrer"
        className="h-6 w-6 rounded-full border border-edge"
      />
    ) : (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-xs text-muted">
        {(entry.displayName ?? '?').charAt(0).toUpperCase()}
      </span>
    )}
    <span className="truncate">{entry.displayName ?? 'Anonymous'}</span>
  </div>
)

// Ranked score table shared by every leaderboard view.
const Leaderboard = ({
  entries,
  isLoading,
  error,
  emptyMessage,
  highlightUid,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <p className="py-16 text-center text-muted">
        Couldn&apos;t load the leaderboard. If this view is new, its Firestore
        index may still need creating — check the browser console for the setup
        link.
      </p>
    )
  }

  if (entries.length === 0) {
    return <p className="py-16 text-center text-muted">{emptyMessage}</p>
  }

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-edge text-xs tracking-wide text-muted uppercase">
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Player</th>
            <th className="px-4 py-3 text-right font-medium">Score</th>
            <th className="px-4 py-3 text-right font-medium">Accuracy</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Mode</th>
            <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr
              key={entry.id}
              className={`border-b border-edge last:border-b-0 ${
                entry.uid === highlightUid ? 'bg-accent/5' : ''
              }`}
            >
              <td className={`px-4 py-3 tabular-nums ${rankClass(index + 1)}`}>
                {index + 1}
              </td>
              <td className="max-w-48 px-4 py-3 text-body">
                <PlayerCell entry={entry} />
              </td>
              <td className="px-4 py-3 text-right font-semibold text-heading tabular-nums">
                {entry.score}
              </td>
              <td className="px-4 py-3 text-right text-body tabular-nums">
                {entry.accuracy?.toFixed(1)}%
              </td>
              <td className="hidden px-4 py-3 text-muted sm:table-cell">
                {entry.mode}
              </td>
              <td className="hidden px-4 py-3 text-right text-muted tabular-nums sm:table-cell">
                {formatDate(entry.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default memo(Leaderboard)
