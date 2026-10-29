import { describe, expect, it } from 'vitest'
import { mergeEntries, shownEntry } from './insightHistory'

const entry = (id, day, extra = {}) => ({
  id,
  generatedAt: `2026-10-${day}T12:00:00.000Z`,
  ...extra,
})

describe('mergeEntries', () => {
  it('puts a fresh answer above the saved ones', () => {
    const merged = mergeEntries(
      [entry('3', 29)],
      [entry('2', 28), entry('1', 27)]
    )
    expect(merged.map(({ id }) => id)).toEqual(['3', '2', '1'])
  })

  it("keeps the added copy of a cached answer, so it says it's cached", () => {
    const cached = entry('2', 28, { cached: true })
    const merged = mergeEntries([cached], [entry('2', 28), entry('1', 27)])
    expect(merged).toHaveLength(2)
    expect(merged[0]).toBe(cached)
  })

  it('orders by when each answer was generated', () => {
    const merged = mergeEntries(
      [entry('2', 28, { cached: true })],
      [entry('3', 29), entry('2', 28)]
    )
    expect(merged.map(({ id }) => id)).toEqual(['3', '2'])
  })

  it('is empty when nothing was generated or saved', () => {
    expect(mergeEntries([], [])).toEqual([])
  })
})

describe('shownEntry', () => {
  const entries = [entry('3', 29), entry('2', 28)]

  it('shows the latest when nothing is picked', () => {
    expect(shownEntry(entries, null)).toBe(entries[0])
  })

  it('shows the picked entry', () => {
    expect(shownEntry(entries, '2')).toBe(entries[1])
  })

  it('falls back to the latest when the pick is gone', () => {
    expect(shownEntry(entries, '9')).toBe(entries[0])
  })

  it('shows nothing without entries', () => {
    expect(shownEntry([], null)).toBeNull()
  })
})
