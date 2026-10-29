import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithAuth } from './test/renderWithAuth'

vi.mock('./services/auth', () => ({
  signInWithGoogle: vi.fn(),
  signOutUser: vi.fn(),
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
})
