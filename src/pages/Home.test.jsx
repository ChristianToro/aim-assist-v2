import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { SIGNED_IN_USER, renderWithAuth } from '../test/renderWithAuth'

const { mockSignIn } = vi.hoisted(() => ({ mockSignIn: vi.fn() }))
vi.mock('../services/auth', () => ({ signInWithGoogle: mockSignIn }))
vi.mock('../hooks/useLeaderboard', () => ({
  useLeaderboard: () => ({ entries: [], error: null, isLoading: false }),
}))

import Home from './Home'

describe('Home', () => {
  it('tells a signed-out visitor to sign in instead of starting', () => {
    renderWithAuth(<Home />)
    const start = screen.getByRole('button', { name: 'Start Training' })

    fireEvent.click(start)

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Continue with Google to start playing'
    )
    expect(screen.queryByRole('link', { name: 'Start Training' })).toBeNull()
  })

  it('closes on Google sign-in that lands the visitor on /play', () => {
    mockSignIn.mockResolvedValue()
    renderWithAuth(<Home />)
    const closing = screen.getByRole('region', {
      name: /are you ready to step your game up/i,
    })

    fireEvent.click(
      within(closing).getByRole('button', { name: 'Continue with Google' })
    )

    expect(mockSignIn).toHaveBeenCalledWith({ returnTo: '/play' })
  })

  it('links a signed-in player straight to /play, from the hero and the close', () => {
    renderWithAuth(<Home />, { user: SIGNED_IN_USER })

    const links = screen.getAllByRole('link', { name: 'Start Training' })
    expect(links).toHaveLength(2)
    for (const link of links) expect(link).toHaveAttribute('href', '/play')
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('names all six modes', () => {
    renderWithAuth(<Home />)
    const modes = screen.getByRole('region', { name: 'Six ways to train' })

    expect(within(modes).getAllByRole('heading', { level: 3 })).toHaveLength(6)
  })

  it('has one h1 that names the page', () => {
    renderWithAuth(<Home />)

    expect(screen.getAllByRole('heading', { level: 1 })).toEqual([
      screen.getByRole('heading', { name: 'Train your aim' }),
    ])
  })
})
