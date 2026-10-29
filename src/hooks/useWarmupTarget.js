import { useEffect, useRef, useState } from 'react'
import {
  bestReaction,
  randomTargetPosition,
  reactionMs,
} from '../utils/reactionTarget'

const FIRST_POSITION = { x: 62, y: 44 }

/*
 * State for the landing page's one live target: where it is, and the last
 * and best reaction times. Each hit is timed from when the target last
 * appeared (mount, for the first) and moves it somewhere new.
 */
export const useWarmupTarget = () => {
  const shownAtRef = useRef(0)
  const [state, setState] = useState({
    position: FIRST_POSITION,
    lastMs: null,
    bestMs: null,
  })

  useEffect(() => {
    shownAtRef.current = performance.now()
  }, [])

  const hit = () => {
    const now = performance.now()
    const latest = reactionMs(shownAtRef.current, now)
    shownAtRef.current = now
    setState((prev) => ({
      position: randomTargetPosition(),
      lastMs: latest,
      bestMs: bestReaction(prev.bestMs, latest),
    }))
  }

  return { ...state, hit }
}
