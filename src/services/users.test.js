import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockGetDoc, mockSetDoc } = vi.hoisted(() => ({
  mockGetDoc: vi.fn(),
  mockSetDoc: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => 'user-ref'),
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
  serverTimestamp: () => 'server-ts',
}))

vi.mock('../firebase/config', () => ({ db: {} }))

import { ensureUserDocument, recordMatchOnProfile } from './users'

const existingDoc = (data) => ({ exists: () => true, data: () => data })
const missingDoc = { exists: () => false }

beforeEach(() => {
  mockGetDoc.mockReset()
  mockSetDoc.mockReset()
  mockSetDoc.mockResolvedValue(undefined)
})

describe('ensureUserDocument', () => {
  it('creates a document with zeroed stats on first sign-in', async () => {
    mockGetDoc.mockResolvedValue(missingDoc)
    await ensureUserDocument({
      uid: 'u1',
      displayName: 'Chris',
      photoURL: 'pic.jpg',
    })
    expect(mockSetDoc).toHaveBeenCalledWith('user-ref', {
      displayName: 'Chris',
      photoURL: 'pic.jpg',
      highestScore: 0,
      gamesPlayed: 0,
      averageAccuracy: 0,
      favoriteMode: '',
      modeCounts: {},
      createdAt: 'server-ts',
    })
  })

  it('only refreshes identity fields for an existing user', async () => {
    mockGetDoc.mockResolvedValue(existingDoc({ gamesPlayed: 10 }))
    await ensureUserDocument({
      uid: 'u1',
      displayName: 'Chris',
      photoURL: null,
    })
    expect(mockSetDoc).toHaveBeenCalledWith(
      'user-ref',
      { displayName: 'Chris', photoURL: null },
      { merge: true }
    )
  })
})

describe('recordMatchOnProfile', () => {
  it('initializes aggregates on the first match', async () => {
    mockGetDoc.mockResolvedValue(missingDoc)
    await recordMatchOnProfile('u1', {
      score: 500,
      accuracy: 80,
      mode: 'Speed',
    })
    expect(mockSetDoc).toHaveBeenCalledWith(
      'user-ref',
      {
        gamesPlayed: 1,
        averageAccuracy: 80,
        highestScore: 500,
        modeCounts: { Speed: 1 },
        favoriteMode: 'Speed',
      },
      { merge: true }
    )
  })

  it('folds a match into existing aggregates incrementally', async () => {
    mockGetDoc.mockResolvedValue(
      existingDoc({
        gamesPlayed: 1,
        averageAccuracy: 80,
        highestScore: 500,
        modeCounts: { Speed: 1 },
        favoriteMode: 'Speed',
      })
    )
    await recordMatchOnProfile('u1', {
      score: 300,
      accuracy: 100,
      mode: 'Gridshot',
    })
    const [, written] = mockSetDoc.mock.calls[0]
    expect(written.gamesPlayed).toBe(2)
    expect(written.averageAccuracy).toBe(90) // (80 + 100) / 2
    expect(written.highestScore).toBe(500) // 300 didn't beat it
    expect(written.modeCounts).toEqual({ Speed: 1, Gridshot: 1 })
  })

  it('updates the favorite mode when a mode takes the lead', async () => {
    mockGetDoc.mockResolvedValue(
      existingDoc({
        gamesPlayed: 3,
        averageAccuracy: 90,
        highestScore: 400,
        modeCounts: { Speed: 1, Gridshot: 2 },
        favoriteMode: 'Gridshot',
      })
    )
    await recordMatchOnProfile('u1', {
      score: 100,
      accuracy: 90,
      mode: 'Speed',
    })
    const [, written] = mockSetDoc.mock.calls[0]
    expect(written.modeCounts).toEqual({ Speed: 2, Gridshot: 2 })
    // Ties keep the earlier-counted mode; a real lead flips it.
    mockSetDoc.mockClear()
    mockGetDoc.mockResolvedValue(existingDoc(written))
    await recordMatchOnProfile('u1', {
      score: 100,
      accuracy: 90,
      mode: 'Speed',
    })
    expect(mockSetDoc.mock.calls[0][1].favoriteMode).toBe('Speed')
  })
})
