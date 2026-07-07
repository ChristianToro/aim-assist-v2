import Button from '../Button/Button'
import { useAuth } from '../../hooks/useAuth'
import {
  signInWithGoogle,
  signOutUser,
  isUserCancellation,
} from '../../services/auth'

// Navbar auth section: Google sign-in when signed out; avatar +
// sign-out when signed in (per CLAUDE.md, Google is the only provider).
const AuthControls = () => {
  const { user, isLoading } = useAuth()

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      if (!isUserCancellation(error)) console.error('Sign-in failed:', error)
    }
  }

  // Reserve width during session restore to avoid layout shift.
  if (isLoading) return <div className="w-24" aria-hidden="true" />

  if (!user) {
    return (
      <Button variant="secondary" size="sm" onClick={handleSignIn}>
        Continue with Google
      </Button>
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
