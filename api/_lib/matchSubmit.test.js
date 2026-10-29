// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { getModeById } from '../../src/game/modes.js'
import { scoreEvents } from '../../src/game/scoring.js'
import realMatches from './fixtures/real-matches.json'
import { submitMatch } from './matchSubmit.js'

const UID = '00000000-0000-4000-8000-000000000001'
const MATCH_ID = '6f1c2a9e-3b4d-4e5f-8a6b-7c8d9e0f1a2b'
const flick = realMatches.find(({ mode }) => mode === 'flick').events

// In-memory stand-ins for the two stores, around one stored match.
const createFakeStores = (match) => {
  const saved = []
  return {
    saved,
    stores: {
      matchStore: { find: async () => match },
      scoreStore: {
        insertForMatch: async (uid, matchId, figures) => {
          if (match.claimed) return null
          saved.push({ uid, matchId, ...figures })
          return { id: '7', createdAt: '2026-10-29T12:00:31Z' }
        },
      },
    },
  }
}

const openMatch = (overrides = {}) => ({
  mode: 'Flick',
  elapsedMs: 31_000,
  submitted: false,
  expired: false,
  ...overrides,
})

const submit = (stores, events = flick) =>
  submitMatch(stores, { uid: UID, matchId: MATCH_ID, events })

describe('submitMatch', () => {
  it("stores the server's own figures for a real match", async () => {
    const { stores, saved } = createFakeStores(openMatch())
    const expected = scoreEvents(getModeById('flick'), flick)
    const result = await submit(stores)
    expect(result).toEqual({
      id: '7',
      createdAt: '2026-10-29T12:00:31Z',
      score: expected.score,
      accuracy: expected.accuracy,
      reactionTime: expected.averageReactionMs,
    })
    expect(saved).toEqual([
      {
        uid: UID,
        matchId: MATCH_ID,
        score: expected.score,
        accuracy: expected.accuracy,
        reactionTime: expected.averageReactionMs,
      },
    ])
  })

  it("scores the log under the match's mode, not one the client names", async () => {
    // A Speed match's targets are worth 150, so the same log scores more.
    const { stores, saved } = createFakeStores(openMatch({ mode: 'Speed' }))
    const speedLog = realMatches.find(({ mode }) => mode === 'speed').events
    await submit(stores, speedLog)
    expect(saved[0].score).toBe(
      scoreEvents(getModeById('speed'), speedLog).score
    )
  })

  it.each([
    ['an unknown or foreign match', null, 404, 'Match not found'],
    [
      'a match already submitted',
      openMatch({ submitted: true }),
      409,
      'Match already submitted',
    ],
    ['an expired match', openMatch({ expired: true }), 410, 'Match expired'],
  ])('refuses %s', async (_, match, status, message) => {
    const { stores, saved } = createFakeStores(match)
    await expect(submit(stores)).rejects.toMatchObject({ status, message })
    expect(saved).toHaveLength(0)
  })

  it('refuses an implausible log by rule name, saving nothing', async () => {
    const { stores, saved } = createFakeStores(openMatch())
    // Extra hits: every hit logged twice, as if each target were hit again.
    const padded = flick.flatMap((event) =>
      event.kind === 'hit' ? [event, event] : [event]
    )
    await expect(submit(stores, padded)).rejects.toMatchObject({
      status: 400,
      message: 'Implausible match',
      details: { invalid: ['spawnRate'] },
    })
    expect(saved).toHaveLength(0)
  })

  it('refuses a timed match submitted too soon after it started', async () => {
    const { stores } = createFakeStores(openMatch({ elapsedMs: 5_000 }))
    await expect(submit(stores)).rejects.toMatchObject({
      status: 400,
      details: { invalid: ['tooEarly', 'clock'] },
    })
  })

  it('loses a race for the same match with a 409', async () => {
    const { stores } = createFakeStores(openMatch({ claimed: true }))
    await expect(submit(stores)).rejects.toMatchObject({ status: 409 })
  })
})
