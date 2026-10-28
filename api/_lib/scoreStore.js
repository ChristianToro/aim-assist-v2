const TOP_LIMIT = 100
const PERSONAL_LIMIT = 10

/*
 * Every query against `scores`, built on a tagged-template `sql` function
 * that resolves to rows. db.js wires it to Neon; a check script can pass
 * any Postgres with the same tagged-template shape.
 *
 * Entries come back in the shape the client renders: player name and
 * avatar are joined from neon_auth."user" (never the email), and timestamps
 * serialise as ISO strings.
 */
export const createScoreStore = (sql) => ({
  insert: async (uid, { mode, score, accuracy, reactionTime }) => {
    const [row] = await sql`
      insert into scores (user_id, mode, score, accuracy, reaction_time)
      values (${uid}, ${mode}, ${score}, ${accuracy}, ${reactionTime})
      returning id, created_at as "createdAt"`
    return row
  },

  // Profile stats, derived on every read rather than stored, so two
  // matches saved at once can't lose an update. Null for an unknown user.
  // mode() picks one of the tied modes when two are played equally often.
  profileStats: async (uid) => {
    const [row] = await sql`
      select
        count(s.id)::int                  as "gamesPlayed",
        coalesce(max(s.score), 0)         as "highestScore",
        coalesce(avg(s.accuracy), 0)      as "averageAccuracy",
        mode() within group (order by s.mode) as "favoriteMode",
        u."createdAt"                     as "createdAt"
      from neon_auth."user" u
      left join scores s on s.user_id = u.id
      where u.id = ${uid}
      group by u.id`
    return row ?? null
  },

  // Each player's best score since `since` (null: all time), one entry per
  // player. Ties rank the score that was set first higher.
  topScores: (since) => sql`
    select
      best.id, best.user_id as uid,
      u.name as "displayName", u.image as "photoURL",
      best.mode, best.score, best.accuracy,
      best.reaction_time as "reactionTime", best.created_at as "createdAt"
    from (
      select distinct on (user_id) *
      from scores
      where ${since}::timestamptz is null or created_at >= ${since}
      order by user_id, score desc, created_at
    ) best
    join neon_auth."user" u on u.id = best.user_id
    order by best.score desc, best.created_at
    limit ${TOP_LIMIT}`,

  // A player's own best matches, several per mode allowed.
  personalBests: (uid) => sql`
    select
      s.id, s.user_id as uid,
      u.name as "displayName", u.image as "photoURL",
      s.mode, s.score, s.accuracy,
      s.reaction_time as "reactionTime", s.created_at as "createdAt"
    from scores s
    join neon_auth."user" u on u.id = s.user_id
    where s.user_id = ${uid}
    order by s.score desc, s.created_at
    limit ${PERSONAL_LIMIT}`,
})
