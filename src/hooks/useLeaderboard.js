import { useCallback, useEffect, useState } from 'react'
import { getPersonalBestScores, getTopScores } from '../services/leaderboard'

/*
 * Fetches leaderboard entries for a view: 'all' | 'daily' | 'weekly' |
 * 'personal' (the latter needs a signed-in uid, which also keys it).
 *
 * Loading state is derived by comparing the requested key against the
 * key of the last landed result — no synchronous setState in effects.
 * `reload()` bumps the attempt counter, part of the key, so a retry shows
 * as loading and refetches.
 */
export const useLeaderboard = (view, uid = null) => {
  const [result, setResult] = useState({ key: null, entries: [], error: null })
  const [attempt, setAttempt] = useState(0)

  const needsAuth = view === 'personal' && !uid
  const key = `${view}:${uid ?? ''}:${attempt}`

  useEffect(() => {
    if (view === 'personal' && !uid) return undefined

    let cancelled = false
    const requestKey = `${view}:${uid ?? ''}:${attempt}`
    const request =
      view === 'personal' ? getPersonalBestScores() : getTopScores(view)

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
  }, [view, uid, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  if (needsAuth) return { entries: [], error: null, isLoading: false, reload }

  const isCurrent = result.key === key
  return {
    entries: isCurrent ? result.entries : [],
    error: isCurrent ? result.error : null,
    isLoading: !isCurrent,
    reload,
  }
}
