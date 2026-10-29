import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { SIGNED_IN_USER, renderWithAuth } from '../test/renderWithAuth'

const { mockProfile, mockBoard, insights } = vi.hoisted(() => ({
  mockProfile: vi.fn(),
  mockBoard: vi.fn(),
  insights: {
    getHardwareInsight: vi.fn(),
    getPlatformInsight: vi.fn(),
    listHardwareInsights: vi.fn(),
    listPlatformInsights: vi.fn(),
  },
}))
vi.mock('../hooks/useUserProfile', () => ({ useUserProfile: mockProfile }))
vi.mock('../hooks/useLeaderboard', () => ({ useLeaderboard: mockBoard }))
vi.mock('../services/insights', () => insights)

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

const HARDWARE = {
  id: '4',
  recommendation: {
    summary: 'Fast flicks, late corrections.',
    dpi: { recommended: 800, rationale: 'Finer corrections.' },
    sensitivity: { recommendation: 'Lower by 10%', rationale: 'Overshoot.' },
    pollingRateHz: { recommended: 1000, rationale: 'Smoother tracking.' },
  },
  context: { setup: { dpi: 1600, pollingRateHz: 500 } },
  model: 'claude-opus-5-5',
  generatedAt: '2026-10-28T12:00:00.000Z',
}
const PLATFORMS = {
  id: '5',
  recommendation: {
    summary: 'A tracker at heart.',
    picks: [
      {
        title: 'Apex Legends',
        genre: 'Battle royale',
        platforms: ['PC'],
        fit: 'Long tracking fights.',
      },
    ],
    avoidForNow: 'Tactical shooters.',
  },
  context: {},
  model: 'claude-opus-5-5',
  generatedAt: '2026-10-28T12:00:00.000Z',
}

describe('Profile', () => {
  beforeEach(() => {
    insights.listHardwareInsights.mockResolvedValue([])
    insights.listPlatformInsights.mockResolvedValue([])
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

  it('opens the AI panels on the last saved answers, without asking Claude', async () => {
    profileState({ profile: PROFILE })
    insights.listHardwareInsights.mockResolvedValue([HARDWARE])
    insights.listPlatformInsights.mockResolvedValue([PLATFORMS])
    renderProfile()

    await waitFor(() =>
      expect(
        screen.getByText('Fast flicks, late corrections.')
      ).toBeInTheDocument()
    )
    expect(screen.getByText('For 1600 DPI at 500 Hz.')).toBeInTheDocument()
    expect(await screen.findByText('Apex Legends')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Update' })).toHaveLength(2)
    expect(insights.getHardwareInsight).not.toHaveBeenCalled()
    expect(insights.getPlatformInsight).not.toHaveBeenCalled()
  })

  it('puts a fresh answer above the saved one and keeps both', async () => {
    profileState({ profile: PROFILE })
    insights.listHardwareInsights.mockResolvedValue([HARDWARE])
    insights.getHardwareInsight.mockResolvedValue({
      ...HARDWARE,
      id: '6',
      recommendation: { ...HARDWARE.recommendation, summary: 'Calmer now.' },
      context: { setup: { dpi: null, pollingRateHz: null } },
      generatedAt: '2026-10-29T12:00:00.000Z',
      cached: false,
    })
    renderProfile()

    await screen.findByText('Fast flicks, late corrections.')
    // The hardware panel comes first.
    fireEvent.click(screen.getAllByRole('button', { name: 'Update' })[0])

    expect(await screen.findByText('Calmer now.')).toBeInTheDocument()
    expect(screen.getByText('No current setup was given.')).toBeInTheDocument()
    const picker = screen.getByRole('combobox', { name: 'Showing' })
    expect(within(picker).getAllByRole('option')).toHaveLength(2)
  })
})
