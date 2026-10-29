import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import Tabs from './Tabs'

const ITEMS = [
  { id: 'gridshot', label: 'Gridshot' },
  { id: 'flick', label: 'Flick' },
]

describe('Tabs', () => {
  it('marks the chosen tab and wires each to its panel', () => {
    render(
      <Tabs
        items={ITEMS}
        selectedId="flick"
        onSelect={() => {}}
        label="Game mode"
        panelId="panel"
        tabId={(id) => `tab-${id}`}
      />
    )

    expect(screen.getByRole('tablist', { name: 'Game mode' })).toBeVisible()
    const flick = screen.getByRole('tab', { name: 'Flick' })
    expect(flick).toHaveAttribute('aria-selected', 'true')
    expect(flick).toHaveAttribute('id', 'tab-flick')
    expect(flick).toHaveAttribute('aria-controls', 'panel')
    expect(screen.getByRole('tab', { name: 'Gridshot' })).toHaveAttribute(
      'aria-selected',
      'false'
    )
  })

  it('reports the chosen id', () => {
    const onSelect = vi.fn()
    render(
      <Tabs items={ITEMS} selectedId="gridshot" onSelect={onSelect} label="" />
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Flick' }))
    expect(onSelect).toHaveBeenCalledWith('flick')
  })
})
