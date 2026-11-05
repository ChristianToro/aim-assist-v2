// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { trackFetch, watchdogPost } from './watchdog.js'

// Runs a sequence of fetch results (true = ok) and collects the notices.
const run = (results) => {
  let saved
  const notices = []
  for (const ok of results) {
    const { state, notice } = trackFetch(saved, ok)
    saved = state
    notices.push(notice)
  }
  return { saved, notices }
}

describe('trackFetch', () => {
  it('stays quiet while fetches succeed', () => {
    expect(run([true, true])).toEqual({
      saved: { failures: 0, noticed: false },
      notices: [null, null],
    })
  })

  it('stays quiet for two failures in a row', () => {
    expect(run([false, false]).notices).toEqual([null, null])
  })

  it('reports the board down on the third failure in a row, once', () => {
    const { saved, notices } = run([false, false, false, false, false])
    expect(notices).toEqual([null, null, 'down', null, null])
    expect(saved).toEqual({ failures: 5, noticed: true })
  })

  it('reports recovery only after a down notice', () => {
    expect(run([false, false, false, true, true]).notices).toEqual([
      null,
      null,
      'down',
      'recovered',
      null,
    ])
    expect(run([false, false, true]).notices).toEqual([null, null, null])
  })

  it('counts failures afresh after a success', () => {
    expect(run([false, false, true, false, false]).notices).toEqual([
      null,
      null,
      null,
      null,
      null,
    ])
  })
})

describe('watchdogPost', () => {
  it('says how long the board has been unreachable', () => {
    expect(
      watchdogPost('down', { view: 'all', failures: 3, status: 503 })
    ).toEqual({
      content:
        "**Watcher:** the all-time leaderboard can't be reached: 3 checks in a row failed (last: 503). No takeover alerts until it's back.",
      allowed_mentions: { parse: [] },
    })
  })

  it('says when checks have resumed', () => {
    expect(watchdogPost('recovered', { view: 'daily' }).content).toBe(
      '**Watcher:** the daily leaderboard is reachable again, and checks have resumed.'
    )
  })
})
