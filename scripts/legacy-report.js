import { neon } from '@neondatabase/serverless'
import { legacyScoreFailures, legacyScoresQuery } from './legacyScores.js'

/*
 * Lists the scores saved before server-checked scoring (no match_id) that
 * fail the bounds a match would now be held to. Read-only: the query runs
 * in a READ ONLY transaction, and the rows are only printed. Deleting any
 * of them is a manual step in the Neon Console.
 *
 * Usage: npm run db:legacy-report (reads .env.local from `vercel env pull`).
 */

const describe = ({ id, mode, score, reactionTime, player, failures }) =>
  `  #${id}  ${mode}  ${score}  reaction ${reactionTime ?? '—'} ms  ` +
  `${player ?? '(no name)'}  fails: ${failures.join(', ')}`

const main = async () => {
  const sql = neon(process.env.DATABASE_URL)
  const [rows] = await sql.transaction([legacyScoresQuery(sql)], {
    readOnly: true,
  })
  const failing = rows
    .map((row) => ({ ...row, failures: legacyScoreFailures(row) }))
    .filter(({ failures }) => failures.length > 0)

  console.log(`${rows.length} legacy scores, ${failing.length} implausible.`)
  if (failing.length === 0) return
  failing.forEach((row) => console.log(describe(row)))
  const ids = failing.map(({ id }) => id).join(', ')
  console.log(
    '\nTo remove them, review and run in the Neon Console:\n' +
      `  delete from scores where match_id is null and id in (${ids});`
  )
}

await main()
