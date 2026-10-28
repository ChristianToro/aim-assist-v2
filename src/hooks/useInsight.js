import { useCallback, useRef, useState } from 'react'

const IDLE = { insight: null, error: null, isLoading: false }

/*
 * Runs an insight request on demand (a button, not a mount effect: each
 * fresh answer costs a Claude call). Keeps the last answer on screen while
 * a new one loads or fails. If requests overlap, only the latest one's
 * result lands.
 */
export const useInsight = (request) => {
  const [state, setState] = useState(IDLE)
  const latestRequest = useRef(0)

  const generate = useCallback(
    async (...args) => {
      const requestId = ++latestRequest.current
      setState((current) => ({ ...current, error: null, isLoading: true }))
      try {
        const insight = await request(...args)
        if (requestId !== latestRequest.current) return
        setState({ insight, error: null, isLoading: false })
      } catch (error) {
        console.error('Insight request failed:', error)
        if (requestId !== latestRequest.current) return
        setState((current) => ({ ...current, error, isLoading: false }))
      }
    },
    [request]
  )

  return { ...state, generate }
}
