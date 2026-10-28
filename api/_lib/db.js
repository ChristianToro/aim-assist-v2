import { neon } from '@neondatabase/serverless'
import { createInsightRunner } from './insightRunner.js'
import { createInsightStore } from './insightStore.js'
import { createScoreStore } from './scoreStore.js'

// Neon's HTTP query function: one round trip per query and no connection to
// hold open, which suits short-lived serverless functions. Use it as a
// tagged template (sql`select ...`) so values are always sent as parameters.
export const sql = neon(process.env.DATABASE_URL)

export const scoreStore = createScoreStore(sql)

export const insightRunner = createInsightRunner(createInsightStore(sql))
