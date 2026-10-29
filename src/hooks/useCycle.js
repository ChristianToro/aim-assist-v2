import { useEffect, useState } from 'react'

/*
 * An index that steps through 0..count-1 every `intervalMs`, wrapping
 * around. Stays at 0 when there's nothing to cycle (count < 2).
 */
export const useCycle = (count, intervalMs) => {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (count < 2) return undefined
    const id = setInterval(() => setTick((prev) => prev + 1), intervalMs)
    return () => clearInterval(id)
  }, [count, intervalMs])

  return count < 2 ? 0 : tick % count
}
