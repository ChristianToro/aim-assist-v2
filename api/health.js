import { sql } from './_lib/db.js'

const SERVICE_UNAVAILABLE = 503

// GET /api/health: the function runs and Neon answers a round trip.
export const GET = async () => {
  try {
    await sql`select 1`
    return Response.json({ ok: true, database: 'up' })
  } catch (error) {
    console.error('Health check: database unreachable', error)
    return Response.json(
      { ok: false, database: 'down' },
      { status: SERVICE_UNAVAILABLE }
    )
  }
}
