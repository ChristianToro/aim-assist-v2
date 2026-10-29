import {
  formatAccuracy,
  formatDay,
  formatReactionMs,
  formatScore,
} from '../../utils/leaderboardFormat'

// Columns that fold into the player cell's second line on narrow screens.
const FROM_SM = 'hidden sm:table-cell'
const FROM_LG = 'hidden lg:table-cell'
// The first and last columns sit 16px in from the frame, the rest 12px apart.
export const EDGE_PADDING = 'px-3 first:pl-4 last:pr-4'
const CELL = `py-2.5 ${EDGE_PADDING}`

const MISSING = <span className="text-muted">—</span>

const Reaction = ({ ms }) => {
  const value = formatReactionMs(ms)
  if (value === null) return MISSING
  return (
    <>
      {value}
      <span className="text-muted"> ms</span>
    </>
  )
}

const Avatar = ({ entry }) =>
  entry.photoURL ? (
    <img
      src={entry.photoURL}
      alt=""
      referrerPolicy="no-referrer"
      className="size-6 shrink-0 rounded-full"
    />
  ) : (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-bg text-meta text-muted"
    >
      {(entry.displayName ?? '?').charAt(0).toUpperCase()}
    </span>
  )

// One ranked entry. `isYou` tags the signed-in player's own row.
const LeaderboardRow = ({ entry, rank, isYou }) => (
  <tr className="border-t border-edge">
    <td className={`${CELL} text-muted tabular-nums`}>{rank}</td>
    <td className={CELL}>
      <div className="flex items-center gap-2">
        <Avatar entry={entry} />
        <span className="truncate text-heading">
          {entry.displayName ?? 'Anonymous'}
        </span>
        {isYou && (
          <span className="shrink-0 bg-bg px-1.5 py-0.5 text-meta text-body">
            You
          </span>
        )}
      </div>
      <p className="mt-0.5 flex flex-wrap gap-x-3 pl-8 text-meta text-muted tabular-nums lg:hidden">
        <span className="sm:hidden">{entry.mode}</span>
        <span className="sm:hidden">{formatAccuracy(entry.accuracy)}</span>
        <span>
          <Reaction ms={entry.reactionTime} />
        </span>
        <span>{formatDay(entry.createdAt)}</span>
      </p>
    </td>
    <td className={`${CELL} ${FROM_SM} whitespace-nowrap text-muted`}>
      {entry.mode}
    </td>
    <td
      className={`${CELL} text-right font-medium whitespace-nowrap text-heading tabular-nums`}
    >
      {formatScore(entry.score)}
    </td>
    <td className={`${CELL} ${FROM_SM} text-right text-body tabular-nums`}>
      {formatAccuracy(entry.accuracy)}
    </td>
    <td
      className={`${CELL} ${FROM_LG} text-right whitespace-nowrap text-body tabular-nums`}
    >
      <Reaction ms={entry.reactionTime} />
    </td>
    <td
      className={`${CELL} ${FROM_LG} text-right whitespace-nowrap text-muted tabular-nums`}
    >
      {formatDay(entry.createdAt)}
    </td>
  </tr>
)

// The figure columns' placeholder bars, right-aligned like their values.
const SKELETON_FIGURES = [
  { width: 'w-14', show: '' },
  { width: 'w-12', show: FROM_SM },
  { width: 'w-14', show: FROM_LG },
  { width: 'w-20', show: FROM_LG },
]

// A placeholder row at the real row's size: flat bars, no shimmer.
export const SkeletonRow = () => (
  <tr aria-hidden="true" className="border-t border-edge">
    <td className={CELL}>
      <span className="block h-3 w-4 bg-edge" />
    </td>
    <td className={CELL}>
      <span className="flex items-center gap-2">
        <span className="size-6 shrink-0 rounded-full bg-edge" />
        <span className="block h-3 w-32 bg-edge" />
      </span>
    </td>
    <td className={`${CELL} ${FROM_SM}`}>
      <span className="block h-3 w-16 bg-edge" />
    </td>
    {SKELETON_FIGURES.map(({ width, show }, i) => (
      <td key={i} className={`${CELL} ${show}`}>
        <span className={`ml-auto block h-3 bg-edge ${width}`} />
      </td>
    ))}
  </tr>
)

export default LeaderboardRow
