import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockApiFetch } = vi.hoisted(() => ({ mockApiFetch: vi.fn() }))
vi.mock('./api', () => ({ apiFetch: mockApiFetch }))

import { getHardwareInsight, getPlatformInsight } from './insights'

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
