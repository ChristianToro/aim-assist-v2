import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Leaderboard from './Leaderboard'

const entries = [
  {
    id: 'a',
    uid: 'u1',
    displayName: 'Ada',
    score: 900,
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

  it('ranks entries in the order received', () => {
    render(<Leaderboard entries={entries} emptyMessage="none" />)
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('900')).toBeInTheDocument()
    expect(screen.getByText('91.3%')).toBeInTheDocument()
  })

  it('formats the ISO timestamp from the API as a date', () => {
    render(<Leaderboard entries={entries} emptyMessage="none" />)
    expect(
      screen.getByText(new Date(entries[0].createdAt).toLocaleDateString())
    ).toBeInTheDocument()
  })
})
