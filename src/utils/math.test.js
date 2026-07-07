import { describe, expect, it } from 'vitest'
import { clamp, distance, lerp } from './math'

describe('clamp', () => {
  it('returns the value when within bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })
  it('clamps below the minimum', () => {
    expect(clamp(-3, 0, 10)).toBe(0)
  })
  it('clamps above the maximum', () => {
    expect(clamp(42, 0, 10)).toBe(10)
  })
})

describe('distance', () => {
  it('computes euclidean distance (3-4-5 triangle)', () => {
    expect(distance(0, 0, 3, 4)).toBe(5)
  })
  it('is zero for identical points', () => {
    expect(distance(7, 7, 7, 7)).toBe(0)
  })
})

describe('lerp', () => {
  it('returns a at t=0 and b at t=1', () => {
    expect(lerp(10, 20, 0)).toBe(10)
    expect(lerp(10, 20, 1)).toBe(20)
  })
  it('interpolates midway', () => {
    expect(lerp(10, 20, 0.5)).toBe(15)
  })
  it('clamps t outside [0, 1]', () => {
    expect(lerp(10, 20, 2)).toBe(20)
    expect(lerp(10, 20, -1)).toBe(10)
  })
})
