import { createGameSession } from '../GameSession.js'
import { getModeById } from '../modes.js'

/*
 * Test helper: plays a whole match headlessly with a scripted player, so
 * tests get a real engine-made event log. Not imported by the app.
 *
 * Every `clickEvery` frames the player clicks the oldest live target
 * that's at least `minAgeSeconds` old (a human-ish reaction), and clicks
 * empty space on any frame where `missAt(frame)` is true.
 */
const FRAME_SECONDS = 1 / 60
const SIZE = { width: 1280, height: 720 }
// Inside every target's spawn margin, so a click here always misses.
const EMPTY_SPOT = { x: 1, y: 1 }
const MAX_FRAMES = 60 * 60 * 5

export const playMatch = (
  modeId,
  { clickEvery = 15, minAgeSeconds = 0.3, missAt = () => false } = {}
) => {
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
  // The clicked targets' ages in seconds, in click order.
  const ages = []

  for (let frame = 1; frame <= MAX_FRAMES && !summary; frame += 1) {
    const target = session.targets.find(
      ({ isAlive, age }) => isAlive && age >= minAgeSeconds
    )
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

// A Survival script that outlasts the 90 s value ramp, then misses five
// times in a row to end the match.
export const SURVIVAL_SCRIPT = {
  clickEvery: 10,
  missAt: (frame) => frame > 100 * 60,
}
