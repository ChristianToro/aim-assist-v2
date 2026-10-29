import Button from '../Button/Button'
import GoogleSignInButton from '../GoogleSignInButton/GoogleSignInButton'
import { useAuth } from '../../hooks/useAuth'
import { signOutUser } from '../../services/auth'

// Navbar auth section: Google sign-in when signed out; avatar +
// sign-out when signed in.
const AuthControls = () => {
  const { user, isLoading } = useAuth()

  // Reserve width during session restore to avoid layout shift.
  if (isLoading) return <div className="w-24" aria-hidden="true" />

  if (!user) return <GoogleSignInButton variant="secondary" size="sm" />

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
