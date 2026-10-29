import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { SIGNED_IN_USER, renderWithAuth } from '../../test/renderWithAuth'

vi.mock('../../services/auth', () => ({
  signInWithGoogle: vi.fn(),
  signOutUser: vi.fn(),
}))

import Navbar from './Navbar'

const PAGE_LINKS = ['Play', 'Leaderboards', 'Profile', 'Settings']

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
})
