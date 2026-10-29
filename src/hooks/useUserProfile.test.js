import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useUserProfile } from './useUserProfile'
import { getUserProfile } from '../services/users'

vi.mock('../services/users', () => ({ getUserProfile: vi.fn() }))

const PROFILE = { gamesPlayed: 3, highestScore: 900 }

describe('useUserProfile', () => {
  afterEach(() => vi.clearAllMocks())

  it("loads the signed-in player's profile", async () => {
    getUserProfile.mockResolvedValue(PROFILE)
    const { result } = renderHook(() => useUserProfile('u1'))

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.profile).toEqual(PROFILE))
  })

  it('retries a failed load on reload', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const outage = new TypeError('Failed to fetch')
    getUserProfile.mockRejectedValueOnce(outage).mockResolvedValueOnce(PROFILE)
    const { result } = renderHook(() => useUserProfile('u1'))

    await waitFor(() => expect(result.current.error).toBe(outage))

    act(() => result.current.reload())
    expect(result.current).toMatchObject({ isLoading: true, error: null })
    await waitFor(() => expect(result.current.profile).toEqual(PROFILE))
  })
})
