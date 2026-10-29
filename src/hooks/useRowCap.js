import { useLayoutEffect } from 'react'

/*
 * Caps a scrolling table's frame at its first `rows` body rows plus half
 * of the next, so the cut-off row shows there is more to scroll to. Rows
 * are measured rather than assumed (they rewrap to two or three lines on
 * a phone), and re-measured whenever the frame resizes. Sets the frame's
 * max-height directly: the value only ever feeds layout, so it needs no
 * React state. `itemCount` re-runs it when the rows change.
 */
export const useRowCap = (frameRef, rows, itemCount) => {
  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return undefined

    const next = () => frame.querySelectorAll('tbody tr')[rows]
    if (!rows || !next()) {
      frame.style.maxHeight = ''
      return undefined
    }

    const measure = () => {
      const row = next()
      if (!row) return
      const top =
        row.getBoundingClientRect().top -
        frame.getBoundingClientRect().top +
        frame.scrollTop
      frame.style.maxHeight = `${top + row.offsetHeight / 2}px`
    }

    measure()
    if (typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [frameRef, rows, itemCount])
}
