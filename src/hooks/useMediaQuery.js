import { useCallback, useSyncExternalStore } from 'react'

// Live result of a CSS media query, such as the OS's reduced-motion
// setting. Re-renders when the preference changes while the page is open.
export const useMediaQuery = (query) => {
  const subscribe = useCallback(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query]
  )

  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}
