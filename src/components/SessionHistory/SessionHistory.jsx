import { memo, useId } from 'react'
import ReactionTime from '../ReactionTime/ReactionTime'
import {
  CELL,
  FROM_LG,
  FROM_SM,
  HEAD,
  NUMERIC_HEAD,
  ROW,
} from '../../styles/table'
import { formatAccuracy, formatScore } from '../../utils/leaderboardFormat'

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const MatchRow = ({ match }) => (
  <tr className={ROW}>
    <td className={CELL}>
      <span className="text-heading">{match.mode}</span>
      <p className="mt-0.5 flex flex-wrap gap-x-3 text-meta text-muted tabular-nums lg:hidden">
        <span className="sm:hidden">{formatAccuracy(match.accuracy)}</span>
        <span className="sm:hidden">{match.maxCombo}× combo</span>
        <span>
          <ReactionTime ms={match.averageReactionMs} /> average
        </span>
      </p>
    </td>
    <td className={`${CELL} text-right font-medium text-heading tabular-nums`}>
      {formatScore(match.score)}
    </td>
    <td className={`${CELL} ${FROM_SM} text-right text-body tabular-nums`}>
      {formatAccuracy(match.accuracy)}
    </td>
    <td className={`${CELL} ${FROM_SM} text-right text-body tabular-nums`}>
      {match.maxCombo}×
    </td>
    <td
      className={`${CELL} ${FROM_LG} text-right whitespace-nowrap text-body tabular-nums`}
    >
      <ReactionTime ms={match.averageReactionMs} />
    </td>
    <td
      className={`${CELL} ${FROM_LG} text-right whitespace-nowrap text-body tabular-nums`}
    >
      <ReactionTime ms={match.bestReactionMs} />
    </td>
    <td
      className={`${CELL} text-right whitespace-nowrap text-muted tabular-nums`}
    >
      {formatTime(match.finishedAt)}
    </td>
  </tr>
)

/*
 * Matches played this browser session (kept in React state, newest
 * first — this is deliberately ephemeral; persistent history lives in
 * Neon via the Profile page). Before the first match the section keeps
 * its heading and frame, with one line saying what will land there.
 */
const SessionHistory = ({ matches }) => {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={headingId} className="text-label font-medium text-heading">
          This session
        </h2>
        {matches.length > 0 && (
          <p className="text-meta text-muted">
            {matches.length} match{matches.length === 1 ? '' : 'es'}, newest
            first
          </p>
        )}
      </div>

      <div className="mt-3 bg-surface">
        <table className="w-full table-fixed text-left text-ui">
          <thead>
            <tr className="text-meta text-muted">
              <th scope="col" className={HEAD}>
                Mode
              </th>
              <th scope="col" className={`${NUMERIC_HEAD} w-24 sm:w-[12%]`}>
                Score
              </th>
              <th scope="col" className={`${NUMERIC_HEAD} ${FROM_SM} w-[12%]`}>
                Accuracy
              </th>
              <th scope="col" className={`${NUMERIC_HEAD} ${FROM_SM} w-[14%]`}>
                Max combo
              </th>
              <th scope="col" className={`${NUMERIC_HEAD} ${FROM_LG} w-[14%]`}>
                Avg reaction
              </th>
              <th scope="col" className={`${NUMERIC_HEAD} ${FROM_LG} w-[14%]`}>
                Best reaction
              </th>
              <th scope="col" className={`${NUMERIC_HEAD} w-24`}>
                When
              </th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match, index) => (
              <MatchRow
                key={`${match.finishedAt.getTime()}-${index}`}
                match={match}
              />
            ))}
          </tbody>
        </table>
        {/* Below the table, not in a spanning row: a colSpan wider than
            the phone's visible columns would squeeze them (see Leaderboard). */}
        {matches.length === 0 && (
          <p className={`${ROW} px-4 py-6 text-ui text-muted`}>
            Matches you finish appear here, newest first.
          </p>
        )}
      </div>
    </section>
  )
}

export default memo(SessionHistory)
