import { useLocation } from 'react-router-dom'
import Button from '../Button/Button'
import GoogleSignInButton from '../GoogleSignInButton/GoogleSignInButton'
import { useAuth } from '../../hooks/useAuth'
import { signOutUser } from '../../services/auth'

// Signing in from the landing page means "I want to play"; anywhere else,
// the player returns to the page they were on.
const returnPathFor = (pathname) => (pathname === '/' ? '/play' : undefined)

// Navbar auth section: Google sign-in when signed out; avatar +
// sign-out when signed in.
const AuthControls = () => {
  const { user, isLoading } = useAuth()
  const { pathname } = useLocation()

  // Reserve width during session restore to avoid layout shift.
  if (isLoading) return <div className="w-24" aria-hidden="true" />

  if (!user) {
    return (
      <GoogleSignInButton
        variant="secondary"
        size="sm"
        returnTo={returnPathFor(pathname)}
      />
    )
  }

  return (
    <div className="flex items-center gap-2">
      {user.photoURL && (
        <img
          src={user.photoURL}
          alt={user.displayName ?? 'Signed-in user'}
          title={user.displayName ?? undefined}
          referrerPolicy="no-referrer"
          className="h-8 w-8 rounded-full border border-edge"
        />
      )}
      <Button variant="ghost" size="sm" onClick={signOutUser}>
        Sign out
      </Button>
    </div>
  )
}

export default AuthControls
