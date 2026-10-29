import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useLeaderboard } from './useLeaderboard'
import { getPersonalBestScores, getTopScores } from '../services/leaderboard'

vi.mock('../services/leaderboard', () => ({
  getTopScores: vi.fn(),
  getPersonalBestScores: vi.fn(),
}))

const rows = [{ id: 'a', uid: 'u1', score: 900 }]

describe('useLeaderboard', () => {
  afterEach(() => vi.clearAllMocks())

  it('loads a public board', async () => {
    getTopScores.mockResolvedValue(rows)
    const { result } = renderHook(() => useLeaderboard('weekly'))

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.entries).toEqual(rows))
    expect(getTopScores).toHaveBeenCalledWith('weekly')
  })

  it('asks for no data on the personal board without a player', () => {
    const { result } = renderHook(() => useLeaderboard('personal'))

    expect(result.current).toMatchObject({ isLoading: false, entries: [] })
    expect(getPersonalBestScores).not.toHaveBeenCalled()
  })

  it('retries a failed board on reload', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const outage = new TypeError('Failed to fetch')
    getTopScores.mockRejectedValueOnce(outage).mockResolvedValueOnce(rows)
    const { result } = renderHook(() => useLeaderboard('all'))

    await waitFor(() => expect(result.current.error).toBe(outage))

    act(() => result.current.reload())
    expect(result.current).toMatchObject({ isLoading: true, error: null })
    await waitFor(() => expect(result.current.entries).toEqual(rows))
    expect(getTopScores).toHaveBeenCalledTimes(2)
  })
})
