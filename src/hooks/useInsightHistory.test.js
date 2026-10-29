import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useInsightHistory } from './useInsightHistory'

const entry = (id, day, extra = {}) => ({
  id,
  recommendation: { summary: `Answer ${id}` },
  generatedAt: `2026-10-${day}T12:00:00.000Z`,
  ...extra,
})
const SAVED = [entry('2', 28), entry('1', 27)]

const renderHistory = (list, uid = 'u1') =>
  renderHook(({ uid: current }) => useInsightHistory(list, current), {
    initialProps: { uid },
  })

describe('useInsightHistory', () => {
  afterEach(() => vi.restoreAllMocks())

  it('loads the saved answers on mount and shows the latest', async () => {
    const list = vi.fn().mockResolvedValue(SAVED)
    const { result } = renderHistory(list)

    expect(result.current).toMatchObject({ isLoading: true, shown: null })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.entries).toEqual(SAVED)
    expect(result.current.shown).toBe(SAVED[0])
    expect(list).toHaveBeenCalledOnce()
  })

  it('asks for nothing without a player', () => {
    const list = vi.fn()
    const { result } = renderHistory(list, null)

    expect(result.current).toMatchObject({ isLoading: false, entries: [] })
    expect(list).not.toHaveBeenCalled()
  })

  it('shows an older answer when picked', async () => {
    const { result } = renderHistory(vi.fn().mockResolvedValue(SAVED))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.select('1'))
    expect(result.current.shown).toBe(SAVED[1])
  })

  it('puts a fresh answer at the top and shows it, even over a pick', async () => {
    const { result } = renderHistory(vi.fn().mockResolvedValue(SAVED))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.select('1'))

    const fresh = entry('3', 29, { cached: false })
    act(() => result.current.add(fresh))
    expect(result.current.entries.map(({ id }) => id)).toEqual(['3', '2', '1'])
    expect(result.current.shown).toBe(fresh)
  })

  it("doesn't list a cached answer twice", async () => {
    const { result } = renderHistory(vi.fn().mockResolvedValue(SAVED))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const cached = { ...SAVED[0], cached: true }
    act(() => result.current.add(cached))
    expect(result.current.entries).toHaveLength(2)
    expect(result.current.shown).toBe(cached)
  })

  it('keeps an answer generated before the list landed', async () => {
    let land
    const list = vi.fn(() => new Promise((resolve) => (land = resolve)))
    const { result } = renderHistory(list)

    const fresh = entry('3', 29)
    act(() => result.current.add(fresh))
    expect(result.current.shown).toBe(fresh)

    await act(async () => land(SAVED))
    expect(result.current.entries.map(({ id }) => id)).toEqual(['3', '2', '1'])
  })

  it('retries a failed load on reload', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const outage = new TypeError('Failed to fetch')
    const list = vi
      .fn()
      .mockRejectedValueOnce(outage)
      .mockResolvedValueOnce(SAVED)
    const { result } = renderHistory(list)

    await waitFor(() => expect(result.current.error).toBe(outage))
    act(() => result.current.reload())
    expect(result.current).toMatchObject({ isLoading: true, error: null })
    await waitFor(() => expect(result.current.entries).toEqual(SAVED))
  })

  it("never shows one account's answers to the next", async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce(SAVED)
      .mockResolvedValueOnce([entry('9', 29)])
    const { result, rerender } = renderHistory(list)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.add(entry('3', 29)))

    rerender({ uid: 'u2' })
    expect(result.current).toMatchObject({ entries: [], shown: null })
    await waitFor(() =>
      expect(result.current.entries.map(({ id }) => id)).toEqual(['9'])
    )
  })
})
