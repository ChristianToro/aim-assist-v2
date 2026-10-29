import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { useCycle } from '../../hooks/useCycle'
import { useLeaderboard } from '../../hooks/useLeaderboard'

const TOP_COUNT = 5
const CYCLE_MS = 2000

const formatScore = (score) => score.toLocaleString('en-US')

// "Ada with 3,100, Bo with 2,850 and Cy with 2,400."
const separatorBefore = (index, count) => {
  if (index === 0) return ''
  return index === count - 1 ? ' and ' : ', '
}

const Names = ({ entries }) => {
  const litIndex = useCycle(entries.length, CYCLE_MS)

  return entries.map((entry, index) => (
    <Fragment key={entry.id}>
      {separatorBefore(index, entries.length)}
      <span
        className={`transition-colors duration-400 ${
          index === litIndex ? 'text-heading' : ''
        }`}
      >
        {entry.displayName ?? 'Anonymous'} with {formatScore(entry.score)}
      </span>
    </Fragment>
  ))
}

/*
 * Social proof from the live all-time board, written as one sentence: the
 * opening words are the heading, then the top players, one lit at a time.
 * A failed request hides the section; the landing page shows no outage.
 */
const BoardSentence = () => {
  const { entries, error, isLoading } = useLeaderboard('all')
  if (error) return null

  const top = entries.slice(0, TOP_COUNT)

  return (
    <section
      aria-labelledby="board-heading"
      className="bg-surface py-[clamp(6rem,14vh,7.5rem)]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* A heading and a paragraph set inline, reading as one sentence. */}
        <div data-reveal className="max-w-[56rem] text-lead text-muted">
          <h2 id="board-heading" className="inline font-medium text-heading">
            Leading the board:
          </h2>{' '}
          <p className="inline">
            {isLoading && 'loading the latest scores…'}
            {!isLoading && top.length === 0 && (
              <>nobody yet. The first score you post takes the top spot.</>
            )}
            {top.length > 0 && (
              <>
                <Names entries={top} />.
              </>
            )}
          </p>
        </div>
        <Link
          to="/leaderboards"
          data-reveal
          style={{ '--stagger': 1 }}
          className="mt-8 inline-block text-copy text-heading underline decoration-edge-strong underline-offset-4 transition-colors hover:decoration-current"
        >
          See every leaderboard
        </Link>
      </div>
    </section>
  )
}

export default BoardSentence
