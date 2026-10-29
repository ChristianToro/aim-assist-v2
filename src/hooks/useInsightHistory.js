import { useCallback, useEffect, useState } from 'react'
import { mergeEntries, shownEntry } from '../utils/insightHistory'

const NOTHING_PICKED = { uid: null, added: [], selectedId: null }

/*
 * A player's past recommendations of one kind, and the one the panel
 * shows. Reading them costs no Claude call, so unlike useInsight this
 * loads on mount. Loading state is derived from keys, as in
 * useLeaderboard. `add()` puts an answer generated on this page at the top
 * and shows it; `select()` shows an older one. Both are kept per uid, so
 * a different account never sees the last one's.
 */
export const useInsightHistory = (list, uid) => {
  const [result, setResult] = useState({ key: null, entries: [], error: null })
  const [attempt, setAttempt] = useState(0)
  const [local, setLocal] = useState(NOTHING_PICKED)
  const key = `${uid}:${attempt}`

  useEffect(() => {
    if (!uid) return undefined

    let cancelled = false
    const requestKey = `${uid}:${attempt}`
    list()
      .then((entries) => {
        if (!cancelled) setResult({ key: requestKey, entries, error: null })
      })
      .catch((error) => {
        console.error('Failed to load past recommendations:', error)
        if (!cancelled) setResult({ key: requestKey, entries: [], error })
      })

    return () => {
      cancelled = true
    }
  }, [list, uid, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  const add = useCallback(
    (entry) =>
      setLocal((current) => ({
        uid,
        added: [entry, ...(current.uid === uid ? current.added : [])],
        selectedId: null,
      })),
    [uid]
  )

  const select = useCallback(
    (selectedId) =>
      setLocal((current) => ({
        ...(current.uid === uid ? current : NOTHING_PICKED),
        uid,
        selectedId,
      })),
    [uid]
  )

  const isCurrent = result.key === key
  const mine = local.uid === uid ? local : NOTHING_PICKED
  const entries = mergeEntries(mine.added, isCurrent ? result.entries : [])

  return {
    entries,
    shown: shownEntry(entries, mine.selectedId),
    error: isCurrent ? result.error : null,
    isLoading: Boolean(uid) && !isCurrent,
    reload,
    add,
    select,
  }
}
