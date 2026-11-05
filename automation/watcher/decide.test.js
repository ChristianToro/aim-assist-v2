// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { decide } from './decide.js'

// A leaderboard entry as GET /api/leaderboard returns it.
const entry = (id, uid, score, createdAt) => ({
  id,
  uid,
  displayName: `Player ${uid}`,
  photoURL: `https://example.com/${uid}.png`,
  mode: 'Speed',
  score,
  accuracy: 95,
  reactionTime: 600,
  createdAt,
})

const ana = entry(1, 'ana', 12000, '2026-11-01T10:00:00Z')
const ben = entry(2, 'ben', 9000, '2026-11-01T09:00:00Z')
const benTakes = entry(3, 'ben', 13000, '2026-11-02T12:00:00Z')
const benRaises = entry(4, 'ben', 13400, '2026-11-03T08:00:00Z')

// The state decide() saved after seeing `entries`.
const savedAfter = (entries) =>
  decide({ saved: undefined, entries, view: 'all' }).state

describe('decide', () => {
  it('seeds the first check without alerting', () => {
    const result = decide({ saved: undefined, entries: [ana], view: 'all' })
    expect(result.action).toBe('seed')
    expect(result.state.top).toMatchObject({ id: 1, uid: 'ana' })
    expect(result.event).toBeUndefined()
  })

  it('seeds an empty board as an empty top', () => {
    const result = decide({ saved: undefined, entries: [], view: 'daily' })
    expect(result).toEqual({ action: 'seed', state: { top: null } })
  })

  it('does nothing while the same score holds #1', () => {
    const saved = savedAfter([ana, ben])
    expect(decide({ saved, entries: [ana, ben], view: 'all' })).toEqual({
      action: 'none',
    })
  })

  it('does nothing while the board stays empty', () => {
    const saved = { top: null }
    expect(decide({ saved, entries: [], view: 'daily' })).toEqual({
      action: 'none',
    })
  })

  it('alerts a takeover by another player, with #1 before and #2 after', () => {
    const saved = savedAfter([ana, ben])
    const result = decide({ saved, entries: [benTakes, ana], view: 'all' })
    expect(result.action).toBe('takeover')
    expect(result.state.top.id).toBe(3)
    expect(result.event).toMatchObject({
      kind: 'takeover',
      view: 'all',
      current: { id: 3, uid: 'ben', score: 13000 },
      previous: { id: 1, uid: 'ana' },
      runnerUp: { id: 1, uid: 'ana' },
    })
  })

  it('alerts a player raising their own #1 as an extended lead', () => {
    const saved = savedAfter([benTakes, ana])
    const result = decide({ saved, entries: [benRaises, ana], view: 'all' })
    expect(result.action).toBe('extended')
    expect(result.event).toMatchObject({
      kind: 'extended',
      current: { id: 4, score: 13400 },
      previous: { id: 3, score: 13000 },
    })
  })

  it('treats an older #1 as a removal, not a takeover', () => {
    // Ben's account was deleted, so Ana's older score is #1 again.
    const saved = savedAfter([benRaises, ana])
    const result = decide({ saved, entries: [ana], view: 'all' })
    expect(result.action).toBe('removal')
    expect(result.state.top.id).toBe(1)
    expect(result.event).toBeUndefined()
  })

  it('saves an emptied board without alerting', () => {
    const saved = savedAfter([ana])
    expect(decide({ saved, entries: [], view: 'daily' })).toEqual({
      action: 'empty',
      state: { top: null },
    })
  })

  it('alerts the first #1 on an empty board with no previous holder', () => {
    const result = decide({ saved: { top: null }, entries: [ana], view: 'all' })
    expect(result.action).toBe('takeover')
    expect(result.event.previous).toBeNull()
    expect(result.event.runnerUp).toBeNull()
  })

  it("doesn't count yesterday's daily #1 as the previous holder", () => {
    const yesterday = entry(5, 'ana', 8000, '2026-11-04T22:00:00Z')
    const today = entry(6, 'ana', 3000, '2026-11-05T09:00:00Z')
    const result = decide({
      saved: savedAfter([yesterday]),
      entries: [today],
      view: 'daily',
      now: new Date('2026-11-05T09:30:00Z'),
    })
    // Same player, but a new day: a takeover of an empty board, not a raise.
    expect(result.action).toBe('takeover')
    expect(result.event.previous).toBeNull()
  })

  it('keeps only the fields an alert needs', () => {
    const { top } = savedAfter([ana])
    expect(top).not.toHaveProperty('photoURL')
    expect(Object.keys(top).sort()).toEqual([
      'accuracy',
      'createdAt',
      'displayName',
      'id',
      'mode',
      'reactionTime',
      'score',
      'uid',
    ])
  })
})
