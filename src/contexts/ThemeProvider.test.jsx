import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import ThemeProvider from './ThemeProvider'
import { useTheme } from '../hooks/useTheme'

const STORAGE_KEY = 'aim-assist:theme'

// Minimal consumer: shows the active theme and can switch it.
const ThemeProbe = () => {
  const { themeId, setTheme } = useTheme()
  return (
    <>
      <span data-testid="active">{themeId}</span>
      <button type="button" onClick={() => setTheme('terminal')}>
        terminal
      </button>
      <button type="button" onClick={() => setTheme('solarized')}>
        unknown
      </button>
    </>
  )
}

const renderProbe = () =>
  render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>
  )

beforeEach(() => localStorage.clear())

afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('ThemeProvider', () => {
  it('defaults to dark and stamps it on <html>', () => {
    renderProbe()
    expect(screen.getByTestId('active')).toHaveTextContent('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('restores a saved theme on mount', () => {
    localStorage.setItem(STORAGE_KEY, 'cyberpunk')
    renderProbe()
    expect(screen.getByTestId('active')).toHaveTextContent('cyberpunk')
    expect(document.documentElement.dataset.theme).toBe('cyberpunk')
  })

  it('ignores a stored value that is no longer a known theme', () => {
    localStorage.setItem(STORAGE_KEY, 'solarized')
    renderProbe()
    expect(screen.getByTestId('active')).toHaveTextContent('dark')
  })

  it('applies and persists a new theme', () => {
    renderProbe()

    fireEvent.click(screen.getByRole('button', { name: 'terminal' }))

    expect(screen.getByTestId('active')).toHaveTextContent('terminal')
    expect(document.documentElement.dataset.theme).toBe('terminal')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('terminal')
  })

  it('rejects an unknown theme id without touching the DOM or storage', () => {
    renderProbe()

    fireEvent.click(screen.getByRole('button', { name: 'unknown' }))

    expect(screen.getByTestId('active')).toHaveTextContent('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
