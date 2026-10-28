// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import Anthropic from '@anthropic-ai/sdk'
import { MODEL, createStructuredCaller } from './structuredOutput.js'

const SCHEMA = { type: 'object', properties: {}, additionalProperties: false }
const REQUEST = { system: 'You advise.', prompt: 'Advise me.', schema: SCHEMA }

// A stand-in for the SDK client: only the one method the caller uses.
const fakeClient = (create) => ({ beta: { messages: { create } } })

const reply = ({
  text = '{"ok":true}',
  stopReason = 'end_turn',
  model = MODEL,
} = {}) =>
  vi.fn().mockResolvedValue({
    model,
    stop_reason: stopReason,
    content: [
      { type: 'thinking', thinking: '' },
      { type: 'text', text },
    ],
  })

describe('createStructuredCaller', () => {
  it('returns the parsed JSON and the model that answered', async () => {
    const ask = createStructuredCaller(fakeClient(reply()))
    expect(await ask(REQUEST)).toEqual({ data: { ok: true }, model: MODEL })
  })

  it('reports a fallback model when one answered', async () => {
    const ask = createStructuredCaller(
      fakeClient(reply({ model: 'claude-opus-4-8' }))
    )
    expect((await ask(REQUEST)).model).toBe('claude-opus-4-8')
  })

  it('requests JSON output, explicit effort and server-side fallbacks', async () => {
    const create = reply()
    await createStructuredCaller(fakeClient(create))(REQUEST)
    const [params] = create.mock.calls[0]
    expect(params).toMatchObject({
      model: MODEL,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: SCHEMA },
      },
      system: 'You advise.',
      messages: [{ role: 'user', content: 'Advise me.' }],
    })
    expect(params).not.toHaveProperty('thinking')
  })

  it.each(['refusal', 'max_tokens'])(
    'answers a %s stop with a 502',
    async (stopReason) => {
      const ask = createStructuredCaller(fakeClient(reply({ stopReason })))
      await expect(ask(REQUEST)).rejects.toMatchObject({
        status: 502,
        details: { reason: stopReason },
      })
    }
  )

  it('answers unparseable text with a 502', async () => {
    const ask = createStructuredCaller(fakeClient(reply({ text: '{oops' })))
    await expect(ask(REQUEST)).rejects.toMatchObject({
      status: 502,
      details: { reason: 'unparseable' },
    })
  })

  it.each([
    [
      'an overload',
      Anthropic.APIError.generate(529, {}, 'Overloaded', new Headers()),
    ],
    [
      'a rate limit',
      Anthropic.APIError.generate(429, {}, 'Slow down', new Headers()),
    ],
    [
      'a lost connection',
      new Anthropic.APIConnectionError({ message: 'reset' }),
    ],
  ])('turns %s into a 503 with Retry-After', async (_, error) => {
    const ask = createStructuredCaller(
      fakeClient(vi.fn().mockRejectedValue(error))
    )
    await expect(ask(REQUEST)).rejects.toMatchObject({
      status: 503,
      headers: { 'Retry-After': '30' },
    })
  })

  it('lets a non-transient API error through as a server error', async () => {
    const badRequest = Anthropic.APIError.generate(
      400,
      {},
      'Bad request',
      new Headers()
    )
    const ask = createStructuredCaller(
      fakeClient(vi.fn().mockRejectedValue(badRequest))
    )
    await expect(ask(REQUEST)).rejects.toBe(badRequest)
  })
})
