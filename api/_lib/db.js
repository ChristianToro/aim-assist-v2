import { neon } from '@neondatabase/serverless'

// Neon's HTTP query function: one round trip per query and no connection to
// hold open, which suits short-lived serverless functions. Use it as a
// tagged template (sql`select ...`) so values are always sent as parameters.
export const sql = neon(process.env.DATABASE_URL)
