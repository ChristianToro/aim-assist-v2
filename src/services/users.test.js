import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockApiFetch } = vi.hoisted(() => ({ mockApiFetch: vi.fn() }))
vi.mock('./api', () => ({ apiFetch: mockApiFetch }))

import { getUserProfile } from './users'

beforeEach(() => mockApiFetch.mockReset())

describe('getUserProfile', () => {
  it('reads the signed-in profile from /api/me with the session token', async () => {
    const profile = {
      uid: 'u1',
      gamesPlayed: 3,
      highestScore: 3100,
      averageAccuracy: 80,
      favoriteMode: 'Precision',
      createdAt: '2026-10-28T00:42:18.564Z',
    }
    mockApiFetch.mockResolvedValue(profile)
    expect(await getUserProfile()).toEqual(profile)
    expect(mockApiFetch).toHaveBeenCalledWith('/api/me', { auth: true })
  })
})
