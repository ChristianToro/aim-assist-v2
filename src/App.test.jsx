import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithAuth } from './test/renderWithAuth'

vi.mock('./services/auth', () => ({
  signInWithGoogle: vi.fn(),
  signOutUser: vi.fn(),
}))
vi.mock('./hooks/useLeaderboard', () => ({
  useLeaderboard: () => ({ entries: [], error: null, isLoading: false }),
}))

import { AppRoutes } from './App'

describe('AppRoutes', () => {
  it('sends a signed-out visitor from /play back to the home page', async () => {
    renderWithAuth(<AppRoutes />, { route: '/play' })

    expect(
      await screen.findByRole('heading', { level: 1, name: /train your aim/i })
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Play' })).toBeNull()
  })

  it('holds a protected route on the loading frame while the session restores', () => {
    renderWithAuth(<AppRoutes />, { route: '/play', isLoading: true })

    expect(screen.getByRole('status')).toHaveTextContent('Loading page')
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
  })

  it('renders the 404 page for an unknown address', async () => {
    renderWithAuth(<AppRoutes />, { route: '/nowhere' })

    expect(
      await screen.findByRole('heading', { level: 1, name: '404 Missed' })
    ).toBeInTheDocument()
  })
})
