import { AuthError } from './verifier.js'

const BAD_REQUEST = 400

// Every response is per user or must reflect a just-saved score, so
// neither the browser nor Vercel's CDN may cache it.
const NO_STORE = { 'Cache-Control': 'private, no-store' }

// An expected client error; `details` are merged into the JSON body.
export class HttpError extends Error {
  constructor(status, message, details = {}) {
    super(message)
    this.status = status
    this.details = details
  }
}

export const badRequest = (message, details) =>
  new HttpError(BAD_REQUEST, message, details)

export const json = (body, { status = 200 } = {}) =>
  Response.json(body, { status, headers: NO_STORE })

export const readJson = async (request) => {
  try {
    return await request.json()
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
        { status: error.status }
      )
    }
    throw error
  }
}
