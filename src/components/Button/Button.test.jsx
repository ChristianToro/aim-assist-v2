import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Button from './Button'

describe('Button', () => {
  it('renders a native button by default', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toHaveAttribute('type', 'button')
  })

  it('renders a router link when given `to`', () => {
    render(
      <MemoryRouter>
        <Button to="/play">Start Training</Button>
      </MemoryRouter>
    )
    const link = screen.getByRole('link', { name: 'Start Training' })
    expect(link).toHaveAttribute('href', '/play')
  })

  it('supports the disabled state', () => {
    render(<Button disabled>Nope</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
