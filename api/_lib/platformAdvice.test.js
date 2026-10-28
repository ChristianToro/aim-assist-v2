// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { GAME_MODES } from '../../src/game/modes.js'
import {
  ADVICE_SCHEMA,
  SYSTEM_PROMPT,
  buildPrompt,
  parseAdvice,
} from './platformAdvice.js'

const pick = (title, platforms = ['PC']) => ({
  title,
  genre: 'Hero shooter',
  platforms,
  fit: 'Your 66% Tracking suits sustained fights.',
})

const ADVICE = {
  summary: 'A strong tracker with slower flicks.',
  picks: [pick('Apex Legends'), pick('Overwatch 2'), pick('The Finals')],
  avoidForNow: 'Tactical shooters, until Flick accuracy improves.',
}

const withPicks = (picks) => ({ ...ADVICE, picks })

describe('SYSTEM_PROMPT', () => {
  it('describes every game mode', () => {
    for (const { label } of GAME_MODES) {
      expect(SYSTEM_PROMPT).toContain(`- ${label} (`)
    }
  })
})

describe('ADVICE_SCHEMA', () => {
  // Structured outputs requires both on every object, nested ones included.
  const objects = (schema) => {
    if (schema.type === 'array') return objects(schema.items)
    if (schema.type !== 'object') return []
    return [schema, ...Object.values(schema.properties).flatMap(objects)]
  }

  it('closes every object and requires all of its properties', () => {
    const found = objects(ADVICE_SCHEMA)
    expect(found).toHaveLength(2)
    for (const object of found) {
      expect(object.additionalProperties).toBe(false)
      expect(object.required).toEqual(Object.keys(object.properties))
    }
  })
})

describe('buildPrompt', () => {
  it('includes the per-mode statistics', () => {
    const prompt = buildPrompt([{ mode: 'Tracking', averageAccuracy: 66 }])
    expect(prompt).toContain('"mode": "Tracking"')
  })
})

describe('parseAdvice', () => {
  it('accepts 3 to 5 valid picks', () => {
    expect(parseAdvice(ADVICE)).toBe(ADVICE)
    const five = ['A', 'B', 'C', 'D', 'E'].map((title) => pick(title))
    expect(parseAdvice(withPicks(five))).not.toBeNull()
  })

  it('accepts several platforms per pick', () => {
    const multi = [
      pick('A', ['PC', 'PlayStation', 'Xbox']),
      pick('B'),
      pick('C'),
    ]
    expect(parseAdvice(withPicks(multi))).not.toBeNull()
  })

  it.each([
    ['too few picks', withPicks(ADVICE.picks.slice(0, 2))],
    [
      'too many picks',
      withPicks(['A', 'B', 'C', 'D', 'E', 'F'].map((title) => pick(title))),
    ],
    [
      'a repeated title, ignoring case',
      withPicks([pick('Apex Legends'), pick('apex legends '), pick('C')]),
    ],
    [
      'a pick with no platforms',
      withPicks([pick('A', []), pick('B'), pick('C')]),
    ],
    [
      'an unknown platform',
      withPicks([pick('A', ['Dreamcast']), pick('B'), pick('C')]),
    ],
    [
      'a repeated platform',
      withPicks([pick('A', ['PC', 'PC']), pick('B'), pick('C')]),
    ],
    [
      'a blank fit',
      withPicks([{ ...pick('A'), fit: '' }, pick('B'), pick('C')]),
    ],
    ['a missing avoidForNow', { ...ADVICE, avoidForNow: undefined }],
    ['a non-object', null],
  ])('rejects %s', (_, data) => {
    expect(parseAdvice(data)).toBeNull()
  })
})
