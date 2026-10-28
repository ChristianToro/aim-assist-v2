import { readdir, readFile } from 'node:fs/promises'
import { Client } from '@neondatabase/serverless'

/*
 * Applies db/migrations/*.sql in filename order and records each one in
 * schema_migrations, so a rerun only applies what's new. Each file runs in
 * its own transaction: a failing migration leaves no partial schema behind.
 *
 * Usage: npm run db:migrate (reads .env.local from `vercel env pull`).
 */

const MIGRATIONS_DIR = new URL('../db/migrations/', import.meta.url)

// Neon recommends the direct endpoint for schema changes; the pooled one
// sits behind PgBouncer in transaction mode.
const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL

const listPending = async (client) => {
  const { rows } = await client.query('select name from schema_migrations')
  const applied = new Set(rows.map((row) => row.name))
  const files = await readdir(MIGRATIONS_DIR)
  return files
    .filter((name) => name.endsWith('.sql') && !applied.has(name))
    .sort()
}

const applyMigration = async (client, name) => {
  const statements = await readFile(new URL(name, MIGRATIONS_DIR), 'utf8')
  await client.query('begin')
  try {
    await client.query(statements)
    await client.query('insert into schema_migrations (name) values ($1)', [
      name,
    ])
    await client.query('commit')
  } catch (error) {
    await client.query('rollback')
    throw new Error(`${name} failed: ${error.message}`, { cause: error })
  }
}

const migrate = async () => {
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Run `vercel env pull .env.local` first.'
    )
  }
  // A WebSocket Client, not the HTTP neon() function: migration files hold
  // several statements, which only the Postgres wire protocol accepts.
  const client = new Client(connectionString)
  await client.connect()
  try {
    await client.query(`create table if not exists schema_migrations (
      name       text primary key,
      applied_at timestamptz not null default now()
    )`)
    const pending = await listPending(client)
    for (const name of pending) {
      await applyMigration(client, name)
      console.log(`Applied ${name}`)
    }
    if (pending.length === 0) console.log('Database is up to date.')
  } finally {
    await client.end()
  }
}

migrate().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
