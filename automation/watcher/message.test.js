// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { escapeMarkdown, formatDuration, plainPost } from './message.js'

const run = (overrides) => ({
  displayName: 'Ana',
  mode: 'Speed',
  score: 13125,
  accuracy: 96.296295,
  createdAt: '2026-11-02T12:00:00Z',
  ...overrides,
})

const takeover = (overrides = {}) => ({
  kind: 'takeover',
  view: 'all',
  current: run(),
  previous: run({
    displayName: 'Ben',
    mode: 'Flick',
    score: 10819,
    createdAt: '2026-11-01T05:00:00Z',
  }),
  runnerUp: null,
  ...overrides,
})

describe('plainPost', () => {
  it('describes a takeover with the previous holder and their reign', () => {
    expect(plainPost(takeover()).content).toBe(
      '**Ana** took #1 on the all-time board: 13,125 in Speed (96.3% accuracy).\n' +
        'Previous #1: Ben with 10,819 in Flick, held for 31 h.'
    )
  })

  it('describes the first #1 on a board', () => {
    const { content } = plainPost(takeover({ view: 'daily', previous: null }))
    expect(content).toBe(
      '**Ana** took #1 on the daily board: 13,125 in Speed (96.3% accuracy).\n' +
        'First #1 on this board.'
    )
  })

  it('describes a player raising their own #1', () => {
    const event = takeover({
      kind: 'extended',
      previous: run({ score: 12000 }),
    })
    expect(plainPost(event).content).toBe(
      '**Ana** raised their own #1 on the all-time board: 13,125 in Speed (96.3% accuracy), up from 12,000 in Speed.'
    )
  })

  it('never lets a name ping anyone', () => {
    const event = takeover({ current: run({ displayName: '@everyone' }) })
    expect(plainPost(event).allowed_mentions).toEqual({ parse: [] })
  })
})

describe('escapeMarkdown', () => {
  it('escapes the characters that style text or build links', () => {
    expect(
      escapeMarkdown('[click](https://x.test) **hi** _a_ ~b~ `c` |d| >e')
    ).toBe(
      '\\[click\\]\\(https://x.test\\) \\*\\*hi\\*\\* \\_a\\_ \\~b\\~ \\`c\\` \\|d\\| \\>e'
    )
  })

  it('leaves ordinary names alone', () => {
    expect(escapeMarkdown('Jean-Luc 2')).toBe('Jean-Luc 2')
  })

  it('stands in for a missing name', () => {
    expect(escapeMarkdown(null)).toBe('A player')
  })
})

describe('formatDuration', () => {
  it('uses minutes under an hour, never zero', () => {
    expect(formatDuration(20 * 1000)).toBe('1 min')
    expect(formatDuration(25 * 60 * 1000)).toBe('25 min')
  })

  it('uses hours under two days', () => {
    expect(formatDuration(31 * 60 * 60 * 1000)).toBe('31 h')
  })

  it('uses days from two days on', () => {
    expect(formatDuration(9 * 24 * 60 * 60 * 1000)).toBe('9 days')
  })
})
