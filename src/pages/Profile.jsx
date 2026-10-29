import Button from '../components/Button/Button'
import HardwareInsight from '../components/HardwareInsight/HardwareInsight'
import Leaderboard from '../components/Leaderboard/Leaderboard'
import PlatformInsight from '../components/PlatformInsight/PlatformInsight'
import ProfileHeader from '../components/ProfileHeader/ProfileHeader'
import StatStrip from '../components/StatStrip/StatStrip'
import { useAuth } from '../hooks/useAuth'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useUserProfile } from '../hooks/useUserProfile'
import { profileFigures, profileMeta } from '../utils/profileStats'

const SECTION_HEADING = 'text-label font-medium text-heading'
// Best matches shows this many rows, then scrolls (the API sends up to 10).
const VISIBLE_MATCHES = 5

// The stats block when /api/me failed: one sentence and a way to retry.
const StatsError = ({ onRetry }) => (
  <div role="alert" className="bg-surface px-4 py-4 text-ui text-muted">
    Couldn&apos;t load your stats right now.
    <button
      type="button"
      onClick={onRetry}
      className="ml-2 font-medium text-heading underline-offset-4 hover:underline"
    >
      Retry
    </button>
  </div>
)

/*
 * The player's own screen: who they are, how they're doing (headline
 * figures, then their best matches as evidence), and what to change (the
 * AI recommendations). The route is wrapped in ProtectedRoute, so `user`
 * is always set here.
 */
const Profile = () => {
  const { user } = useAuth()
  const { profile, error, isLoading, reload } = useUserProfile(user.uid)
  const personalBest = useLeaderboard('personal', user.uid)
  const bestCount = personalBest.entries.length

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <ProfileHeader
        user={user}
        meta={profileMeta(profile)}
        isLoading={isLoading}
        action={
          <Button to="/play" variant="inverse" size="sm">
            Play a match
          </Button>
        }
      />

      <div className="mt-4">
        {error ? (
          <StatsError onRetry={reload} />
        ) : (
          <StatStrip items={profileFigures(profile)} isLoading={isLoading} />
        )}
      </div>

      <div className="mt-10 flex items-baseline justify-between gap-4">
        <h2 className={SECTION_HEADING}>Best matches</h2>
        {bestCount > VISIBLE_MATCHES && (
          <p className="text-meta text-muted">
            {bestCount} matches, best first. Scroll for more.
          </p>
        )}
      </div>
      <div className="mt-3">
        <Leaderboard
          entries={personalBest.entries}
          isLoading={personalBest.isLoading}
          error={personalBest.error}
          emptyMessage="Play a match to set your first record."
          highlightUid={user.uid}
          onRetry={personalBest.reload}
          personal
          visibleRows={VISIBLE_MATCHES}
          label="Best matches"
        />
      </div>

      <h2 className={`mt-10 ${SECTION_HEADING}`}>AI recommendations</h2>
      <p className="mt-1 text-ui text-muted">
        From Claude, based on your scores in each mode.
      </p>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <HardwareInsight />
        <PlatformInsight />
      </div>
    </section>
  )
}

export default Profile
