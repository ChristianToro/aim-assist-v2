import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockApiFetch } = vi.hoisted(() => ({ mockApiFetch: vi.fn() }))
vi.mock('./api', () => ({ apiFetch: mockApiFetch }))

import { getPersonalBestScores, getTopScores } from './leaderboard'

const entries = [{ id: '1', uid: 'u1', score: 900 }]

beforeEach(() => {
  mockApiFetch.mockReset()
  mockApiFetch.mockResolvedValue({ entries })
})

describe('getTopScores', () => {
  it('requests a public view and unwraps its entries', async () => {
    expect(await getTopScores('daily')).toEqual(entries)
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/api/leaderboard?view=daily',
      undefined
    )
  })

  it('defaults to the all-time board', async () => {
    await getTopScores()
    expect(mockApiFetch.mock.calls[0][0]).toBe('/api/leaderboard?view=all')
  })
})

describe('getPersonalBestScores', () => {
  it('requests the personal view with the session token', async () => {
    expect(await getPersonalBestScores()).toEqual(entries)
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/api/leaderboard?view=personal',
      { auth: true }
    )
  })
})
