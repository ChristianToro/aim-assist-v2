import { formatAccuracy, formatScore } from './leaderboardFormat'

const LOCALE = 'en-US'

/*
 * The profile's headline figures, as the stats strip shows them. A real
 * zero prints as 0; a figure that can't exist yet (accuracy or a favourite
 * mode before any match) is null, which the strip draws as a grey dash.
 */
export const profileFigures = (profile) => {
  const played = profile?.gamesPlayed ?? 0
  return [
    { label: 'Highest score', value: formatScore(profile?.highestScore ?? 0) },
    { label: 'Matches played', value: played.toLocaleString(LOCALE) },
    {
      label: 'Average accuracy',
      value: played > 0 ? formatAccuracy(profile.averageAccuracy) : null,
    },
    { label: 'Favourite mode', value: profile?.favoriteMode || null },
  ]
}

// "Playing since October 2026 · 12 matches": the header's meta line.
export const profileMeta = (profile) => {
  const parts = []
  if (profile?.createdAt) {
    const since = new Date(profile.createdAt).toLocaleDateString(LOCALE, {
      year: 'numeric',
      month: 'long',
    })
    parts.push(`Playing since ${since}`)
  }
  if (profile) {
    const played = profile.gamesPlayed ?? 0
    parts.push(
      played === 0
        ? 'No matches yet'
        : `${played.toLocaleString(LOCALE)} match${played === 1 ? '' : 'es'}`
    )
  }
  return parts.join(' · ')
}
