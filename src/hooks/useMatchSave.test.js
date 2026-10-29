import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../services/api'

const { mockStartMatch, mockSaveMatchResult } = vi.hoisted(() => ({
  mockStartMatch: vi.fn(),
  mockSaveMatchResult: vi.fn(),
}))
vi.mock('../services/matches', () => ({ startMatch: mockStartMatch }))
vi.mock('../services/scores', () => ({
  saveMatchResult: mockSaveMatchResult,
}))

import { useMatchSave } from './useMatchSave'

const MODE = { label: 'Flick' }
const USER = { id: 'u1' }
const EVENTS = [{ t: 900, kind: 'hit', spawnedAt: 50 }]
const ticket = (matchId) => ({ matchId, startedAt: '…', expiresAt: '…' })

const renderSave = (user = USER) =>
  renderHook(() => useMatchSave({ mode: MODE, user })).result

// Starts a round (or restarts it), then ends it with EVENTS.
const play = async (result, { restart = false } = {}) => {
  act(() => result.current.beginMatch({ restart }))
  await act(() => result.current.saveMatch(EVENTS))
}

beforeEach(() => {
  mockStartMatch.mockReset().mockResolvedValue(ticket('m1'))
  mockSaveMatchResult.mockReset().mockResolvedValue({ id: '7' })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('useMatchSave', () => {
  it("requests a ticket on Start and redeems it with the match's log", async () => {
    const result = renderSave()
    await play(result)
    expect(mockStartMatch).toHaveBeenCalledWith('Flick')
    expect(mockSaveMatchResult).toHaveBeenCalledWith({
      matchId: 'm1',
      events: EVENTS,
    })
    expect(result.current.saveStatus).toBe('saved')
  })

  it('requests and saves nothing when signed out', async () => {
    const result = renderSave(null)
    await play(result)
    expect(mockStartMatch).not.toHaveBeenCalled()
    expect(mockSaveMatchResult).not.toHaveBeenCalled()
    expect(result.current.saveStatus).toBeNull()
  })

  it("keeps the round's ticket through a Restart", async () => {
    const result = renderSave()
    act(() => result.current.beginMatch())
    await play(result, { restart: true })
    expect(mockStartMatch).toHaveBeenCalledTimes(1)
    expect(mockSaveMatchResult).toHaveBeenCalledWith(
      expect.objectContaining({ matchId: 'm1' })
    )
  })

  it('takes a fresh ticket for each new round', async () => {
    mockStartMatch
      .mockResolvedValueOnce(ticket('m1'))
      .mockResolvedValueOnce(ticket('m2'))
    const result = renderSave()
    await play(result)
    await play(result)
    expect(mockSaveMatchResult).toHaveBeenLastCalledWith(
      expect.objectContaining({ matchId: 'm2' })
    )
  })

  it('reports a match whose ticket request failed as unregistered', async () => {
    mockStartMatch.mockRejectedValue(new ApiError(429, 'Match limit reached'))
    const result = renderSave()
    await play(result)
    expect(mockSaveMatchResult).not.toHaveBeenCalled()
    expect(result.current.saveStatus).toBe('unregistered')
  })

  it('asks again on Restart after a failed ticket request', async () => {
    mockStartMatch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(ticket('m2'))
    const result = renderSave()
    await act(async () => result.current.beginMatch())
    await play(result, { restart: true })
    expect(mockStartMatch).toHaveBeenCalledTimes(2)
    expect(result.current.saveStatus).toBe('saved')
  })

  it.each([400, 404, 409, 410])(
    'reports a %i from the server as rejected',
    async (status) => {
      mockSaveMatchResult.mockRejectedValue(new ApiError(status, 'No'))
      const result = renderSave()
      await play(result)
      expect(result.current.saveStatus).toBe('rejected')
    }
  )

  it('reports a network failure or outage as an error', async () => {
    mockSaveMatchResult.mockRejectedValue(new TypeError('Failed to fetch'))
    const result = renderSave()
    await play(result)
    expect(result.current.saveStatus).toBe('error')
  })
})
