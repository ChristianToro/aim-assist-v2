import { memo } from 'react'
import LeaderboardRow, { EDGE_PADDING, SkeletonRow } from './LeaderboardRow'
import { boardSummary } from '../../utils/leaderboardFormat'

const UNAUTHORIZED = 401
const SERVER_ERROR = 500
const COLUMNS = 7
const SKELETON_ROWS = 5

// A failed query and an empty result are very different problems, so they
// must not look alike. Errors carry the /api status (ApiError); a network
// failure has none, and reads the same as a server outage.
const errorMessage = (error) => {
  if (error?.status === UNAUTHORIZED) {
    return 'Your session has expired. Sign in again to see your personal bests.'
  }
  if (error?.status === undefined || error.status >= SERVER_ERROR) {
    return 'The leaderboard service is unreachable right now. Try again in a moment.'
  }
  return 'Something went wrong loading the leaderboard. See the browser console for details.'
}

const HEAD = `sticky top-0 bg-surface py-2 font-normal ${EDGE_PADDING}`
const NUMERIC_HEAD = `${HEAD} text-right`

/*
 * Headers stay up in every state, so an empty or failed board keeps its
 * frame. The table is laid out fixed from these widths, so the spare width
 * spreads across the columns instead of opening a gap after the name.
 */
const Header = () => (
  <thead>
    <tr className="text-meta text-muted">
      <th scope="col" className={`${HEAD} w-14`}>
        Rank
      </th>
      <th scope="col" className={HEAD}>
        Player
      </th>
      <th scope="col" className={`${HEAD} hidden w-[14%] sm:table-cell`}>
        Mode
      </th>
      <th scope="col" className={`${NUMERIC_HEAD} w-24 sm:w-[12%]`}>
        Score
      </th>
      <th
        scope="col"
        className={`${NUMERIC_HEAD} hidden w-[12%] sm:table-cell`}
      >
        Accuracy
      </th>
      <th
        scope="col"
        className={`${NUMERIC_HEAD} hidden w-[12%] lg:table-cell`}
      >
        Reaction
      </th>
      <th
        scope="col"
        className={`${NUMERIC_HEAD} hidden w-[14%] lg:table-cell`}
      >
        Date
      </th>
    </tr>
  </thead>
)

// One sentence across the whole table, for the empty and failed states.
const MessageRow = ({ children, ...props }) => (
  <tr className="border-t border-edge">
    <td colSpan={COLUMNS} className="px-4 py-6 text-ui text-muted">
      <div {...props}>{children}</div>
    </td>
  </tr>
)

const Body = ({ entries, isLoading, error, emptyMessage, uid, onRetry }) => {
  if (isLoading) {
    return Array.from({ length: SKELETON_ROWS }, (_, i) => (
      <SkeletonRow key={i} />
    ))
  }

  if (error) {
    return (
      <MessageRow role="alert">
        {errorMessage(error)}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="ml-2 font-medium text-heading underline-offset-4 hover:underline"
          >
            Retry
          </button>
        )}
      </MessageRow>
    )
  }

  if (entries.length === 0) return <MessageRow>{emptyMessage}</MessageRow>

  return entries.map((entry, index) => (
    <LeaderboardRow
      key={entry.id}
      entry={entry}
      rank={index + 1}
      isYou={Boolean(uid) && entry.uid === uid}
    />
  ))
}

/*
 * Ranked score table shared by every leaderboard view. With `withSummary`
 * its caption states the board's finding (who leads, where you stand);
 * `personal` words that finding for the player's own board.
 */
const Leaderboard = ({
  entries,
  isLoading,
  error,
  emptyMessage,
  highlightUid,
  onRetry,
  withSummary = false,
  personal = false,
}) => {
  const summary =
    withSummary && !isLoading && !error
      ? boardSummary(entries, { personal, uid: highlightUid })
      : null

  // A plain surface rather than Card: the row rules run to its edges.
  return (
    <div className="bg-surface">
      {isLoading && (
        <p role="status" className="sr-only">
          Loading the board
        </p>
      )}
      <table
        aria-busy={isLoading}
        className="w-full table-fixed text-left text-ui"
      >
        {withSummary && (isLoading || summary) && (
          <caption className="caption-top px-4 pt-4 pb-2 text-left text-body">
            {isLoading ? (
              <span
                aria-hidden="true"
                className="my-1 block h-3 w-72 bg-edge"
              />
            ) : (
              summary
            )}
          </caption>
        )}
        <Header />
        <tbody>
          <Body
            entries={entries}
            isLoading={isLoading}
            error={error}
            emptyMessage={emptyMessage}
            uid={highlightUid}
            onRetry={onRetry}
          />
        </tbody>
      </table>
    </div>
  )
}

export default memo(Leaderboard)
