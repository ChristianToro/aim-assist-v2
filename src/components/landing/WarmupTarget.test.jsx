import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import WarmupTarget from './WarmupTarget'

describe('WarmupTarget', () => {
  it('starts with no times and shows its action', () => {
    render(<WarmupTarget action={<button type="button">Go</button>} />)

    expect(screen.getAllByText('—')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()
  })

  it('reports a reaction time and moves the target when hit', () => {
    render(<WarmupTarget action={null} />)
    const target = screen.getByRole('button', { name: 'Hit the target' })
    const before = target.style.left + target.style.top

    fireEvent.click(target)

    expect(screen.getAllByText(/^\d+ ms$/)).toHaveLength(2)
    expect(target.style.left + target.style.top).not.toBe(before)
  })
})
