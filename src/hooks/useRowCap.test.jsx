import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { useRef } from 'react'
import { useRowCap } from './useRowCap'

const ROW_HEIGHT = 40

// A frame of `count` rows whose geometry jsdom can't compute, so each row
// reports a fixed 40px slot below a 30px header.
const Table = ({ rows, count }) => {
  const frameRef = useRef(null)
  useRowCap(frameRef, rows, count)
  return (
    <div ref={frameRef} data-testid="frame">
      <table>
        <tbody>
          {Array.from({ length: count }, (_, i) => (
            <tr
              key={i}
              ref={(row) => {
                if (!row) return
                row.getBoundingClientRect = () => ({ top: 30 + i * ROW_HEIGHT })
                Object.defineProperty(row, 'offsetHeight', {
                  value: ROW_HEIGHT,
                })
              }}
            >
              <td>{i}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

describe('useRowCap', () => {
  it('shows the first rows and half of the next', () => {
    const { getByTestId } = render(<Table rows={5} count={8} />)
    // Row 6 starts at 30 + 5 × 40 = 230; half of it adds 20.
    expect(getByTestId('frame').style.maxHeight).toBe('250px')
  })

  it('leaves a board that fits uncapped', () => {
    const { getByTestId } = render(<Table rows={5} count={5} />)
    expect(getByTestId('frame').style.maxHeight).toBe('')
  })
})
