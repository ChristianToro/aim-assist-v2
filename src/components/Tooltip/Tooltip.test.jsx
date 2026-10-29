import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import Tooltip from './Tooltip'

const renderTooltip = () =>
  render(
    <>
      <Tooltip content="Sign in first">
        {(triggerProps) => (
          <button type="button" {...triggerProps}>
            Start
          </button>
        )}
      </Tooltip>
      <p>Elsewhere</p>
    </>
  )

const tooltip = () => screen.queryByRole('tooltip')

describe('Tooltip', () => {
  it('is hidden until the trigger is used, and describes it', () => {
    renderTooltip()

    expect(tooltip()).toBeNull()
    expect(
      screen.getByRole('button', { name: 'Start' })
    ).toHaveAccessibleDescription('Sign in first')
  })

  it('opens on click and closes on Escape', () => {
    renderTooltip()

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(tooltip()).toHaveTextContent('Sign in first')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(tooltip()).toBeNull()
  })

  it('closes on a press outside it', () => {
    renderTooltip()

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    fireEvent.pointerDown(screen.getByText('Elsewhere'))

    expect(tooltip()).toBeNull()
  })

  it('opens on focus and hover, and closes on blur and leave', () => {
    renderTooltip()
    const trigger = screen.getByRole('button', { name: 'Start' })

    fireEvent.focus(trigger)
    expect(tooltip()).not.toBeNull()
    fireEvent.blur(trigger)
    expect(tooltip()).toBeNull()

    fireEvent.mouseEnter(trigger.parentElement)
    expect(tooltip()).not.toBeNull()
    fireEvent.mouseLeave(trigger.parentElement)
    expect(tooltip()).toBeNull()
  })
})
