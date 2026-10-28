export const VIEWS = ['all', 'daily', 'weekly', 'personal']

const DAY_MS = 24 * 60 * 60 * 1000
const SUNDAY = 0
const DAYS_PER_WEEK = 7

const startOfUtcDay = (date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )

// ISO weeks start on Monday; getUTCDay() counts from Sunday = 0.
const startOfUtcWeek = (date) => {
  const weekday = date.getUTCDay() === SUNDAY ? DAYS_PER_WEEK : date.getUTCDay()
  return new Date(startOfUtcDay(date).getTime() - (weekday - 1) * DAY_MS)
}

/*
 * The instant a board's window opens, or null for an unbounded board.
 * Daily and weekly boards use UTC days (PLAN-V2 decision), so every player
 * sees the same board and it resets at the same moment worldwide.
 */
export const periodStart = (view, now = new Date()) => {
  if (view === 'daily') return startOfUtcDay(now)
  if (view === 'weekly') return startOfUtcWeek(now)
  return null
}
