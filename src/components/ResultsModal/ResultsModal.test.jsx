import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import ResultsModal from './ResultsModal'

const SUMMARY = {
  score: 13125,
  accuracy: 96.25,
  hits: 77,
  misses: 3,
  maxCombo: 24,
  averageReactionMs: 977,
  bestReactionMs: 402,
  worstReactionMs: null,
}

const renderResults = (props = {}) =>
  render(
    <ResultsModal
      open
      summary={SUMMARY}
      saveStatus="saved"
      onRestart={() => {}}
      onClose={() => {}}
      {...props}
    />
  )

// The value beside a label in the stats list.
const figure = (label) =>
  screen.getByText(label, { selector: 'dt' }).nextElementSibling

describe('ResultsModal', () => {
  it('leads with the final score and lists the match figures', () => {
    renderResults()

    expect(screen.getByRole('dialog', { name: "Time's up!" })).toBeVisible()
    expect(screen.getByText('13,125')).toBeInTheDocument()
    expect(figure('Accuracy')).toHaveTextContent('96.3%')
    expect(figure('Hits / misses')).toHaveTextContent('77 / 3')
    expect(figure('Average reaction')).toHaveTextContent('977 ms')
    expect(figure('Worst reaction')).toHaveTextContent('—')
  })

  it('reports where the score went', () => {
    const { rerender } = renderResults()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Saved to your profile.'
    )

    rerender(
      <ResultsModal
        open
        summary={SUMMARY}
        saveStatus="error"
        onRestart={() => {}}
        onClose={() => {}}
      />
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      "Couldn't save this score. Check your connection."
    )
  })

  it('plays again or closes', () => {
    const onRestart = vi.fn()
    const onClose = vi.fn()
    renderResults({ onRestart, onClose })

    fireEvent.click(screen.getByRole('button', { name: 'Play again' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onRestart).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
