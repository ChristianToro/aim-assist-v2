import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import ThemePicker from './ThemePicker'

const themes = [
  { id: 'dark', label: 'Dark', description: 'Neutral zinc.' },
  { id: 'terminal', label: 'Terminal', description: 'Phosphor green.' },
]

describe('ThemePicker', () => {
  it('renders one radio per theme with the current one checked', () => {
    render(<ThemePicker themes={themes} value="terminal" onChange={() => {}} />)

    expect(screen.getByRole('radio', { name: /Dark/ })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: /Terminal/ })).toBeChecked()
  })

  it('reports the chosen theme id', () => {
    const onChange = vi.fn()
    render(<ThemePicker themes={themes} value="dark" onChange={onChange} />)

    fireEvent.click(screen.getByRole('radio', { name: /Terminal/ }))

    expect(onChange).toHaveBeenCalledWith('terminal')
  })

  it('scopes each preview to its own theme so it renders in real colors', () => {
    const { container } = render(
      <ThemePicker themes={themes} value="dark" onChange={() => {}} />
    )

    expect(container.querySelector('[data-theme="terminal"]')).not.toBeNull()
  })
})
