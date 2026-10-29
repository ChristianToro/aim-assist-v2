import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { SIGNED_IN_USER, renderWithAuth } from '../test/renderWithAuth'

const { mockUseLeaderboard } = vi.hoisted(() => ({
  mockUseLeaderboard: vi.fn(() => ({
    entries: [],
    error: null,
    isLoading: false,
    reload: () => {},
  })),
}))
vi.mock('../services/auth', () => ({ signInWithGoogle: vi.fn() }))
vi.mock('../hooks/useLeaderboard', () => ({
  useLeaderboard: mockUseLeaderboard,
}))

import Leaderboards from './Leaderboards'

describe('Leaderboards', () => {
  it('switches boards by tab and names each window', () => {
    renderWithAuth(<Leaderboards />)
    const week = screen.getByRole('tab', { name: 'This Week' })

    fireEvent.click(week)

    expect(week).toHaveAttribute('aria-selected', 'true')
    expect(mockUseLeaderboard).toHaveBeenLastCalledWith('weekly', undefined)
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('This Week')
    expect(screen.getByText(/Resets Monday at 00:00 UTC/)).toBeInTheDocument()
  })

  it('asks a visitor to sign in for their personal bests', () => {
    renderWithAuth(<Leaderboards />)

    fireEvent.click(screen.getByRole('tab', { name: 'Personal Best' }))

    expect(screen.getByText('Sign in to see your best matches.')).toBeVisible()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('offers a signed-in player a match from the title row', () => {
    renderWithAuth(<Leaderboards />, { user: SIGNED_IN_USER })

    expect(screen.getByRole('link', { name: 'Play a match' })).toHaveAttribute(
      'href',
      '/play'
    )
  })
})
