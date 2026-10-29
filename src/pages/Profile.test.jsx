import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { SIGNED_IN_USER, renderWithAuth } from '../test/renderWithAuth'

const { mockProfile, mockBoard } = vi.hoisted(() => ({
  mockProfile: vi.fn(),
  mockBoard: vi.fn(),
}))
vi.mock('../hooks/useUserProfile', () => ({ useUserProfile: mockProfile }))
vi.mock('../hooks/useLeaderboard', () => ({ useLeaderboard: mockBoard }))
vi.mock('../services/insights', () => ({
  getHardwareInsight: vi.fn(),
  getPlatformInsight: vi.fn(),
}))

import Profile from './Profile'

const PROFILE = {
  gamesPlayed: 12,
  highestScore: 13125,
  averageAccuracy: 91.25,
  favoriteMode: 'Speed',
  createdAt: '2026-10-15T12:00:00.000Z',
}
const BEST = {
  id: 'm1',
  uid: 'u1',
  displayName: 'Ada',
  mode: 'Gridshot',
  score: 8560,
  accuracy: 91.8,
  reactionTime: 1493,
  createdAt: '2026-10-27T12:00:00.000Z',
}

const profileState = (state) =>
  mockProfile.mockReturnValue({
    profile: null,
    error: null,
    isLoading: false,
    reload: vi.fn(),
    ...state,
  })

const figure = (label) =>
  screen.getByText(label, { selector: 'dt' }).nextElementSibling

const renderProfile = () =>
  renderWithAuth(<Profile />, { user: SIGNED_IN_USER, route: '/profile' })

describe('Profile', () => {
  beforeEach(() => {
    mockBoard.mockReturnValue({
      entries: [BEST],
      error: null,
      isLoading: false,
      reload: vi.fn(),
    })
  })

  it("titles the screen with the player and states how they're doing", () => {
    profileState({ profile: PROFILE })
    renderProfile()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ada')
    expect(
      screen.getByText('Playing since October 2026 · 12 matches')
    ).toBeInTheDocument()
    expect(figure('Highest score')).toHaveTextContent('13,125')
    expect(figure('Average accuracy')).toHaveTextContent('91.3%')
    expect(screen.getByRole('link', { name: 'Play a match' })).toHaveAttribute(
      'href',
      '/play'
    )
  })

  it('prints zeros and dashes for a player with no matches', () => {
    profileState({
      profile: {
        ...PROFILE,
        gamesPlayed: 0,
        highestScore: 0,
        averageAccuracy: 0,
        favoriteMode: null,
      },
    })
    renderProfile()

    expect(figure('Matches played')).toHaveTextContent('0')
    expect(figure('Average accuracy')).toHaveTextContent('None yet')
    expect(figure('Favourite mode')).toHaveTextContent('None yet')
  })

  it('offers a retry when the stats fail to load', () => {
    const reload = vi.fn()
    profileState({ error: new TypeError('Failed to fetch'), reload })
    renderProfile()

    fireEvent.click(
      within(screen.getByRole('alert')).getByRole('button', { name: 'Retry' })
    )
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('lists best matches by mode, without repeating the player', () => {
    profileState({ profile: PROFILE })
    renderProfile()
    const table = screen.getByRole('table')

    expect(mockBoard).toHaveBeenCalledWith('personal', SIGNED_IN_USER.uid)
    expect(
      within(table).queryByRole('columnheader', { name: 'Player' })
    ).toBeNull()
    expect(within(table).getByText('Gridshot')).toBeInTheDocument()
    expect(within(table).getByText('8,560')).toBeInTheDocument()
  })
})
