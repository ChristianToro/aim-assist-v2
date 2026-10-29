import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import MouseSetupHelp from './MouseSetupHelp'

const trigger = () =>
  screen.getByRole('button', {
    name: 'Not sure what your DPI and polling rate are?',
  })

describe('MouseSetupHelp', () => {
  it('describes its trigger with where to find the settings', () => {
    render(<MouseSetupHelp />)

    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(trigger()).toHaveAccessibleDescription(
      /Check your mouse’s software.*Logitech G HUB.*Look up your mouse model/
    )
  })

  it('shows both steps on hover', () => {
    render(<MouseSetupHelp />)

    fireEvent.mouseEnter(trigger().parentElement)

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('1. Check your mouse’s software')
    expect(tooltip).toHaveTextContent('2. Look up your mouse model')
  })
})
