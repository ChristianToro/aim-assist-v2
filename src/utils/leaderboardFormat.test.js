import { describe, expect, it } from 'vitest'
import {
  boardSummary,
  formatAccuracy,
  formatDay,
  formatReactionMs,
  formatScore,
  ordinal,
} from './leaderboardFormat'

const board = [
  { uid: 'u1', displayName: 'Ada', score: 13125, mode: 'Speed' },
  { uid: 'u2', displayName: 'Lin', score: 8560, mode: 'Gridshot' },
  { uid: 'u3', displayName: null, score: 700, mode: 'Flick' },
]

describe('leaderboard figures', () => {
  it('separates thousands and fixes accuracy to one decimal', () => {
    expect(formatScore(13125)).toBe('13,125')
    expect(formatScore(0)).toBe('0')
    expect(formatAccuracy(91.25)).toBe('91.3%')
    expect(formatAccuracy(100)).toBe('100.0%')
  })

  it('rounds reaction time and keeps a missing one missing', () => {
    expect(formatReactionMs(245.4)).toBe('245')
    expect(formatReactionMs(1493)).toBe('1,493')
    expect(formatReactionMs(0)).toBe('0')
    expect(formatReactionMs(null)).toBeNull()
  })

  it('writes dates in ISO form in local time', () => {
    const local = new Date(2026, 9, 7, 23, 30)
    expect(formatDay(local.toISOString())).toBe('2026-10-07')
    expect(formatDay(null)).toBeNull()
  })

  it('writes English ordinals', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 103].map(ordinal)).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
      '22nd',
      '103rd',
    ])
  })
})

describe('boardSummary', () => {
  it('is null for an empty board', () => {
    expect(boardSummary([])).toBeNull()
  })

  it('names the leader and counts the board for a visitor', () => {
    expect(boardSummary(board)).toBe(
      'Ada leads with 13,125 in Speed. 3 players on this board.'
    )
  })

  it("gives a ranked player's standing", () => {
    expect(boardSummary(board, { uid: 'u3' })).toBe(
      "Ada leads with 13,125 in Speed. You're 3rd of 3."
    )
  })

  it('speaks to the leader directly', () => {
    expect(boardSummary(board.slice(0, 1), { uid: 'u1' })).toBe(
      'You lead with 13,125 in Speed. 1 player on this board.'
    )
  })

  it('calls an unnamed leader Anonymous', () => {
    expect(boardSummary([board[2]])).toBe(
      'Anonymous leads with 700 in Flick. 1 player on this board.'
    )
  })

  it("states a player's own best on the personal board", () => {
    expect(boardSummary(board, { personal: true, uid: 'u1' })).toBe(
      'Your best is 13,125 in Speed.'
    )
  })
})
