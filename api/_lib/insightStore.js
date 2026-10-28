/*
 * Queries against `insights`, built on a tagged-template `sql` function
 * like scoreStore.js. Rows are one per generated recommendation.
 */
export const createInsightStore = (sql) => ({
  latest: async (uid, kind) => {
    const [row] = await sql`
      select input_hash as "inputHash", result, model,
             created_at as "createdAt"
      from insights
      where user_id = ${uid} and kind = ${kind}
      order by created_at desc
      limit 1`
    return row ?? null
  },

  // How many recommendations were generated since `since`, and when the
  // oldest of them was (it decides when the next slot opens).
  countSince: async (uid, kind, since) => {
    const [row] = await sql`
      select count(*)::int as count, min(created_at) as "oldestAt"
      from insights
      where user_id = ${uid} and kind = ${kind} and created_at >= ${since}`
    return row
  },

  save: async (uid, kind, { inputHash, result, model }) => {
    const [row] = await sql`
      insert into insights (user_id, kind, input_hash, result, model)
      values (${uid}, ${kind}, ${inputHash}, ${JSON.stringify(result)}::jsonb, ${model})
      returning created_at as "createdAt"`
    return row
  },
})
