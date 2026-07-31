import Card from '../Card/Card'
import StatTile from '../StatTile/StatTile'

const memberSince = (createdAt) =>
  createdAt?.toDate
    ? createdAt.toDate().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      })
    : null

// Player dashboard: identity from Firebase Auth, aggregates from the
// Firestore profile document (written after each match).
const ProfileCard = ({ user, profile }) => {
  const joined = memberSince(profile?.createdAt)

  return (
    <Card>
      <div className="flex items-center gap-4">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt=""
            referrerPolicy="no-referrer"
            className="h-16 w-16 rounded-full border border-edge"
          />
        )}
        <div>
          <h2 className="text-xl font-semibold text-heading">
            {user.displayName ?? 'Anonymous'}
          </h2>
          {joined && (
            <p className="text-sm text-muted">Playing since {joined}</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile
          label="Highest Score"
          value={profile?.highestScore ?? 0}
          accent
        />
        <StatTile label="Games Played" value={profile?.gamesPlayed ?? 0} />
        <StatTile
          label="Avg Accuracy"
          value={`${(profile?.averageAccuracy ?? 0).toFixed(1)}%`}
        />
        <StatTile label="Favorite Mode" value={profile?.favoriteMode || '—'} />
      </div>
    </Card>
  )
}

export default ProfileCard
