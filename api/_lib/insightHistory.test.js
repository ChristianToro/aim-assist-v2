// @vitest-environment node
import { describe, expect, it } from 'vitest'
import * as hardwareAdvice from './hardwareAdvice.js'
import { historyEntries, toEntry } from './insightHistory.js'
import * as platformAdvice from './platformAdvice.js'

const HARDWARE = {
  summary: 'Steady flicks, slow corrections.',
  dpi: { recommended: 800, rationale: 'Finer control.' },
  sensitivity: { recommendation: 'Lower by 10%', rationale: 'Overshoot.' },
  pollingRateHz: { recommended: 1000, rationale: 'Smoother tracking.' },
}
const SETUP = { setup: { dpi: 1600, pollingRateHz: 500 } }

const row = (id, result, context = SETUP) => ({
  id,
  result,
  context,
  model: 'claude-opus-5-5',
  createdAt: new Date(`2026-10-2${id}T12:00:00Z`),
})

describe('toEntry', () => {
  it('renames a stored row to the API shape', () => {
    expect(toEntry(row('1', HARDWARE))).toEqual({
      id: '1',
      recommendation: HARDWARE,
      context: SETUP,
      model: 'claude-opus-5-5',
      generatedAt: new Date('2026-10-21T12:00:00Z'),
    })
  })

  it('sends null for a row saved before context was stored', () => {
    const withoutContext = row('1', HARDWARE)
    delete withoutContext.context
    expect(toEntry(withoutContext).context).toBeNull()
    expect(toEntry(row('1', HARDWARE, null)).context).toBeNull()
  })
})

describe('historyEntries', () => {
  it('keeps rows that parse, in the order given', () => {
    const entries = historyEntries(
      [row('3', HARDWARE), row('2', HARDWARE, null)],
      hardwareAdvice.parseAdvice
    )
    expect(entries.map(({ id }) => id)).toEqual(['3', '2'])
  })

  it('leaves out a row in a shape the current version cannot parse', () => {
    const older = { summary: 'An older shape', dpi: 800 }
    const entries = historyEntries(
      [row('3', HARDWARE), row('2', older), row('1', HARDWARE)],
      hardwareAdvice.parseAdvice
    )
    expect(entries.map(({ id }) => id)).toEqual(['3', '1'])
  })

  it("checks each row against its own kind's parser", () => {
    expect(
      historyEntries([row('1', HARDWARE)], platformAdvice.parseAdvice)
    ).toEqual([])
  })

  it('returns an empty list for a player with no answers', () => {
    expect(historyEntries([], hardwareAdvice.parseAdvice)).toEqual([])
  })
})
