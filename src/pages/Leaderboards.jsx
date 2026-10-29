import { useId, useState } from 'react'
import Button from '../components/Button/Button'
import Card from '../components/Card/Card'
import GoogleSignInButton from '../components/GoogleSignInButton/GoogleSignInButton'
import Leaderboard from '../components/Leaderboard/Leaderboard'
import Tabs from '../components/Tabs/Tabs'
import { useAuth } from '../hooks/useAuth'
import { useLeaderboard } from '../hooks/useLeaderboard'

// Each view's window, in words (the boards reset on UTC days).
const VIEWS = [
  {
    id: 'all',
    label: 'All Time',
    scope: "Each player's best score of all time.",
    empty: 'No scores yet. Be the first!',
  },
  {
    id: 'daily',
    label: 'Today',
    scope: "Each player's best score today. Resets at 00:00 UTC.",
    empty: 'No scores today yet.',
  },
  {
    id: 'weekly',
    label: 'This Week',
    scope: "Each player's best score this week. Resets Monday at 00:00 UTC.",
    empty: 'No scores this week yet.',
  },
  {
    id: 'personal',
    label: 'Personal Best',
    scope: 'Your best matches, across every mode.',
    empty: 'Play a match to set your first record.',
  },
]

const SignInPrompt = () => (
  <Card className="flex flex-wrap items-center justify-between gap-4">
    <p className="text-ui text-body">Sign in to see your best matches.</p>
    <GoogleSignInButton variant="inverse" size="sm" />
  </Card>
)

const Leaderboards = () => {
  const { user } = useAuth()
  const [view, setView] = useState('all')
  const { entries, error, isLoading, reload } = useLeaderboard(view, user?.uid)
  const idPrefix = useId()

  const activeView = VIEWS.find(({ id }) => id === view)
  const isPersonal = view === 'personal'
  const tabId = (id) => `${idPrefix}-tab-${id}`
  const panelId = `${idPrefix}-panel`

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-title font-medium tracking-tight text-heading">
            Leaderboards
          </h1>
          <p className="mt-1 text-ui text-muted">{activeView.scope}</p>
        </div>
        {user && (
          <Button to="/play" variant="secondary" size="sm">
            Play a match
          </Button>
        )}
      </div>

      <Tabs
        items={VIEWS}
        selectedId={view}
        onSelect={setView}
        label="Leaderboard period"
        panelId={panelId}
        tabId={tabId}
        className="mt-6"
      />

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId(view)}
        className="mt-6"
      >
        {isPersonal && !user ? (
          <SignInPrompt />
        ) : (
          <Leaderboard
            entries={entries}
            isLoading={isLoading}
            error={error}
            emptyMessage={activeView.empty}
            highlightUid={user?.uid}
            onRetry={reload}
            withSummary
            personal={isPersonal}
          />
        )}
      </div>
    </section>
  )
}

export default Leaderboards
