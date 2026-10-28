import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import InsightPanel from './InsightPanel'

const INSIGHT = {
  recommendation: { summary: 'Strong tracker.' },
  generatedAt: '2026-10-28T01:44:54.264Z',
  cached: false,
}

const renderPanel = (props = {}) =>
  render(
    <InsightPanel
      title="Games for your aim"
      description="Shooters that suit you."
      onGenerate={() => {}}
      {...props}
    >
      {({ summary }) => <p>{summary}</p>}
    </InsightPanel>
  )

describe('InsightPanel', () => {
  it('offers to generate before there is an answer', () => {
    const onGenerate = vi.fn()
    renderPanel({ onGenerate })
    fireEvent.click(screen.getByRole('button', { name: 'Get recommendation' }))
    expect(onGenerate).toHaveBeenCalledOnce()
  })

  it('disables the button and explains the wait while loading', () => {
    renderPanel({ isLoading: true })
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText(/can take 15 seconds/)).toBeInTheDocument()
  })

  it('renders the answer through its children', () => {
    renderPanel({ insight: INSIGHT })
    expect(screen.getByText('Strong tracker.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument()
  })

  it('says when a cached answer is shown', () => {
    renderPanel({ insight: { ...INSIGHT, cached: true } })
    expect(screen.getByText(/play more matches/i)).toBeInTheDocument()
  })

  it('explains a failure and keeps the previous answer', () => {
    renderPanel({
      insight: INSIGHT,
      error: { status: 422, details: { needed: 5, played: 3 } },
    })
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Play 2 more matches first'
    )
    expect(screen.getByText('Strong tracker.')).toBeInTheDocument()
  })
})
