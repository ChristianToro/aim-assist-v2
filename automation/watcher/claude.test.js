// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  MODEL,
  SYSTEM_PROMPT,
  VERDICT_SCHEMA,
  claudeInput,
  claudeRequest,
  parseVerdict,
} from './claude.js'

const run = (overrides) => ({
  id: '23',
  uid: 'secret-uid',
  displayName: 'Ana',
  mode: 'Speed',
  score: 13125,
  accuracy: 96.296295,
  reactionTime: 977,
  createdAt: '2026-11-02T12:00:00Z',
  ...overrides,
})

const event = {
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
}

// A Messages API response whose text block holds `verdict`.
const response = (verdict, stopReason = 'end_turn') => ({
  stop_reason: stopReason,
  content: [
    { type: 'thinking', thinking: '' },
    { type: 'text', text: JSON.stringify(verdict) },
  ],
})

const verdict = {
  label: 'celebrate',
  confidence: 0.9,
  reasons: ['66% of the Speed ceiling is within reach.'],
  message: '{player} takes #1 with 13,125 in Speed at 96.3% accuracy!',
}

describe('claudeInput', () => {
  it('sends figures only: no names, ids or photos', () => {
    const input = claudeInput(event, [])
    const text = JSON.stringify(input)
    for (const secret of ['Ana', 'Ben', 'secret-uid', '"23"']) {
      expect(text).not.toContain(secret)
    }
    expect(input).toEqual({
      board: 'all',
      new: {
        mode: 'Speed',
        score: 13125,
        accuracy: 96.3,
        reactionMs: 977,
        pctOfModeCeiling: 66,
      },
      previous: {
        mode: 'Flick',
        score: 10819,
        accuracy: 96.3,
        reactionMs: 977,
        pctOfModeCeiling: 80,
        heldForHours: 31,
      },
      runnerUp: null,
      samePlayer: false,
      ruleFlags: [],
    })
  })

  it('marks a player raising their own #1', () => {
    expect(claudeInput({ ...event, kind: 'extended' }, []).samePlayer).toBe(
      true
    )
  })
})

describe('claudeRequest', () => {
  it('asks the model for a schema-shaped verdict at low effort', () => {
    const body = claudeRequest({ board: 'all' })
    expect(body).toMatchObject({
      model: MODEL,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: expect.stringContaining('"all"') }],
      output_config: {
        effort: 'low',
        format: { type: 'json_schema', schema: VERDICT_SCHEMA },
      },
    })
    // API version 2026-10-21 rejects sampling parameters.
    expect(body).not.toHaveProperty('temperature')
  })

  it("states the rules' thresholds as flags.js sets them", () => {
    expect(SYSTEM_PROMPT).toContain(
      'a score at 90% of the ceiling or more, an average reaction under 150 ms, and a lead of 50% or more over #2 in the same mode'
    )
  })

  it('lists every game mode in the prompt', () => {
    for (const mode of ['Gridshot', 'Precision', 'Speed', 'Flick']) {
      expect(SYSTEM_PROMPT).toContain(`- ${mode} (`)
    }
  })
})

describe('parseVerdict', () => {
  it('reads the verdict from the text block', () => {
    expect(parseVerdict(response(verdict))).toEqual(verdict)
  })

  it('applies the limits the schema cannot carry', () => {
    const long = {
      ...verdict,
      confidence: 1.7,
      reasons: ['a', 'b', 'c', 'd'],
      message: 'x'.repeat(400),
    }
    const parsed = parseVerdict(response(long))
    expect(parsed.confidence).toBe(1)
    expect(parsed.reasons).toEqual(['a', 'b', 'c'])
    expect(parsed.message).toHaveLength(280)
  })

  it('trusts nothing from a refusal or a cut-off answer', () => {
    expect(parseVerdict(response(verdict, 'refusal'))).toBeNull()
    expect(parseVerdict(response(verdict, 'max_tokens'))).toBeNull()
  })

  it('rejects text that is not a valid verdict', () => {
    expect(parseVerdict(response({ ...verdict, label: 'ban' }))).toBeNull()
    expect(parseVerdict(response({ ...verdict, reasons: [1] }))).toBeNull()
    const notJson = {
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: '{' }],
    }
    expect(parseVerdict(notJson)).toBeNull()
  })

  it('handles a missing or error response body', () => {
    expect(parseVerdict(undefined)).toBeNull()
    expect(
      parseVerdict({ type: 'error', error: { type: 'overloaded_error' } })
    ).toBeNull()
  })
})
