import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import SessionHistory from './SessionHistory'

const MATCH = {
  mode: 'Speed',
  score: 13125,
  accuracy: 96.25,
  maxCombo: 24,
  averageReactionMs: 977,
  bestReactionMs: 402,
  finishedAt: new Date(2026, 9, 29, 14, 5),
}

describe('SessionHistory', () => {
  it('keeps its heading and frame before the first match', () => {
    render(<SessionHistory matches={[]} />)

    expect(
      screen.getByRole('region', { name: 'This session' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Matches you finish appear here, newest first.')
    ).toBeInTheDocument()
  })

  it('lists finished matches with formatted figures and counts them', () => {
    render(<SessionHistory matches={[MATCH, { ...MATCH, mode: 'Flick' }]} />)
    const [, row] = screen.getAllByRole('row')

    expect(screen.getByText('2 matches, newest first')).toBeInTheDocument()
    expect(within(row).getByText('Speed')).toBeInTheDocument()
    expect(within(row).getByText('13,125')).toBeInTheDocument()
    // Accuracy also appears in the phone's second line.
    expect(within(row).getAllByText('96.3%').length).toBeGreaterThan(0)
  })
})
