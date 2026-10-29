import ReactionTime from '../ReactionTime/ReactionTime'
import { CELL, FROM_LG, FROM_SM, ROW } from '../../styles/table'
import {
  formatAccuracy,
  formatDay,
  formatScore,
} from '../../utils/leaderboardFormat'

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

const Player = ({ entry, isYou }) => (
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
)

/*
 * One ranked entry. `isYou` tags the signed-in player's own row. On a
 * `personal` board every row is the same player, so the mode becomes the
 * row's identity and the Player column goes.
 */
const LeaderboardRow = ({ entry, rank, isYou, personal = false }) => (
  <tr className={ROW}>
    <td className={`${CELL} text-muted tabular-nums`}>{rank}</td>
    <td className={CELL}>
      {personal ? (
        <span className="text-heading">{entry.mode}</span>
      ) : (
        <Player entry={entry} isYou={isYou} />
      )}
      <p
        className={`mt-0.5 flex flex-wrap gap-x-3 text-meta text-muted tabular-nums lg:hidden ${
          personal ? '' : 'pl-8'
        }`}
      >
        {!personal && <span className="sm:hidden">{entry.mode}</span>}
        <span className="sm:hidden">{formatAccuracy(entry.accuracy)}</span>
        <span>
          <ReactionTime ms={entry.reactionTime} />
        </span>
        <span>{formatDay(entry.createdAt)}</span>
      </p>
    </td>
    {!personal && (
      <td className={`${CELL} ${FROM_SM} whitespace-nowrap text-muted`}>
        {entry.mode}
      </td>
    )}
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
      <ReactionTime ms={entry.reactionTime} />
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
export const SkeletonRow = ({ personal = false }) => (
  <tr aria-hidden="true" className={ROW}>
    <td className={CELL}>
      <span className="block h-3 w-4 bg-edge" />
    </td>
    <td className={CELL}>
      {personal ? (
        <span className="my-1.5 block h-3 w-20 bg-edge" />
      ) : (
        <span className="flex items-center gap-2">
          <span className="size-6 shrink-0 rounded-full bg-edge" />
          <span className="block h-3 w-32 bg-edge" />
        </span>
      )}
    </td>
    {!personal && (
      <td className={`${CELL} ${FROM_SM}`}>
        <span className="block h-3 w-16 bg-edge" />
      </td>
    )}
    {SKELETON_FIGURES.map(({ width, show }, i) => (
      <td key={i} className={`${CELL} ${show}`}>
        <span className={`ml-auto block h-3 bg-edge ${width}`} />
      </td>
    ))}
  </tr>
)

export default LeaderboardRow
