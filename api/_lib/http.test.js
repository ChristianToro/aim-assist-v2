// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { badRequest, handle, json, readJson } from './http.js'
import { AuthError } from './verifier.js'

const post = (body) =>
  new Request('https://app.test/api/x', { method: 'POST', body })

const failWith = (error) =>
  handle(async () => {
    throw error
  })

describe('json', () => {
  it('forbids caching', () => {
    const response = json({ ok: true })
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
  })
})

describe('readJson', () => {
  it('parses a JSON body', async () => {
    expect(await readJson(post('{"a":1}'))).toEqual({ a: 1 })
  })

  it('turns malformed JSON into a 400', async () => {
    await expect(readJson(post('{nope'))).rejects.toMatchObject({
      status: 400,
    })
  })
})

describe('handle', () => {
  it('passes a successful response through', async () => {
    const response = await handle(async () => json({ ok: true }))(post())
    expect(await response.json()).toEqual({ ok: true })
  })

  it('answers an AuthError with a generic 401', async () => {
    const response = await failWith(new AuthError('Missing bearer token'))(
      post()
    )
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('answers an HttpError with its status, message and details', async () => {
    const error = badRequest('Invalid score', { invalid: ['score'] })
    const response = await failWith(error)(post())
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Invalid score',
      invalid: ['score'],
    })
  })

  it('rethrows unexpected errors so they surface as a 500', async () => {
    const outage = new Error('database down')
    await expect(failWith(outage)(post())).rejects.toBe(outage)
  })
})
