// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { alertPost, label } from './alert.js'

const run = (overrides) => ({
  displayName: 'Ana',
  mode: 'Speed',
  score: 13125,
  accuracy: 96.3,
  createdAt: '2026-11-02T12:00:00Z',
  ...overrides,
})

const event = (overrides = {}) => ({
  kind: 'takeover',
  view: 'all',
  current: run(),
  previous: null,
  runnerUp: null,
  ...overrides,
})

const verdict = (overrides = {}) => ({
  label: 'celebrate',
  confidence: 0.9,
  reasons: ['Well within the Speed ceiling.'],
  message: '{player} takes #1: 13,125 in Speed!',
  ...overrides,
})

const FLAG = 'Average reaction time is 120 ms.'

describe('label', () => {
  it('celebrates only when no rule fired and Claude agrees', () => {
    expect(label([], verdict())).toBe('celebrate')
    expect(label([], null)).toBe('celebrate')
  })

  it('reviews when Claude says so', () => {
    expect(label([], verdict({ label: 'review' }))).toBe('review')
  })

  it('reviews on any rule flag, whatever Claude says', () => {
    expect(label([FLAG], verdict())).toBe('review')
    expect(label([FLAG], null)).toBe('review')
  })
})

describe('alertPost', () => {
  it("announces with Claude's message and the escaped name filled in", () => {
    const post = alertPost({
      event: event({ current: run({ displayName: 'A_na' }) }),
      flags: [],
      verdict: verdict(),
    })
    expect(post).toEqual({
      label: 'celebrate',
      payload: {
        content: '**A\\_na** takes #1: 13,125 in Speed!',
        allowed_mentions: { parse: [] },
      },
    })
  })

  it('falls back to the plain post when Claude failed', () => {
    const post = alertPost({ event: event(), flags: [], verdict: null })
    expect(post.label).toBe('celebrate')
    expect(post.payload.content).toBe(
      '**Ana** took #1 on the all-time board: 13,125 in Speed (96.3% accuracy).\nFirst #1 on this board.'
    )
  })

  it('sends mods the facts, the rule flags and Claude’s reasons', () => {
    const post = alertPost({
      event: event({ view: 'fixture' }),
      flags: [FLAG],
      verdict: verdict({ label: 'review', reasons: ['Far above #2.'] }),
    })
    expect(post.label).toBe('review')
    expect(post.payload.content).toBe(
      [
        '**Review:** **Ana** took #1 on the fixture board: 13,125 in Speed (96.3% accuracy).',
        'First #1 on this board.',
        `- Rule: ${FLAG}`,
        '- Far above #2.',
        '_Claude: review (confidence 0.90)_',
      ].join('\n')
    )
  })

  it('says when the rules alone flagged it', () => {
    const post = alertPost({ event: event(), flags: [FLAG], verdict: null })
    expect(post.payload.content).toContain(
      '_Claude was unavailable: flagged by the rules alone._'
    )
  })
})
