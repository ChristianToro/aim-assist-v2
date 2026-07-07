import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import GameHud from './GameHud'

const hud = {
  score: 1200,
  accuracy: 95.4,
  combo: 3,
  multiplier: 1.3,
  hits: 20,
  misses: 1,
}

describe('GameHud', () => {
  it('renders nothing before the first snapshot', () => {
    const { container } = render(<GameHud hud={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the core stat tiles', () => {
    render(<GameHud hud={hud} />)
    expect(screen.getByText('1200')).toBeInTheDocument()
    expect(screen.getByText('95%')).toBeInTheDocument()
    expect(screen.getByText('3×1.3')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('shows Time for countdown modes and Lives for miss-limited modes', () => {
    const { rerender } = render(<GameHud hud={{ ...hud, timeRemaining: 12 }} />)
    expect(screen.getByText('12s')).toBeInTheDocument()
    expect(screen.queryByText('Lives')).not.toBeInTheDocument()

    rerender(<GameHud hud={{ ...hud, lives: 4 }} />)
    expect(screen.getByText('Lives')).toBeInTheDocument()
    expect(screen.queryByText('Time')).not.toBeInTheDocument()
  })
})
