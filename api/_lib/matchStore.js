/*
 * Queries against `matches`, built on a tagged-template `sql` function
 * like scoreStore.js. Times come from the database's clock, so a match's
 * start and its submit are measured on the same one. The submit itself
 * (claiming the match) is scoreStore.insertForMatch.
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

  // The caller's match and the ms since it started, or null when there's
  // no such match or it's another player's (the caller can't tell which).
  find: async (uid, matchId) => {
    const [row] = await sql`
      select mode,
             (extract(epoch from now() - started_at) * 1000)::float8
               as "elapsedMs",
             submitted_at is not null as submitted,
             expires_at <= now() as expired
      from matches
      where id = ${matchId} and user_id = ${uid}`
    return row ?? null
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
