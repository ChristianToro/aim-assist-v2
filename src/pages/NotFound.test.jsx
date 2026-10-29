import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithAuth } from '../test/renderWithAuth'
import NotFound from './NotFound'

describe('NotFound', () => {
  it('names the miss and offers the way home beside the warm-up target', () => {
    renderWithAuth(<NotFound />, { route: '/nowhere' })

    expect(
      screen.getByRole('heading', { level: 1, name: '404 Missed' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute(
      'href',
      '/'
    )
    expect(
      screen.getByRole('button', { name: 'Hit the target' })
    ).toBeInTheDocument()
  })
})
