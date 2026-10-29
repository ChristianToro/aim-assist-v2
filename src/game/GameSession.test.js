import { describe, expect, it } from 'vitest'
import { createGameSession } from './GameSession'
import { getModeById } from './modes'
import { scoreEvents } from './scoring'

const FRAME_SECONDS = 1 / 60
const SIZE = { width: 1280, height: 720 }
// Inside every target's spawn margin, so a click here always misses.
const EMPTY_SPOT = { x: 1, y: 1 }
const MAX_FRAMES = 60 * 60 * 5

/*
 * Plays a match to its end with a scripted player: every `clickEvery`
 * frames it clicks the oldest live target's center, or empty space when
 * `missAt(frame)` says so. Returns the live HUD's last snapshot, the
 * game-over summary and the clicked targets' ages (seconds) in order.
 */
const play = (modeId, { clickEvery = 15, missAt = () => false } = {}) => {
  let pending = []
  const input = {
    consumeClicks: () => {
      const clicks = pending
      pending = []
      return clicks
    },
  }
  let lastHud = null
  let summary = null
  const session = createGameSession({
    mode: getModeById(modeId),
    reducedMotion: true,
    onHud: (snapshot) => (lastHud = snapshot),
    onGameOver: (result) => (summary = result),
  })
  const ages = []

  for (let frame = 1; frame <= MAX_FRAMES && !summary; frame += 1) {
    const target = session.targets.find(({ isAlive }) => isAlive)
    if (missAt(frame)) {
      pending.push(EMPTY_SPOT)
    } else if (frame % clickEvery === 0 && target) {
      pending.push({ x: target.x, y: target.y })
      ages.push(target.age)
    }
    session.update(FRAME_SECONDS, SIZE, input)
  }
  return { session, lastHud, summary, ages }
}

const hitsOf = (events) => events.filter(({ kind }) => kind === 'hit')

describe.each([
  // Gridshot: a timed mode; every 20th frame is a deliberate miss.
  ['gridshot', { missAt: (frame) => frame % 20 === 0 }],
  // Survival: past the 90 s value ramp, then five misses to end it.
  ['survival', { clickEvery: 10, missAt: (frame) => frame > 100 * 60 }],
])('a scripted %s match', (modeId, script) => {
  const { lastHud, summary, ages } = play(modeId, script)

  it('ends and logs every hit and miss', () => {
    expect(summary).not.toBeNull()
    expect(hitsOf(summary.events)).toHaveLength(summary.hits)
    expect(summary.hits).toBeGreaterThan(0)
    expect(summary.misses).toBeGreaterThan(0)
  })

  it("reproduces the live HUD's figures from its log", () => {
    expect(scoreEvents(getModeById(modeId), summary.events)).toMatchObject({
      score: lastHud.score,
      hits: lastHud.hits,
      misses: lastHud.misses,
      maxCombo: lastHud.maxCombo,
    })
  })

  it('stamps events in ascending game time', () => {
    const times = summary.events.map(({ t }) => t)
    expect(times).toEqual([...times].sort((a, b) => a - b))
    expect(times[0]).toBeGreaterThanOrEqual(0)
  })

  it("logs each hit's reaction time as its target's age", () => {
    hitsOf(summary.events).forEach(({ t, spawnedAt }, i) => {
      expect(Math.abs(t - spawnedAt - ages[i] * 1000)).toBeLessThanOrEqual(1)
    })
  })
})

it('keeps every timed-mode event within the match duration', () => {
  const { summary } = play('speed')
  const durationMs = getModeById('speed').duration * 1000
  summary.events.forEach(({ t }) => expect(t).toBeLessThanOrEqual(durationMs))
})

// Guards the Survival script above: its replay must cover the value ramp.
it('plays Survival past the end of its value ramp', () => {
  const { summary } = play('survival', {
    clickEvery: 10,
    missAt: (frame) => frame > 100 * 60,
  })
  const late = hitsOf(summary.events).filter(
    ({ spawnedAt }) => spawnedAt >= 90_000
  )
  expect(late.length).toBeGreaterThan(0)
})

it("leaves the last summary's log intact on reset", () => {
  const { session, summary } = play('gridshot')
  const logged = summary.events.length
  session.reset()
  expect(summary.events).toHaveLength(logged)
})
