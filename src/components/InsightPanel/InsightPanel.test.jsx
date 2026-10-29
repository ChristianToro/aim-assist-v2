import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import InsightPanel from './InsightPanel'

const entry = (id, summary, extra = {}) => ({
  id,
  recommendation: { summary },
  generatedAt: '2026-10-28T01:44:54.264Z',
  ...extra,
})
const LATEST = entry('2', 'Strong tracker.')
const OLDER = entry('1', 'Steady flicker.', {
  generatedAt: '2026-10-27T09:15:00.000Z',
})

// useInsightHistory's result, settled with the given entries.
const historyOf = (entries, extra = {}) => ({
  entries,
  shown: entries[0] ?? null,
  error: null,
  isLoading: false,
  reload: vi.fn(),
  select: vi.fn(),
  ...extra,
})

const renderPanel = (props = {}) =>
  render(
    <InsightPanel
      title="Games for your aim"
      description="Shooters that suit you."
      history={historyOf([])}
      onGenerate={() => {}}
      {...props}
    >
      {({ recommendation }) => <p>{recommendation.summary}</p>}
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

  it('says it is loading the last answer while the history loads', () => {
    renderPanel({ history: historyOf([], { isLoading: true }) })
    expect(screen.getByText(/loading your last/i)).toBeInTheDocument()
  })

  it('opens on the latest saved answer, with no picker for just one', () => {
    renderPanel({ history: historyOf([LATEST]) })
    expect(screen.getByText('Strong tracker.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument()
    expect(screen.getByText(/^Generated /)).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('lists older answers in a picker and selects one', () => {
    const history = historyOf([LATEST, OLDER])
    renderPanel({ history })

    const picker = screen.getByRole('combobox', { name: 'Showing' })
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(2)
    expect(options[0]).toHaveTextContent(/^Latest, /)
    expect(picker).toHaveValue('2')

    fireEvent.change(picker, { target: { value: '1' } })
    expect(history.select).toHaveBeenCalledWith('1')
  })

  it('renders whichever entry is shown', () => {
    renderPanel({ history: historyOf([LATEST, OLDER], { shown: OLDER }) })
    expect(screen.getByText('Steady flicker.')).toBeInTheDocument()
    expect(screen.queryByText('Strong tracker.')).toBeNull()
  })

  it('says when a cached answer is shown', () => {
    renderPanel({ history: historyOf([{ ...LATEST, cached: true }]) })
    expect(screen.getByText(/play more matches/i)).toBeInTheDocument()
  })

  it('keeps generating usable when the history fails, with a retry', () => {
    const history = historyOf([], { error: new TypeError('Failed to fetch') })
    renderPanel({ history })

    expect(screen.getByRole('alert')).toHaveTextContent(
      "Couldn't load your past recommendations."
    )
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(history.reload).toHaveBeenCalledOnce()
    expect(
      screen.getByRole('button', { name: 'Get recommendation' })
    ).toBeEnabled()
  })

  it('explains a failure and keeps the shown answer', () => {
    renderPanel({
      history: historyOf([LATEST]),
      error: { status: 422, details: { needed: 5, played: 3 } },
    })
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Play 2 more matches first'
    )
    expect(screen.getByText('Strong tracker.')).toBeInTheDocument()
  })
})
