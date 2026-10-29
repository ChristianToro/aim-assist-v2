/*
 * Queries against `matches`, built on a tagged-template `sql` function
 * like scoreStore.js. Times come from the database's clock, so a match's
 * start and its later submit (S4) are measured on the same one.
 */
export const createMatchStore = (sql) => ({
  // How many matches the player started since `since`, and when the
  // oldest of them was (it decides when the next slot opens).
  countSince: async (uid, since) => {
    const [row] = await sql`
      select count(*)::int as count, min(started_at) as "oldestAt"
      from matches
      where user_id = ${uid} and started_at >= ${since}`
    return row
  },

  issue: async (uid, mode, ttlSeconds) => {
    const [row] = await sql`
      insert into matches (user_id, mode, expires_at)
      values (${uid}, ${mode}, now() + make_interval(secs => ${ttlSeconds}))
      returning id as "matchId", started_at as "startedAt",
                expires_at as "expiresAt"`
    return row
  },
})
