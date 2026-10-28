import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockApiFetch } = vi.hoisted(() => ({ mockApiFetch: vi.fn() }))
vi.mock('./api', () => ({ apiFetch: mockApiFetch }))

import { saveMatchResult, toScoreSubmission } from './scores'

// A ScoreManager.summary(), with the fields the server doesn't store.
const summary = {
  score: 4200,
  hits: 40,
  misses: 6,
  combo: 3,
  maxCombo: 18,
  multiplier: 1.3,
  accuracy: 86.95652173913044,
  averageReactionMs: 412,
  bestReactionMs: 201,
  worstReactionMs: 903,
}

beforeEach(() => mockApiFetch.mockReset())

describe('toScoreSubmission', () => {
  it('keeps only the fields the server validates', () => {
    expect(toScoreSubmission('Gridshot', summary)).toEqual({
      mode: 'Gridshot',
      score: 4200,
      accuracy: 86.95652173913044,
      reactionTime: 412,
    })
  })

  it('passes a null reaction time through for a match with no hits', () => {
    const noHits = { ...summary, averageReactionMs: null }
    expect(toScoreSubmission('Flick', noHits).reactionTime).toBeNull()
  })
})

describe('saveMatchResult', () => {
  it('posts the submission with the session token', async () => {
    mockApiFetch.mockResolvedValue({ id: '7', createdAt: '…' })
    await saveMatchResult({ mode: 'Gridshot', summary })
    expect(mockApiFetch).toHaveBeenCalledWith('/api/scores', {
      method: 'POST',
      body: toScoreSubmission('Gridshot', summary),
      auth: true,
    })
  })
})
