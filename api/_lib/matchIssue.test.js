// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { getModeById } from '../../src/game/modes.js'
import { issueMatch } from './matchIssue.js'
import { ISSUE_LIMIT, ISSUE_WINDOW_MS } from './matchPolicy.js'

const NOW = new Date('2026-10-29T12:00:00Z')
const UID = '00000000-0000-4000-8000-000000000001'

// An in-memory stand-in for matchStore with the same two methods.
const createFakeStore = (startedAts = []) => {
  const issued = []
  return {
    issued,
    countSince: async (uid, since) => {
      const inWindow = startedAts.filter((at) => at >= since)
      return {
        count: inWindow.length,
        oldestAt: inWindow.length ? new Date(Math.min(...inWindow)) : null,
      }
    },
    issue: async (uid, mode, ttlSeconds) => {
      issued.push({ uid, mode, ttlSeconds })
      return { matchId: 'm1', startedAt: NOW, expiresAt: NOW }
    },
  }
}

const minutesAgo = (minutes) => new Date(NOW.getTime() - minutes * 60_000)

describe('issueMatch', () => {
  it('issues a match under the mode label with its lifetime', async () => {
    const store = createFakeStore()
    const mode = getModeById('survival')
    await expect(
      issueMatch(store, { uid: UID, mode, now: NOW })
    ).resolves.toMatchObject({ matchId: 'm1' })
    expect(store.issued).toEqual([
      { uid: UID, mode: 'Survival', ttlSeconds: 7200 },
    ])
  })

  it('issues the last match under the limit', async () => {
    const store = createFakeStore(
      Array.from({ length: ISSUE_LIMIT - 1 }, () => minutesAgo(1))
    )
    const mode = getModeById('gridshot')
    await issueMatch(store, { uid: UID, mode, now: NOW })
    expect(store.issued).toHaveLength(1)
  })

  it('refuses a match over the limit with a 429 and Retry-After', async () => {
    // The oldest of the 20 started 9 minutes ago: a slot opens in 60 s.
    const startedAts = [
      minutesAgo(9),
      ...Array.from({ length: ISSUE_LIMIT - 1 }, () => minutesAgo(1)),
    ]
    const store = createFakeStore(startedAts)
    const mode = getModeById('flick')
    await expect(
      issueMatch(store, { uid: UID, mode, now: NOW })
    ).rejects.toMatchObject({
      status: 429,
      details: { limit: ISSUE_LIMIT, retryAfterSeconds: 60 },
      headers: { 'Retry-After': '60' },
    })
    expect(store.issued).toHaveLength(0)
  })

  it('counts only matches inside the window', async () => {
    const windowMinutes = ISSUE_WINDOW_MS / 60_000
    const store = createFakeStore(
      Array.from({ length: ISSUE_LIMIT }, () => minutesAgo(windowMinutes + 1))
    )
    const mode = getModeById('speed')
    await issueMatch(store, { uid: UID, mode, now: NOW })
    expect(store.issued).toHaveLength(1)
  })
})
