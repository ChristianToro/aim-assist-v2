/*
 * When to retry a Discord webhook post (PLAN-AUTOMATION.md): only after a
 * 429, once, after the wait Discord asks for. A wait past MAX_WAIT_MS isn't
 * worth holding the flow for: the alert is tried at the next check.
 */

const TOO_MANY_REQUESTS = 429
const MS_PER_SECOND = 1000
export const MAX_WAIT_MS = 60 * MS_PER_SECOND
// When Discord gives no usable wait.
const DEFAULT_WAIT_MS = 5 * MS_PER_SECOND

const parseJson = (text) => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

// Discord gives the wait in seconds, as `retry_after` in the JSON body and
// as the Retry-After header.
const waitSeconds = (headers, payload) => {
  const body = typeof payload === 'string' ? parseJson(payload) : payload
  const seconds = Number(body?.retry_after ?? headers?.['retry-after'])
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null
}

// Milliseconds to wait before retrying the post that got this response
// (Node-RED's msg after an http request node), or null not to retry now.
export const retryDelayMs = ({ statusCode, headers, payload }) => {
  if (statusCode !== TOO_MANY_REQUESTS) return null
  const seconds = waitSeconds(headers, payload)
  const waitMs =
    seconds === null ? DEFAULT_WAIT_MS : Math.ceil(seconds * MS_PER_SECOND)
  return waitMs > MAX_WAIT_MS ? null : waitMs
}
