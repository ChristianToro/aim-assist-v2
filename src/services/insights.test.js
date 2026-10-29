import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockApiFetch } = vi.hoisted(() => ({ mockApiFetch: vi.fn() }))
vi.mock('./api', () => ({ apiFetch: mockApiFetch }))

import {
  getHardwareInsight,
  getPlatformInsight,
  listHardwareInsights,
  listPlatformInsights,
} from './insights'

beforeEach(() => mockApiFetch.mockReset())

describe('getHardwareInsight', () => {
  it('posts the setup with the session token', async () => {
    await getHardwareInsight({ dpi: 800 })
    expect(mockApiFetch).toHaveBeenCalledWith('/api/insights/hardware', {
      method: 'POST',
      body: { setup: { dpi: 800 } },
      auth: true,
    })
  })

  it('sends an empty setup when none is known', async () => {
    await getHardwareInsight()
    expect(mockApiFetch.mock.calls[0][1].body).toEqual({ setup: {} })
  })
})

describe('getPlatformInsight', () => {
  it('posts with the session token and no body', async () => {
    await getPlatformInsight()
    expect(mockApiFetch).toHaveBeenCalledWith('/api/insights/platforms', {
      method: 'POST',
      auth: true,
    })
  })
})

describe('the past-answer lists', () => {
  it.each([
    [listHardwareInsights, '/api/insights/hardware'],
    [listPlatformInsights, '/api/insights/platforms'],
  ])('%o gets %s with the session token', async (list, path) => {
    const entries = [{ id: '1' }]
    mockApiFetch.mockResolvedValue({ entries })
    expect(await list()).toBe(entries)
    expect(mockApiFetch).toHaveBeenCalledWith(path, { auth: true })
  })
})
