import { useState } from 'react'
import Button from '../components/Button/Button'
import Card from '../components/Card/Card'
import Leaderboard from '../components/Leaderboard/Leaderboard'
import { useAuth } from '../hooks/useAuth'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { signInWithGoogle } from '../services/auth'

const VIEWS = [
  { id: 'all', label: 'All Time', empty: 'No scores yet — be the first!' },
  { id: 'daily', label: 'Today', empty: 'No scores today yet.' },
  { id: 'weekly', label: 'This Week', empty: 'No scores this week yet.' },
  {
    id: 'personal',
    label: 'Personal Best',
    empty: 'Play a match to set your first record.',
  },
]

const tabClass = (isActive) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-surface text-heading'
      : 'text-muted hover:bg-surface hover:text-heading'
  }`

const SignInPrompt = () => {
  const handleSignIn = async () => {
    // Success navigates away to Google, so only a failure returns here.
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign-in failed:', error)
    }
  }

  return (
    <Card className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="text-muted">Sign in to track your personal best scores.</p>
      <Button variant="secondary" onClick={handleSignIn}>
        Continue with Google
      </Button>
    </Card>
  )
}

const Leaderboards = () => {
  const { user } = useAuth()
  const [view, setView] = useState('all')
  const { entries, error, isLoading } = useLeaderboard(view, user?.uid)

  const activeView = VIEWS.find(({ id }) => id === view)
  const needsSignIn = view === 'personal' && !user

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-heading">
        Leaderboards
      </h1>

      <div className="mt-6 flex flex-wrap gap-1" role="tablist">
        {VIEWS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            className={tabClass(view === id)}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {needsSignIn ? (
          <SignInPrompt />
        ) : (
          <Leaderboard
            entries={entries}
            isLoading={isLoading}
            error={error}
            emptyMessage={activeView.empty}
            highlightUid={user?.uid}
          />
        )}
      </div>
    </section>
  )
}

export default Leaderboards
