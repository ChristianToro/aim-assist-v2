import { describe, expect, it } from 'vitest'
import { Timer } from './Timer'

describe('Timer', () => {
  it('counts down by delta time', () => {
    const timer = new Timer(30)
    timer.update(1.5)
    expect(timer.remaining).toBe(28.5)
    expect(timer.isFinished).toBe(false)
  })

  it('never goes below zero and reports finished', () => {
    const timer = new Timer(1)
    timer.update(5)
    expect(timer.remaining).toBe(0)
    expect(timer.isFinished).toBe(true)
  })

  it('displays whole seconds, rounding up', () => {
    const timer = new Timer(30)
    timer.update(0.4)
    expect(timer.displaySeconds).toBe(30)
    timer.update(0.7)
    expect(timer.displaySeconds).toBe(29)
  })

  it('supports endless matches (Infinity never finishes)', () => {
    const timer = new Timer(Infinity)
    timer.update(1000)
    expect(timer.remaining).toBe(Infinity)
    expect(timer.isFinished).toBe(false)
  })

  it('reset restores the full duration', () => {
    const timer = new Timer(30)
    timer.update(10)
    timer.reset()
    expect(timer.remaining).toBe(30)
  })
})
