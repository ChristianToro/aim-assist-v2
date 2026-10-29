import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen } from '@testing-library/react'
import { renderWithAuth } from '../../test/renderWithAuth'

const { mockUseLeaderboard } = vi.hoisted(() => ({
  mockUseLeaderboard: vi.fn(),
}))
vi.mock('../../hooks/useLeaderboard', () => ({
  useLeaderboard: mockUseLeaderboard,
}))

import BoardSentence from './BoardSentence'

const entry = (id, displayName, score) => ({ id, displayName, score })
const board = (entries, extra = {}) =>
  mockUseLeaderboard.mockReturnValue({
    entries,
    error: null,
    isLoading: false,
    ...extra,
  })

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('BoardSentence', () => {
  it('writes the top five players as one sentence', () => {
    board([
      entry('a', 'Ada', 3100),
      entry('b', 'Bo', 2850),
      entry('c', 'Cy', 2400),
      entry('d', 'Dee', 2100),
      entry('e', 'Eve', 1900),
      entry('f', 'Fay', 1200),
    ])
    renderWithAuth(<BoardSentence />)

    expect(
      screen.getByRole('region', { name: 'Leading the board:' })
    ).toHaveTextContent(
      'Leading the board: Ada with 3,100, Bo with 2,850, Cy with 2,400, Dee with 2,100 and Eve with 1,900.'
    )
    expect(screen.queryByText(/Fay/)).toBeNull()
  })

  it('lights one name at a time, moving every two seconds', () => {
    board([entry('a', 'Ada', 3100), entry('b', 'Bo', 2850)])
    renderWithAuth(<BoardSentence />)

    expect(screen.getByText('Ada with 3,100')).toHaveClass('text-heading')
    expect(screen.getByText('Bo with 2,850')).not.toHaveClass('text-heading')

    act(() => vi.advanceTimersByTime(2000))

    expect(screen.getByText('Ada with 3,100')).not.toHaveClass('text-heading')
    expect(screen.getByText('Bo with 2,850')).toHaveClass('text-heading')
  })

  it('invites the first score when the board is empty', () => {
    board([])
    renderWithAuth(<BoardSentence />)

    expect(screen.getByText(/nobody yet/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'See every leaderboard' })
    ).toHaveAttribute('href', '/leaderboards')
  })

  it('hides itself when the board fails to load', () => {
    board([], { error: new TypeError('Failed to fetch') })
    const { container } = renderWithAuth(<BoardSentence />)

    expect(container).toBeEmptyDOMElement()
  })
})
