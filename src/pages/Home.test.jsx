import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { SIGNED_IN_USER, renderWithAuth } from '../test/renderWithAuth'
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

  it('links a signed-in player straight to /play', () => {
    renderWithAuth(<Home />, { user: SIGNED_IN_USER })

    expect(
      screen.getByRole('link', { name: 'Start Training' })
    ).toHaveAttribute('href', '/play')
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})
