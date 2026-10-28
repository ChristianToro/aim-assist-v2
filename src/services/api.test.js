import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockGetAuthToken } = vi.hoisted(() => ({ mockGetAuthToken: vi.fn() }))
vi.mock('./auth', () => ({ getAuthToken: mockGetAuthToken }))

import { ApiError, apiFetch } from './api'

const respond = (status, body) =>
  vi
    .fn()
    .mockResolvedValue(
      new Response(body === undefined ? null : JSON.stringify(body), { status })
    )

beforeEach(() => {
  mockGetAuthToken.mockReset()
  vi.unstubAllGlobals()
})

describe('apiFetch', () => {
  it('returns the parsed JSON of a successful response', async () => {
    const fetch = respond(200, { entries: [] })
    vi.stubGlobal('fetch', fetch)
    expect(await apiFetch('/api/leaderboard')).toEqual({ entries: [] })
    const [path, init] = fetch.mock.calls[0]
    expect(path).toBe('/api/leaderboard')
    expect(init.method).toBe('GET')
    expect(init.headers).toEqual({})
  })

  it('sends the session JWT as a Bearer token when auth is set', async () => {
    mockGetAuthToken.mockResolvedValue('header.payload.signature')
    const fetch = respond(200, { uid: 'u1' })
    vi.stubGlobal('fetch', fetch)
    await apiFetch('/api/me', { auth: true })
    expect(fetch.mock.calls[0][1].headers).toEqual({
      Authorization: 'Bearer header.payload.signature',
    })
  })

  it('fails with a 401 before any request when signed out', async () => {
    mockGetAuthToken.mockResolvedValue(null)
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    await expect(apiFetch('/api/me', { auth: true })).rejects.toMatchObject({
      status: 401,
    })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('sends a body as JSON', async () => {
    const fetch = respond(201, { id: '1' })
    vi.stubGlobal('fetch', fetch)
    await apiFetch('/api/scores', { method: 'POST', body: { score: 5 } })
    const [, init] = fetch.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(init.body).toBe('{"score":5}')
  })

  it('turns an error response into an ApiError with its status and message', async () => {
    vi.stubGlobal('fetch', respond(400, { error: 'Unknown view' }))
    const error = await apiFetch('/api/leaderboard?view=x').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 400, message: 'Unknown view' })
  })

  it('still reports the status when an error response has no JSON body', async () => {
    vi.stubGlobal('fetch', respond(500))
    await expect(apiFetch('/api/me')).rejects.toMatchObject({
      status: 500,
      message: 'Request failed (500)',
    })
  })

  it('lets a network failure through unchanged', async () => {
    const offline = new TypeError('Failed to fetch')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(offline))
    await expect(apiFetch('/api/me')).rejects.toBe(offline)
  })
})
