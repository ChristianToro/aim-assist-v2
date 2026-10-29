import { useCallback, useRef, useState } from 'react'

const IDLE = { error: null, isLoading: false }

/*
 * Runs an insight request on demand (a button, not a mount effect: each
 * fresh answer costs a Claude call) and hands the answer to `onAnswer`,
 * which puts it in the panel's history (useInsightHistory). If requests
 * overlap, only the latest one's result lands.
 */
export const useInsight = (request, onAnswer) => {
  const [state, setState] = useState(IDLE)
  const latestRequest = useRef(0)

  const generate = useCallback(
    async (...args) => {
      const requestId = ++latestRequest.current
      setState({ error: null, isLoading: true })
      try {
        const insight = await request(...args)
        if (requestId !== latestRequest.current) return
        onAnswer(insight)
        setState(IDLE)
      } catch (error) {
        console.error('Insight request failed:', error)
        if (requestId !== latestRequest.current) return
        setState({ error, isLoading: false })
      }
    },
    [request, onAnswer]
  )

  return { ...state, generate }
}
