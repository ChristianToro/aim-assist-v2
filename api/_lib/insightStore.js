/*
 * Queries against `insights`, built on a tagged-template `sql` function
 * like scoreStore.js. Rows are one per generated recommendation. `id` is a
 * bigint, sent as text so every driver returns the same JSON-safe value.
 * Ties on created_at break by `insights.id`: a bare `id` in ORDER BY would
 * mean the text alias, which sorts '9' after '10'.
 */
export const createInsightStore = (sql) => ({
  latest: async (uid, kind) => {
    const [row] = await sql`
      select id::text as id, input_hash as "inputHash", result, context,
             model, created_at as "createdAt"
      from insights
      where user_id = ${uid} and kind = ${kind}
      order by created_at desc, insights.id desc
      limit 1`
    return row ?? null
  },

  // The player's most recent recommendations of a kind, newest first.
  history: (uid, kind, limit) =>
    sql`
      select id::text as id, result, context, model,
             created_at as "createdAt"
      from insights
      where user_id = ${uid} and kind = ${kind}
      order by created_at desc, insights.id desc
      limit ${limit}`,

  // How many recommendations were generated since `since`, and when the
  // oldest of them was (it decides when the next slot opens).
  countSince: async (uid, kind, since) => {
    const [row] = await sql`
      select count(*)::int as count, min(created_at) as "oldestAt"
      from insights
      where user_id = ${uid} and kind = ${kind} and created_at >= ${since}`
    return row
  },

  save: async (uid, kind, { inputHash, result, context, model }) => {
    const [row] = await sql`
      insert into insights (user_id, kind, input_hash, result, context, model)
      values (${uid}, ${kind}, ${inputHash}, ${JSON.stringify(result)}::jsonb,
              ${JSON.stringify(context)}::jsonb, ${model})
      returning id::text as id, created_at as "createdAt"`
    return row
  },
})
