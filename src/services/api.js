import { getAuthToken } from './auth'

const UNAUTHORIZED = 401

// A non-2xx answer from /api. `status` lets the UI word the failure; a
// network failure stays a TypeError from fetch and has no status.
export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const authHeader = async () => {
  const token = await getAuthToken()
  if (!token) throw new ApiError(UNAUTHORIZED, 'Not signed in')
  return { Authorization: `Bearer ${token}` }
}

/*
 * The one place the browser calls /api. With `auth`, the session's JWT is
 * sent as a Bearer token (the server takes identity from it alone); a
 * signed-out caller fails here without a request. `body` is sent as JSON.
 */
export const apiFetch = async (path, { method = 'GET', body, auth } = {}) => {
  const headers = {
    ...(auth && (await authHeader())),
    ...(body !== undefined && { 'Content-Type': 'application/json' }),
  }
  const response = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error ?? `Request failed (${response.status})`
    )
  }
  return payload
}
