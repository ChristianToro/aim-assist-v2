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
        error={{ code: 'unavailable' }}
        emptyMessage="No scores today yet."
      />
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText('No scores today yet.')).toBeNull()
  })

  it('names the missing index as the cause of a failed-precondition', () => {
    render(
      <Leaderboard
        entries={[]}
        error={{ code: 'failed-precondition' }}
        emptyMessage="No scores today yet."
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/composite index/i)
  })

  it('calls out rejected reads separately from missing indexes', () => {
    render(
      <Leaderboard
        entries={[]}
        error={{ code: 'permission-denied' }}
        emptyMessage="No scores today yet."
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/security rules/i)
  })

  it('ranks entries in the order received', () => {
    render(<Leaderboard entries={entries} emptyMessage="none" />)
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('900')).toBeInTheDocument()
    expect(screen.getByText('91.3%')).toBeInTheDocument()
  })
})
