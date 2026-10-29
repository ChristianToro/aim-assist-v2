import { AuthError } from './verifier.js'

const BAD_REQUEST = 400
const PAYLOAD_TOO_LARGE = 413

// Every JSON body today is a few hundred bytes. A route that takes more
// (a match's event log) passes its own limit to readJson.
const DEFAULT_MAX_BODY_BYTES = 16 * 1024

// Every response is per user or must reflect a just-saved score, so
// neither the browser nor Vercel's CDN may cache it.
const NO_STORE = { 'Cache-Control': 'private, no-store' }

// An expected failure; `details` are merged into the JSON body and
// `headers` (e.g. Retry-After) are added to the response.
export class HttpError extends Error {
  constructor(status, message, details = {}, headers = {}) {
    super(message)
    this.status = status
    this.details = details
    this.headers = headers
  }
}

export const badRequest = (message, details) =>
  new HttpError(BAD_REQUEST, message, details)

export const json = (body, { status = 200, headers = {} } = {}) =>
  Response.json(body, { status, headers: { ...headers, ...NO_STORE } })

const tooLarge = (maxBytes) =>
  new HttpError(PAYLOAD_TOO_LARGE, 'Body too large', { maxBytes })

// Parses a JSON body of at most maxBytes. A declared Content-Length over
// the limit is refused before reading; the bytes read are checked too,
// since the header can be absent (chunked) or wrong.
export const readJson = async (
  request,
  { maxBytes = DEFAULT_MAX_BODY_BYTES } = {}
) => {
  if (Number(request.headers.get('content-length')) > maxBytes) {
    throw tooLarge(maxBytes)
  }
  const body = await request.arrayBuffer()
  if (body.byteLength > maxBytes) throw tooLarge(maxBytes)
  try {
    return JSON.parse(new TextDecoder().decode(body))
  } catch {
    throw badRequest('Body must be valid JSON')
  }
}

/*
 * Wraps a route handler so expected failures become JSON responses: an
 * AuthError is a 401 and an HttpError carries its own status. Anything
 * else is a bug or an outage, so it propagates and Vercel answers 500.
 */
export const handle = (handler) => async (request) => {
  try {
    return await handler(request)
  } catch (error) {
    if (error instanceof AuthError) {
      return json({ error: 'Unauthorized' }, { status: error.status })
    }
    if (error instanceof HttpError) {
      return json(
        { error: error.message, ...error.details },
        { status: error.status, headers: error.headers }
      )
    }
    throw error
  }
}
