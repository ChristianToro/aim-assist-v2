import { apiFetch } from './api'

const fetchView = async (view, options) => {
  const { entries } = await apiFetch(
    `/api/leaderboard?view=${encodeURIComponent(view)}`,
    options
  )
  return entries
}

/*
 * Top scores for a period: 'all' | 'daily' | 'weekly', one entry per
 * player. Daily and weekly reset at UTC midnight and Monday 00:00 UTC.
 * Public: no sign-in needed.
 */
export const getTopScores = (period = 'all') => fetchView(period)

// The signed-in player's own best matches.
export const getPersonalBestScores = () => fetchView('personal', { auth: true })
