import { AuthError, verifyRequest } from './_lib/auth.js'

// Identity is per user, so neither the browser nor a CDN may cache it.
const NO_STORE = { 'Cache-Control': 'private, no-store' }

// GET /api/me: the signed-in caller's identity. M5 adds derived stats.
export const GET = async (request) => {
  try {
    const { uid } = await verifyRequest(request)
    return Response.json({ uid }, { headers: NO_STORE })
  } catch (error) {
    if (!(error instanceof AuthError)) throw error
    return Response.json(
      { error: 'Unauthorized' },
      { status: error.status, headers: NO_STORE }
    )
  }
}
