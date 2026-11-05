/*
 * A stand-in for the two Discord webhooks, for re-running the watcher's
 * failure tests without posting to the real channels (BUILD-LOG.md,
 * "Re-running the failure tests"). The first POST to /announce gets a 429
 * asking for a 1.5 s wait; every other POST gets a 204. Each request is
 * printed to stdout as one JSON line.
 *
 *   node automation/mock-discord.js [port]
 */
import { createServer } from 'node:http'

const DEFAULT_PORT = 18790
const RATE_LIMITED_PATH = '/announce'
const RETRY_AFTER_SECONDS = 1.5
const TOO_MANY_REQUESTS = 429
const NO_CONTENT = 204

const port = Number(process.argv[2] ?? DEFAULT_PORT)
let rateLimitSent = false

const readBody = (request) =>
  new Promise((resolve) => {
    let body = ''
    request.on('data', (chunk) => (body += chunk))
    request.on('end', () => resolve(body))
  })

const parseJson = (text) => {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// Discord's 429 shape: the wait in seconds in the body and the header.
const rateLimit = (response) => {
  response.writeHead(TOO_MANY_REQUESTS, {
    'content-type': 'application/json',
    'retry-after': String(Math.ceil(RETRY_AFTER_SECONDS)),
  })
  response.end(
    JSON.stringify({
      message: 'You are being rate limited.',
      retry_after: RETRY_AFTER_SECONDS,
      global: false,
    })
  )
}

createServer(async (request, response) => {
  const body = await readBody(request)
  const limited = request.url === RATE_LIMITED_PATH && !rateLimitSent
  if (limited) rateLimitSent = true

  const status = limited ? TOO_MANY_REQUESTS : NO_CONTENT
  console.log(
    JSON.stringify({
      at: new Date().toISOString(),
      path: request.url,
      status,
      body: parseJson(body),
    })
  )
  if (limited) rateLimit(response)
  else response.writeHead(NO_CONTENT).end()
}).listen(port, '127.0.0.1', () => {
  console.error(`Mock Discord webhooks on http://127.0.0.1:${port}`)
})
