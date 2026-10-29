import { useCallback, useEffect, useState } from 'react'
import { getUserProfile } from '../services/users'

// Fetches the signed-in player's profile. The request needs no uid (the
// server reads it from the token); `uid` keys the result so a different
// account never sees the last one's. Loading state is derived (requested
// key vs landed key) — no synchronous setState. `reload()` bumps the
// attempt counter, part of the key, so a retry shows as loading.
export const useUserProfile = (uid) => {
  const [result, setResult] = useState({
    key: null,
    profile: null,
    error: null,
  })
  const [attempt, setAttempt] = useState(0)
  const key = `${uid}:${attempt}`

  useEffect(() => {
    if (!uid) return undefined

    let cancelled = false
    const requestKey = `${uid}:${attempt}`
    getUserProfile()
      .then((profile) => {
        if (!cancelled) setResult({ key: requestKey, profile, error: null })
      })
      .catch((error) => {
        console.error('Failed to load profile:', error)
        if (!cancelled) setResult({ key: requestKey, profile: null, error })
      })

    return () => {
      cancelled = true
    }
  }, [uid, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  const isCurrent = result.key === key
  return {
    profile: isCurrent ? result.profile : null,
    error: isCurrent ? result.error : null,
    isLoading: Boolean(uid) && !isCurrent,
    reload,
  }
}
