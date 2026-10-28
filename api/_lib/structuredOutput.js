import Anthropic from '@anthropic-ai/sdk'
import { HttpError } from './http.js'

export const MODEL = 'claude-opus-5-5'

// Plenty for a short JSON answer plus the model's own thinking, and small
// enough that a non-streaming request stays well inside its timeout.
const MAX_TOKENS = 16000
// On a policy refusal the API re-runs the request on a fallback model it
// picks by refusal category, inside the same call.
const FALLBACK_BETA = 'server-side-fallback-2026-07-01'

const BAD_GATEWAY = 502
const SERVICE_UNAVAILABLE = 503
const SERVER_ERROR = 500

// Anthropic being overloaded or unreachable is temporary, so the caller
// gets a 503 to retry; any other API error (a bad request, a bad key) is
// our bug and propagates as a 500.
const isTransient = (error) =>
  error instanceof Anthropic.RateLimitError ||
  error instanceof Anthropic.APIConnectionError ||
  (error instanceof Anthropic.APIError && error.status >= SERVER_ERROR)

const noAnswer = (reason) =>
  new HttpError(BAD_GATEWAY, 'No recommendation was produced', { reason })

const parseText = (response) => {
  const text = response.content.find((block) => block.type === 'text')?.text
  try {
    return JSON.parse(text)
  } catch {
    throw noAnswer('unparseable')
  }
}

/*
 * Asks Claude for one JSON object matching `schema` (structured outputs)
 * and resolves to { data, model }. `model` is whichever model answered:
 * the requested one, or a fallback after a refusal. Built on an injected
 * client so tests can pass a fake; claude.js wires the real one.
 *
 * Opus 5.5 always thinks adaptively, so `thinking` is omitted and `effort`
 * is the depth control (set explicitly: its default is 'medium').
 */
export const createStructuredCaller =
  (client) =>
  async ({ system, prompt, schema, effort = 'medium' }) => {
    let response
    try {
      response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        betas: [FALLBACK_BETA],
        fallbacks: 'default',
        output_config: { effort, format: { type: 'json_schema', schema } },
        system,
        messages: [{ role: 'user', content: prompt }],
      })
    } catch (error) {
      if (!isTransient(error)) throw error
      throw new HttpError(
        SERVICE_UNAVAILABLE,
        'The recommendation service is busy. Try again shortly.',
        {},
        { 'Retry-After': '30' }
      )
    }

    // A refusal here means the fallback chain declined too; max_tokens
    // means the JSON was cut off. Neither leaves a usable answer.
    if (response.stop_reason !== 'end_turn') {
      throw noAnswer(response.stop_reason)
    }
    return { data: parseText(response), model: response.model }
  }
