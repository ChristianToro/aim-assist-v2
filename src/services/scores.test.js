import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockApiFetch } = vi.hoisted(() => ({ mockApiFetch: vi.fn() }))
vi.mock('./api', () => ({ apiFetch: mockApiFetch }))

import { saveMatchResult, toScoreSubmission } from './scores'

const MATCH_ID = '6f1c2a9e-3b4d-4e5f-8a6b-7c8d9e0f1a2b'
const EVENTS = [
  { t: 900, kind: 'hit', spawnedAt: 50 },
  { t: 1200, kind: 'miss' },
]

beforeEach(() => mockApiFetch.mockReset())

describe('toScoreSubmission', () => {
  it('sends the ticket and the log, never a score', () => {
    expect(toScoreSubmission(MATCH_ID, EVENTS)).toEqual({
      matchId: MATCH_ID,
      events: EVENTS,
    })
  })
})

describe('saveMatchResult', () => {
  it('posts the submission with the session token', async () => {
    const stored = { id: '7', createdAt: '…', score: 100 }
    mockApiFetch.mockResolvedValue(stored)
    await expect(
      saveMatchResult({ matchId: MATCH_ID, events: EVENTS })
    ).resolves.toEqual(stored)
    expect(mockApiFetch).toHaveBeenCalledWith('/api/scores', {
      method: 'POST',
      body: toScoreSubmission(MATCH_ID, EVENTS),
      auth: true,
    })
  })
})
