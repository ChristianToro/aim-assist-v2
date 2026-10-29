import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import ThemeProvider from '../contexts/ThemeProvider'
import Settings from './Settings'

// jsdom has no matchMedia; report the given queries as matching.
const stubMatchMedia = (matching = []) =>
  vi.stubGlobal('matchMedia', (query) => ({
    matches: matching.includes(query),
    addEventListener: () => {},
    removeEventListener: () => {},
  }))

const renderSettings = () =>
  render(
    <ThemeProvider>
      <Settings />
    </ThemeProvider>
  )

// A preference row's value badge, found through the row's title.
const valueOf = (label) =>
  within(screen.getByRole('heading', { name: label }).parentElement).getByText(
    /^(On|Off)$/
  ).textContent

describe('Settings', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.unstubAllGlobals())

  it('names the active theme and marks its radio', () => {
    stubMatchMedia()
    localStorage.setItem('aim-assist:theme', 'terminal')
    renderSettings()

    expect(
      screen.getByText('Terminal theme is on, saved to this browser.')
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Terminal/ })).toBeChecked()
  })

  it('shows the OS preferences as the browser reports them', () => {
    stubMatchMedia(['(prefers-reduced-motion: reduce)'])
    renderSettings()

    expect(valueOf('Reduced motion')).toBe('On')
    expect(valueOf('Increased contrast')).toBe('Off')
  })

  it('shows the saved sound choice', () => {
    stubMatchMedia()
    localStorage.setItem('aim-assist:muted', 'true')
    renderSettings()

    expect(valueOf('Sound')).toBe('Off')
  })
})
