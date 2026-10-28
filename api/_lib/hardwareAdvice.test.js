// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { GAME_MODES } from '../../src/game/modes.js'
import {
  ADVICE_SCHEMA,
  SYSTEM_PROMPT,
  buildPrompt,
  parseAdvice,
  parseSetup,
} from './hardwareAdvice.js'

const ADVICE = {
  summary: 'Accurate but slow to react on small targets.',
  dpi: { recommended: 800, rationale: 'Flick accuracy drops on overshoot.' },
  sensitivity: {
    recommendation: 'Pointer speed 6/11, acceleration off.',
    rationale: 'Consistent mapping helps Tracking.',
  },
  pollingRateHz: { recommended: 1000, rationale: 'Smoother tracking.' },
}

describe('parseSetup', () => {
  it('treats a missing setup as unknown values', () => {
    const unknown = { setup: { dpi: null, pollingRateHz: null } }
    expect(parseSetup({})).toEqual(unknown)
    expect(parseSetup(null)).toEqual(unknown)
  })

  it('keeps valid fields and drops unknown ones', () => {
    expect(
      parseSetup({ setup: { dpi: 1600, pollingRateHz: 500, brand: 'x' } })
    ).toEqual({ setup: { dpi: 1600, pollingRateHz: 500 } })
  })

  it('names each invalid field', () => {
    expect(parseSetup({ setup: { dpi: 50, pollingRateHz: 300 } })).toEqual({
      invalid: ['setup.dpi', 'setup.pollingRateHz'],
    })
    expect(parseSetup({ setup: { dpi: 800.5 } }).invalid).toEqual(['setup.dpi'])
    expect(parseSetup({ setup: 'fast' }).invalid).toEqual(['setup'])
  })
})

describe('SYSTEM_PROMPT', () => {
  it('describes every game mode', () => {
    for (const { label } of GAME_MODES) {
      expect(SYSTEM_PROMPT).toContain(`- ${label} (`)
    }
    expect(SYSTEM_PROMPT).toContain('endless, ends after 5 misses')
  })
})

describe('ADVICE_SCHEMA', () => {
  // Structured outputs requires both on every object in the schema.
  const objects = (schema) =>
    schema.type === 'object'
      ? [schema, ...Object.values(schema.properties).flatMap(objects)]
      : []

  it('closes every object and requires all of its properties', () => {
    for (const object of objects(ADVICE_SCHEMA)) {
      expect(object.additionalProperties).toBe(false)
      expect(object.required).toEqual(Object.keys(object.properties))
    }
  })
})

describe('buildPrompt', () => {
  it('includes the setup and the per-mode statistics', () => {
    const stats = [{ mode: 'Flick', matches: 6, averageAccuracy: 71.2 }]
    const prompt = buildPrompt(stats, {
      setup: { dpi: 800, pollingRateHz: null },
    })
    expect(prompt).toContain('{"dpi":800,"pollingRateHz":null}')
    expect(prompt).toContain('"averageAccuracy": 71.2')
  })
})

describe('parseAdvice', () => {
  it('accepts a complete answer', () => {
    expect(parseAdvice(ADVICE)).toBe(ADVICE)
  })

  it.each([
    ['a DPI out of range', { dpi: { ...ADVICE.dpi, recommended: 64_000 } }],
    ['a fractional DPI', { dpi: { ...ADVICE.dpi, recommended: 812.5 } }],
    [
      'an unlisted polling rate',
      { pollingRateHz: { ...ADVICE.pollingRateHz, recommended: 333 } },
    ],
    [
      'a blank rationale',
      { sensitivity: { ...ADVICE.sensitivity, rationale: ' ' } },
    ],
    ['a missing summary', { summary: undefined }],
  ])('rejects %s', (_, override) => {
    expect(parseAdvice({ ...ADVICE, ...override })).toBeNull()
  })

  it('rejects a non-object', () => {
    expect(parseAdvice(null)).toBeNull()
    expect(parseAdvice([])).toBeNull()
  })
})
