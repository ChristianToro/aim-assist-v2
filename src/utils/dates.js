const pad = (value) => String(value).padStart(2, '0')

// Local-calendar day key, e.g. "2026-07-06". Scores carry these keys so
// daily/weekly leaderboards can use equality filters + orderBy('score') —
// Firestore disallows a createdAt range filter combined with a score sort.
export const getDayKey = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

// ISO-8601 week key, e.g. "2026-W28" (weeks start Monday).
export const getWeekKey = (date = new Date()) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )
  const dayNumber = d.getUTCDay() || 7 // Sunday → 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNumber) // shift to the week's Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${pad(week)}`
}
