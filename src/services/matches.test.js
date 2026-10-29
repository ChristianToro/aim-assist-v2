import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockApiFetch } = vi.hoisted(() => ({ mockApiFetch: vi.fn() }))
vi.mock('./api', () => ({ apiFetch: mockApiFetch }))

import { startMatch } from './matches'

beforeEach(() => mockApiFetch.mockReset())

describe('startMatch', () => {
  it('posts the mode label with the session token', async () => {
    const issued = { matchId: 'b3f1…', startedAt: '…', expiresAt: '…' }
    mockApiFetch.mockResolvedValue(issued)
    await expect(startMatch('Flick')).resolves.toEqual(issued)
    expect(mockApiFetch).toHaveBeenCalledWith('/api/matches', {
      method: 'POST',
      body: { mode: 'Flick' },
      auth: true,
    })
  })
})
