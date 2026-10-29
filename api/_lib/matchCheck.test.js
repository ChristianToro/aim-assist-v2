// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { GAME_MODES, getModeById } from '../../src/game/modes.js'
import { scoreEvents } from '../../src/game/scoring.js'
import { playMatch, SURVIVAL_SCRIPT } from '../../src/game/testing/playMatch.js'
import { checkMatch, CLOCK_TOLERANCE_MS } from './matchCheck.js'
import realMatches from './fixtures/real-matches.json'

const gridshot = getModeById('gridshot')
const flick = getModeById('flick')
const survival = getModeById('survival')
const GRIDSHOT_MS = gridshot.duration * 1000

const hit = (t, spawnedAt) => ({ t, kind: 'hit', spawnedAt })
const miss = (t) => ({ t, kind: 'miss' })
const expire = (t) => ({ t, kind: 'expire' })

// A match submitted as soon as it ends: a timed one after its duration,
// Survival after its last event.
const submitted = (mode, events) => ({
  mode,
  events,
  elapsedMs: Number.isFinite(mode.duration)
    ? mode.duration * 1000
    : events.at(-1).t,
})

// An engine-made log for the mode, from the scripted player.
const playedMatch = (mode) => {
  const script = mode.id === 'survival' ? SURVIVAL_SCRIPT : {}
  return submitted(mode, playMatch(mode.id, script).summary.events)
}

const playedGridshot = playedMatch(gridshot)
const playedSurvival = playedMatch(survival)

// The played Gridshot match with its log swapped for `events`.
const gridshotWith = (events) => ({ ...playedGridshot, events })

// One match per mode, hand-played in the browser by the project's owner.
describe('checkMatch on real matches', () => {
  it.each(realMatches.map(({ mode, events }) => [mode, events]))(
    'passes a real %s match',
    (modeId, events) => {
      expect(checkMatch(submitted(getModeById(modeId), events))).toEqual([])
    }
  )

  it('covers every mode', () => {
    const modes = new Set(realMatches.map(({ mode }) => mode))
    expect([...modes].sort()).toEqual(GAME_MODES.map(({ id }) => id).sort())
  })
})

describe('checkMatch on engine-made logs', () => {
  it.each(GAME_MODES.map((mode) => [mode.id, mode]))(
    'passes a played %s match',
    (_, mode) => {
      expect(checkMatch(playedMatch(mode))).toEqual([])
    }
  )

  it('passes an untouched Gridshot match', () => {
    expect(checkMatch(gridshotWith([]))).toEqual([])
  })
})

describe('checkMatch rejects, by name', () => {
  it('a 9,999,999 log', () => {
    // 50,010 hits on targets spawned 0.6 ms apart, each hit 300 ms later.
    const count = 50_010
    const events = Array.from({ length: count }, (_, i) => {
      const t = Math.floor((i * GRIDSHOT_MS) / count) + 300
      return hit(t, t - 300)
    })
    expect(scoreEvents(gridshot, events).score).toBeGreaterThan(9_999_999)
    expect(checkMatch(gridshotWith(events))).toEqual(
      expect.arrayContaining(['spawnRate', 'clickRate', 'duration'])
    )
  })

  it('a too-fast log', () => {
    // Every hit 80 ms after its target spawned.
    const events = playedGridshot.events.map((event) =>
      event.kind === 'hit' ? { ...event, t: event.spawnedAt + 80 } : event
    )
    const sorted = [...events].sort((a, b) => a.t - b.t)
    expect(checkMatch(gridshotWith(sorted))).toEqual(['reaction'])
  })

  it('a timed match submitted too early', () => {
    const early = { ...playedGridshot, elapsedMs: 5_000 }
    expect(checkMatch(early)).toEqual(['tooEarly', 'clock'])
  })

  it('a non-ascending log', () => {
    const events = [...playedGridshot.events]
    ;[events[3], events[4]] = [events[4], events[3]]
    expect(checkMatch(gridshotWith(events))).toContain('order')
  })

  it('an event after a timed match ends', () => {
    const events = [...playedGridshot.events, miss(GRIDSHOT_MS + 1)]
    expect(checkMatch(gridshotWith(events))).toEqual(['duration'])
  })

  it('an expiry in a mode where targets never cost a life', () => {
    const events = [...playedGridshot.events, expire(GRIDSHOT_MS)]
    expect(checkMatch(gridshotWith(events))).toEqual(['expiry'])
  })

  it('the same target hit twice', () => {
    const first = playedGridshot.events.find(({ kind }) => kind === 'hit')
    const events = [...playedGridshot.events, { ...first, t: GRIDSHOT_MS }]
    expect(checkMatch(gridshotWith(events))).toEqual(['spawnRate'])
  })
})

describe('hitTiming', () => {
  const flickMatch = (events) => ({ mode: flick, events, elapsedMs: 30_000 })

  it('passes a hit just inside the lifespan', () => {
    expect(checkMatch(flickMatch([hit(1_450, 550)]))).toEqual([])
  })

  it('rejects a hit after its target expired', () => {
    // Flick targets live 0.9 s.
    expect(checkMatch(flickMatch([hit(1_500, 550)]))).toEqual(['hitTiming'])
  })

  it('rejects a hit before its target spawned', () => {
    expect(checkMatch(flickMatch([hit(1_000, 1_200)]))).toContain('hitTiming')
  })

  it("uses Survival's ramped lifespan at the target's spawn time", () => {
    // 2.6 s at the start, 1.43 s from 90 s on.
    const match = (events) => ({ mode: survival, events, elapsedMs: 200_000 })
    const end = [miss(200_000), miss(200_000), miss(200_000)]
    const misses = [miss(199_000), miss(199_000), ...end]
    expect(checkMatch(match([hit(3_500, 1_000), ...misses]))).toEqual([])
    const late = [hit(101_500, 100_000), ...misses]
    expect(checkMatch(match(late))).toEqual(['hitTiming'])
  })
})

describe('Survival', () => {
  const survivalWith = (events, elapsedMs = playedSurvival.elapsedMs) => ({
    ...playedSurvival,
    events,
    elapsedMs,
  })

  it('rejects a match that never reached the miss limit', () => {
    const events = playedSurvival.events.slice(0, -1)
    expect(checkMatch(survivalWith(events))).toEqual(['missLimit'])
  })

  it('rejects an empty log, which never ended', () => {
    expect(checkMatch(survivalWith([], 60_000))).toEqual(['missLimit'])
  })

  it('rejects events played on after the limit', () => {
    const lastT = playedSurvival.events.at(-1).t
    const events = [...playedSurvival.events, miss(lastT + 500)]
    expect(checkMatch(survivalWith(events, lastT + 500))).toEqual(['missLimit'])
  })

  it('rejects more game time than wall-clock time', () => {
    const lastT = playedSurvival.events.at(-1).t
    const tooShort = lastT - CLOCK_TOLERANCE_MS - 1
    expect(checkMatch(survivalWith(playedSurvival.events, tooShort))).toEqual([
      'clock',
    ])
  })
})
