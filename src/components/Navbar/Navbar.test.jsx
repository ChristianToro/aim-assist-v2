import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { SIGNED_IN_USER, renderWithAuth } from '../../test/renderWithAuth'

const { mockSignIn } = vi.hoisted(() => ({ mockSignIn: vi.fn() }))
vi.mock('../../services/auth', () => ({
  signInWithGoogle: mockSignIn,
  signOutUser: vi.fn(),
}))

import Navbar from './Navbar'

const PAGE_LINKS = ['Play', 'Leaderboards', 'Profile', 'Settings']

const signIn = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))

beforeEach(() => {
  mockSignIn.mockReset()
  mockSignIn.mockResolvedValue()
})

describe('Navbar', () => {
  it('hides the page links from signed-out visitors and offers sign-in', () => {
    renderWithAuth(<Navbar />)

    for (const name of PAGE_LINKS) {
      expect(screen.queryByRole('link', { name })).toBeNull()
    }
    expect(
      screen.getByRole('button', { name: 'Continue with Google' })
    ).toBeInTheDocument()
  })

  it('shows no page links while the session is restoring', () => {
    renderWithAuth(<Navbar />, { isLoading: true })

    for (const name of PAGE_LINKS) {
      expect(screen.queryByRole('link', { name })).toBeNull()
    }
  })

  it('shows every page link to a signed-in player', () => {
    renderWithAuth(<Navbar />, { user: SIGNED_IN_USER })

    for (const name of PAGE_LINKS) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
  })

  it('sends a sign-in from the landing page on to /play', () => {
    renderWithAuth(<Navbar />, { route: '/' })

    signIn()

    expect(mockSignIn).toHaveBeenCalledWith({ returnTo: '/play' })
  })

  it('returns a sign-in from any other page to that page', () => {
    renderWithAuth(<Navbar />, { route: '/leaderboards' })

    signIn()

    expect(mockSignIn).toHaveBeenCalledWith({ returnTo: undefined })
  })
})
