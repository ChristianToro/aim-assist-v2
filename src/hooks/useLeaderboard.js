import { useEffect, useState } from 'react'
import { getPersonalBestScores, getTopScores } from '../services/leaderboard'

/*
 * Fetches leaderboard entries for a view: 'all' | 'daily' | 'weekly' |
 * 'personal' (the latter needs a uid).
 *
 * Loading state is derived by comparing the requested key against the
 * key of the last landed result — no synchronous setState in effects.
 */
export const useLeaderboard = (view, uid = null) => {
  const [result, setResult] = useState({ key: null, entries: [], error: null })

  const needsAuth = view === 'personal' && !uid
  const key = `${view}:${uid ?? ''}`

  useEffect(() => {
    if (view === 'personal' && !uid) return undefined

    let cancelled = false
    const requestKey = `${view}:${uid ?? ''}`
    const request =
      view === 'personal' ? getPersonalBestScores(uid) : getTopScores(view)

    request
      .then((entries) => {
        if (!cancelled) setResult({ key: requestKey, entries, error: null })
      })
      .catch((error) => {
        console.error('Leaderboard query failed:', error)
        if (!cancelled) setResult({ key: requestKey, entries: [], error })
      })

    return () => {
      cancelled = true
    }
  }, [view, uid])

  if (needsAuth) return { entries: [], error: null, isLoading: false }

  const isCurrent = result.key === key
  return {
    entries: isCurrent ? result.entries : [],
    error: isCurrent ? result.error : null,
    isLoading: !isCurrent,
  }
}
