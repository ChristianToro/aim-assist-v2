import { useEffect, useState } from 'react'
import { getUserProfile } from '../services/users'

// Fetches the Firestore profile document for a uid. Loading state is
// derived (requested uid vs landed uid) — no synchronous setState.
export const useUserProfile = (uid) => {
  const [result, setResult] = useState({
    uid: null,
    profile: null,
    error: null,
  })

  useEffect(() => {
    if (!uid) return undefined

    let cancelled = false
    getUserProfile(uid)
      .then((profile) => {
        if (!cancelled) setResult({ uid, profile, error: null })
      })
      .catch((error) => {
        console.error('Failed to load profile:', error)
        if (!cancelled) setResult({ uid, profile: null, error })
      })

    return () => {
      cancelled = true
    }
  }, [uid])

  const isCurrent = result.uid === uid
  return {
    profile: isCurrent ? result.profile : null,
    error: isCurrent ? result.error : null,
    isLoading: Boolean(uid) && !isCurrent,
  }
}
