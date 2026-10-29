import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import Leaderboard from './Leaderboard'
import { formatDay } from '../../utils/leaderboardFormat'

const entries = [
  {
    id: 'a',
    uid: 'u1',
    displayName: 'Ada',
    score: 1250,
    accuracy: 91.25,
    mode: 'Gridshot',
    createdAt: '2026-10-28T12:00:00.000Z',
  },
]

describe('Leaderboard', () => {
  it('distinguishes a failed query from an empty one', () => {
    const { rerender } = render(
      <Leaderboard entries={[]} emptyMessage="No scores today yet." />
    )
    expect(screen.getByText('No scores today yet.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()

    rerender(
      <Leaderboard
        entries={[]}
        error={{ status: 400 }}
        emptyMessage="No scores today yet."
      />
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText('No scores today yet.')).toBeNull()
  })

  it('asks for a fresh sign-in on a 401', () => {
    render(<Leaderboard entries={[]} error={{ status: 401 }} emptyMessage="" />)
    expect(screen.getByRole('alert')).toHaveTextContent(/sign in again/i)
  })

  it('reports server errors and network failures as an outage', () => {
    const { rerender } = render(
      <Leaderboard entries={[]} error={{ status: 503 }} emptyMessage="" />
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/unreachable/i)

    rerender(
      <Leaderboard
        entries={[]}
        error={new TypeError('Failed to fetch')}
        emptyMessage=""
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/unreachable/i)
  })

  it('offers a retry on a failed board when it can reload', () => {
    const onRetry = vi.fn()
    render(
      <Leaderboard
        entries={[]}
        error={{ status: 503 }}
        emptyMessage=""
        onRetry={onRetry}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('keeps the header while loading, with placeholder rows', () => {
    render(<Leaderboard entries={[]} isLoading emptyMessage="none" />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading the board')
    expect(screen.getByRole('columnheader', { name: 'Score' })).toBeVisible()
    expect(screen.queryByText('none')).toBeNull()
  })

  it('ranks entries in the order received, with formatted figures', () => {
    render(<Leaderboard entries={entries} emptyMessage="none" />)
    const [, row] = screen.getAllByRole('row')

    expect(within(row).getByText('Ada')).toBeInTheDocument()
    expect(within(row).getByText('1,250')).toBeInTheDocument()
    // Accuracy and date also appear in the phone's second line.
    expect(within(row).getAllByText('91.3%').length).toBeGreaterThan(0)
    expect(
      within(row).getAllByText(formatDay(entries[0].createdAt)).length
    ).toBeGreaterThan(0)
  })

  it('scrolls inside a named, focusable frame past its visible rows', () => {
    const many = Array.from({ length: 6 }, (_, i) => ({
      ...entries[0],
      id: `m${i}`,
    }))
    const { rerender } = render(
      <Leaderboard
        entries={many.slice(0, 5)}
        emptyMessage="none"
        visibleRows={5}
        label="Best matches"
      />
    )
    expect(screen.queryByRole('region')).toBeNull()

    rerender(
      <Leaderboard
        entries={many}
        emptyMessage="none"
        visibleRows={5}
        label="Best matches"
      />
    )
    const frame = screen.getByRole('region', { name: 'Best matches' })
    expect(frame).toHaveAttribute('tabindex', '0')
    expect(frame).toHaveClass('overflow-y-auto')
  })

  it("tags the signed-in player's own row", () => {
    render(
      <Leaderboard entries={entries} emptyMessage="none" highlightUid="u1" />
    )
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('states the finding as its caption when asked', () => {
    render(
      <Leaderboard
        entries={entries}
        emptyMessage="none"
        highlightUid="u1"
        withSummary
      />
    )
    expect(screen.getByRole('table')).toHaveAccessibleName(
      'You lead with 1,250 in Gridshot. 1 player on this board.'
    )
  })
})
