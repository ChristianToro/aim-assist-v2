import { describe, expect, it } from 'vitest'
import { getModeById } from './modes'
import { scoreEvents } from './scoring'
import { playMatch, SURVIVAL_SCRIPT } from './testing/playMatch'

const hitsOf = (events) => events.filter(({ kind }) => kind === 'hit')

describe.each([
  // Gridshot: a timed mode; every 20th frame is a deliberate miss.
  ['gridshot', { missAt: (frame) => frame % 20 === 0 }],
  ['survival', SURVIVAL_SCRIPT],
])('a scripted %s match', (modeId, script) => {
  const { lastHud, summary, ages } = playMatch(modeId, script)

  it('ends and logs every hit and miss', () => {
    expect(summary).not.toBeNull()
    expect(hitsOf(summary.events)).toHaveLength(summary.hits)
    expect(summary.hits).toBeGreaterThan(0)
    expect(summary.misses).toBeGreaterThan(0)
  })

  it("reproduces the live HUD's figures from its log", () => {
    expect(scoreEvents(getModeById(modeId), summary.events)).toMatchObject({
      score: lastHud.score,
      hits: lastHud.hits,
      misses: lastHud.misses,
      maxCombo: lastHud.maxCombo,
    })
  })

  it('stamps events in ascending game time', () => {
    const times = summary.events.map(({ t }) => t)
    expect(times).toEqual([...times].sort((a, b) => a - b))
    expect(times[0]).toBeGreaterThanOrEqual(0)
  })

  it("logs each hit's reaction time as its target's age", () => {
    hitsOf(summary.events).forEach(({ t, spawnedAt }, i) => {
      expect(Math.abs(t - spawnedAt - ages[i] * 1000)).toBeLessThanOrEqual(1)
    })
  })
})

it('keeps every timed-mode event within the match duration', () => {
  const { summary } = playMatch('speed')
  const durationMs = getModeById('speed').duration * 1000
  summary.events.forEach(({ t }) => expect(t).toBeLessThanOrEqual(durationMs))
})

// Guards the Survival script above: its replay must cover the value ramp.
it('plays Survival past the end of its value ramp', () => {
  const { summary } = playMatch('survival', SURVIVAL_SCRIPT)
  const late = hitsOf(summary.events).filter(
    ({ spawnedAt }) => spawnedAt >= 90_000
  )
  expect(late.length).toBeGreaterThan(0)
})

it("leaves the last summary's log intact on reset", () => {
  const { session, summary } = playMatch('gridshot')
  const logged = summary.events.length
  session.reset()
  expect(summary.events).toHaveLength(logged)
})
