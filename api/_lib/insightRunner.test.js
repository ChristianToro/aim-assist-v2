// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DAILY_LIMIT, WINDOW_MS, inputHash } from './insightPolicy.js'
import { createInsightRunner } from './insightRunner.js'

const UID = '00000000-0000-4000-8000-00000000000a'
const NOW = new Date('2026-10-28T12:00:00Z')
const INPUTS = { version: 1, modeStats: [{ mode: 'Flick', matches: 6 }] }
const RESULT = { summary: 'Steady flicks.' }

const CONTEXT = { setup: { dpi: 800, pollingRateHz: 1000 } }

// An in-memory stand-in for the insightStore methods the runner uses.
const memoryStore = (rows = []) => ({
  rows,
  latest: async () => rows.at(-1) ?? null,
  countSince: async (uid, kind, since) => {
    const inWindow = rows.filter((row) => row.createdAt >= since)
    return { count: inWindow.length, oldestAt: inWindow[0]?.createdAt ?? null }
  },
  save: async (uid, kind, row) => {
    const saved = { ...row, id: String(rows.length + 1), createdAt: NOW }
    rows.push(saved)
    return { id: saved.id, createdAt: saved.createdAt }
  },
})

const run = (store, generate, context = CONTEXT) =>
  createInsightRunner(store)({
    uid: UID,
    kind: 'hardware',
    inputs: { ...INPUTS, ...context },
    context,
    generate,
    now: NOW,
  })

let generate
beforeEach(() => {
  generate = vi
    .fn()
    .mockResolvedValue({ result: RESULT, model: 'claude-opus-5-5' })
})

describe('createInsightRunner', () => {
  it('generates, saves and returns a fresh recommendation', async () => {
    const store = memoryStore()
    expect(await run(store, generate)).toEqual({
      id: '1',
      recommendation: RESULT,
      context: CONTEXT,
      model: 'claude-opus-5-5',
      generatedAt: NOW,
      cached: false,
    })
    expect(store.rows).toHaveLength(1)
    expect(store.rows[0]).toMatchObject({
      inputHash: inputHash({ ...INPUTS, ...CONTEXT }),
      context: CONTEXT,
    })
  })

  it('stores an empty context for a kind with no request input', async () => {
    const store = memoryStore()
    expect((await run(store, generate, {})).context).toEqual({})
    expect(store.rows[0].context).toEqual({})
  })

  it('reuses the latest answer when the inputs are unchanged', async () => {
    const earlier = new Date(NOW.getTime() - 60_000)
    const store = memoryStore([
      {
        id: '7',
        inputHash: inputHash({ ...INPUTS, ...CONTEXT }),
        result: RESULT,
        context: CONTEXT,
        model: 'claude-opus-5-5',
        createdAt: earlier,
      },
    ])
    expect(await run(store, generate)).toEqual({
      id: '7',
      recommendation: RESULT,
      context: CONTEXT,
      model: 'claude-opus-5-5',
      generatedAt: earlier,
      cached: true,
    })
    expect(generate).not.toHaveBeenCalled()
  })

  it('returns a null context for a cached row saved before it was stored', async () => {
    const store = memoryStore([
      {
        id: '3',
        inputHash: inputHash({ ...INPUTS, ...CONTEXT }),
        result: RESULT,
        context: null,
        model: 'claude-opus-5-5',
        createdAt: NOW,
      },
    ])
    expect(await run(store, generate)).toMatchObject({
      cached: true,
      context: null,
    })
  })

  it('serves a cached answer even when the daily limit is used up', async () => {
    const rows = Array.from({ length: DAILY_LIMIT }, (_, i) => ({
      inputHash:
        i === DAILY_LIMIT - 1 ? inputHash({ ...INPUTS, ...CONTEXT }) : 'old',
      result: RESULT,
      model: 'claude-opus-5-5',
      createdAt: new Date(NOW.getTime() - 1000 * (DAILY_LIMIT - i)),
    }))
    expect((await run(memoryStore(rows), generate)).cached).toBe(true)
  })

  it('refuses a fresh answer past the daily limit, without calling Claude', async () => {
    const oldestAt = new Date(NOW.getTime() - WINDOW_MS + 600_000)
    const rows = Array.from({ length: DAILY_LIMIT }, (_, i) => ({
      inputHash: `stale-${i}`,
      createdAt: new Date(oldestAt.getTime() + i),
    }))
    await expect(run(memoryStore(rows), generate)).rejects.toMatchObject({
      status: 429,
      details: { limit: DAILY_LIMIT, retryAfterSeconds: 600 },
      headers: { 'Retry-After': '600' },
    })
    expect(generate).not.toHaveBeenCalled()
  })

  it('ignores generations older than the window', async () => {
    const stale = new Date(NOW.getTime() - WINDOW_MS - 1)
    const rows = Array.from({ length: DAILY_LIMIT }, () => ({
      inputHash: 'old',
      createdAt: stale,
    }))
    expect((await run(memoryStore(rows), generate)).cached).toBe(false)
  })

  it('saves nothing when generation fails', async () => {
    const store = memoryStore()
    const failure = new Error('upstream')
    await expect(run(store, vi.fn().mockRejectedValue(failure))).rejects.toBe(
      failure
    )
    expect(store.rows).toHaveLength(0)
  })
})
