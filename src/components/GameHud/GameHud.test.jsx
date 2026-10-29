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
const TIMED = { duration: 30, missLimit: undefined }
const ENDLESS = { duration: Infinity, missLimit: 5 }

// The value shown under a label.
const figure = (label) =>
  screen.getByText(label, { selector: 'dt' }).nextElementSibling

describe('GameHud', () => {
  it("shows the round's starting values before the first snapshot", () => {
    const { rerender } = render(<GameHud hud={null} mode={TIMED} />)
    expect(figure('Time')).toHaveTextContent('30 s')
    expect(figure('Score')).toHaveTextContent('0')
    expect(figure('Accuracy')).toHaveTextContent('None yet')

    rerender(<GameHud hud={null} mode={ENDLESS} />)
    expect(figure('Lives')).toHaveTextContent('5')
  })

  it('renders the live figures', () => {
    render(<GameHud hud={hud} mode={TIMED} />)
    expect(figure('Score')).toHaveTextContent('1,200')
    expect(figure('Accuracy')).toHaveTextContent('95%')
    expect(figure('Combo')).toHaveTextContent('3×1.3')
    expect(figure('Hits')).toHaveTextContent('20')
  })

  it('shows Time for countdown modes and Lives for miss-limited modes', () => {
    const { rerender } = render(
      <GameHud hud={{ ...hud, timeRemaining: 12 }} mode={TIMED} />
    )
    expect(figure('Time')).toHaveTextContent('12 s')
    expect(screen.queryByText('Lives')).not.toBeInTheDocument()

    rerender(<GameHud hud={{ ...hud, lives: 4 }} mode={ENDLESS} />)
    expect(figure('Lives')).toHaveTextContent('4')
    expect(screen.queryByText('Time')).not.toBeInTheDocument()
  })
})
