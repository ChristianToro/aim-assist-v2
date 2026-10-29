import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useMediaQuery } from './useMediaQuery'

// jsdom has no matchMedia: a minimal stand-in whose result can be flipped.
const stubMatchMedia = (initial) => {
  const listeners = new Set()
  const list = {
    matches: initial,
    addEventListener: (_, fn) => listeners.add(fn),
    removeEventListener: (_, fn) => listeners.delete(fn),
  }
  vi.stubGlobal('matchMedia', () => list)
  return {
    listeners,
    set: (matches) => {
      list.matches = matches
      listeners.forEach((fn) => fn())
    },
  }
}

describe('useMediaQuery', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('returns whether the query matches now', () => {
    stubMatchMedia(true)
    const { result } = renderHook(() =>
      useMediaQuery('(prefers-reduced-motion: reduce)')
    )
    expect(result.current).toBe(true)
  })

  it('updates when the preference changes, and unsubscribes on unmount', () => {
    const media = stubMatchMedia(false)
    const { result, unmount } = renderHook(() =>
      useMediaQuery('(prefers-contrast: more)')
    )
    expect(result.current).toBe(false)

    act(() => media.set(true))
    expect(result.current).toBe(true)

    unmount()
    expect(media.listeners.size).toBe(0)
  })
})
