// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { MAX_EVENTS, parseScoreSubmission } from './scoreInput.js'

const MATCH_ID = '6f1c2a9e-3b4d-4e5f-8a6b-7c8d9e0f1a2b'
const EVENTS = [
  { t: 900, kind: 'hit', spawnedAt: 50 },
  { t: 1200, kind: 'miss' },
  { t: 2000, kind: 'expire' },
]
const VALID = { matchId: MATCH_ID, events: EVENTS }

const invalidFields = (overrides) =>
  parseScoreSubmission({ ...VALID, ...overrides }).invalid

const withEvent = (event) => invalidFields({ events: [...EVENTS, event] })

describe('parseScoreSubmission', () => {
  it('accepts a match id and its event log', () => {
    expect(parseScoreSubmission(VALID)).toEqual({ submission: VALID })
  })

  it('ignores a score, a uid or any other key', () => {
    const body = { ...VALID, score: 9_999_999, uid: 'someone-else' }
    expect(parseScoreSubmission(body)).toEqual({ submission: VALID })
  })

  it("drops an event's unknown fields, and a non-hit's spawnedAt", () => {
    const events = [
      { t: 900, kind: 'hit', spawnedAt: 50, points: 5000 },
      { t: 1200, kind: 'miss', spawnedAt: 1100 },
    ]
    const { submission } = parseScoreSubmission({ ...VALID, events })
    expect(submission.events).toEqual([
      { t: 900, kind: 'hit', spawnedAt: 50 },
      { t: 1200, kind: 'miss' },
    ])
  })

  it('lowercases the match id', () => {
    const { submission } = parseScoreSubmission({
      ...VALID,
      matchId: MATCH_ID.toUpperCase(),
    })
    expect(submission.matchId).toBe(MATCH_ID)
  })

  it('accepts an empty log', () => {
    expect(invalidFields({ events: [] })).toBeUndefined()
  })

  it('rejects a match id that is not a uuid', () => {
    for (const matchId of [undefined, 42, 'match-1', `${MATCH_ID}x`]) {
      expect(invalidFields({ matchId })).toEqual(['matchId'])
    }
  })

  it('rejects events that are not an array or are too many', () => {
    const tooMany = Array.from({ length: MAX_EVENTS + 1 }, (_, t) => ({
      t,
      kind: 'miss',
    }))
    for (const events of [undefined, {}, 'hits', tooMany]) {
      expect(invalidFields({ events })).toEqual(['events'])
    }
  })

  it('rejects an event of an unknown kind or with a bad time', () => {
    for (const event of [
      null,
      { t: 3000, kind: 'headshot' },
      { t: -1, kind: 'miss' },
      { t: 3000.5, kind: 'miss' },
      { t: '3000', kind: 'miss' },
      { t: 2 * 60 * 60 * 1000 + 1, kind: 'miss' },
    ]) {
      expect(withEvent(event)).toEqual(['events'])
    }
  })

  it('requires a whole-ms spawnedAt on a hit', () => {
    for (const spawnedAt of [undefined, -5, 10.5, null]) {
      expect(withEvent({ t: 3000, kind: 'hit', spawnedAt })).toEqual(['events'])
    }
  })

  it("rejects the old client's body, which posted its own score", () => {
    const old = { mode: 'Gridshot', score: 4200, accuracy: 87.5 }
    expect(parseScoreSubmission(old).invalid).toEqual(['matchId', 'events'])
  })

  it('rejects a body that is not an object', () => {
    for (const body of [null, [], 'score', 42]) {
      expect(parseScoreSubmission(body).invalid).toEqual(['matchId', 'events'])
    }
  })
})
