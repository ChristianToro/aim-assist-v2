import { describe, expect, it } from 'vitest'
import { profileFigures, profileMeta } from './profileStats'

const PROFILE = {
  gamesPlayed: 1204,
  highestScore: 13125,
  averageAccuracy: 91.25,
  favoriteMode: 'Speed',
  createdAt: '2026-10-15T12:00:00.000Z',
}

const values = (profile) => profileFigures(profile).map(({ value }) => value)

describe('profileFigures', () => {
  it('formats a playing profile', () => {
    expect(values(PROFILE)).toEqual(['13,125', '1,204', '91.3%', 'Speed'])
  })

  it('prints real zeros and leaves impossible figures empty', () => {
    const fresh = { ...PROFILE, gamesPlayed: 0, highestScore: 0 }
    expect(
      values({ ...fresh, averageAccuracy: 0, favoriteMode: null })
    ).toEqual(['0', '0', null, null])
  })

  it('keeps its labels when there is no profile', () => {
    expect(profileFigures(null).map(({ label }) => label)).toEqual([
      'Highest score',
      'Matches played',
      'Average accuracy',
      'Favourite mode',
    ])
  })
})

describe('profileMeta', () => {
  it('names the start month and counts the matches', () => {
    expect(profileMeta(PROFILE)).toBe(
      'Playing since October 2026 · 1,204 matches'
    )
    expect(profileMeta({ ...PROFILE, gamesPlayed: 1 })).toMatch(/· 1 match$/)
  })

  it('says when there are no matches yet', () => {
    expect(profileMeta({ ...PROFILE, gamesPlayed: 0 })).toMatch(
      /· No matches yet$/
    )
  })

  it('is empty before the profile arrives', () => {
    expect(profileMeta(null)).toBe('')
  })
})
