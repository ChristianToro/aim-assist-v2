import HardwareInsight from '../components/HardwareInsight/HardwareInsight'
import Leaderboard from '../components/Leaderboard/Leaderboard'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import PlatformInsight from '../components/PlatformInsight/PlatformInsight'
import ProfileCard from '../components/ProfileCard/ProfileCard'
import { useAuth } from '../hooks/useAuth'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useUserProfile } from '../hooks/useUserProfile'

// Route is wrapped in ProtectedRoute, so `user` is always set here.
const Profile = () => {
  const { user } = useAuth()
  const { profile, error, isLoading } = useUserProfile(user.uid)
  const personalBest = useLeaderboard('personal', user.uid)

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-heading">
        Profile
      </h1>

      <div className="mt-6">
        {error ? (
          <p className="py-8 text-center text-muted">
            Couldn&apos;t load your profile right now — try refreshing.
          </p>
        ) : (
          <ProfileCard user={user} profile={profile} />
        )}
      </div>

      <h2 className="mt-10 text-xl font-semibold text-heading">AI Insights</h2>
      <p className="mt-1 text-sm text-muted">
        Recommendations from Claude, based on your scores in each mode.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <HardwareInsight />
        <PlatformInsight />
      </div>

      <h2 className="mt-10 text-xl font-semibold text-heading">Best Matches</h2>
      <div className="mt-4">
        <Leaderboard
          entries={personalBest.entries}
          isLoading={personalBest.isLoading}
          error={personalBest.error}
          emptyMessage="Play a match to set your first record."
          highlightUid={user.uid}
        />
      </div>
    </section>
  )
}

export default Profile
