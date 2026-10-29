import Button from '../Button/Button'
import { signInWithGoogle } from '../../services/auth'

// The one Google sign-in control (CLAUDE.md: Google is the only provider).
// Takes Button's variant/size props; the label defaults to the usual text.
// `returnTo` is the app path to land on after sign-in (default: this page).
const GoogleSignInButton = ({
  children = 'Continue with Google',
  returnTo,
  ...props
}) => {
  const handleSignIn = async () => {
    // Success navigates away to Google, so only a failure returns here.
    try {
      await signInWithGoogle({ returnTo })
    } catch (error) {
      console.error('Sign-in failed:', error)
    }
  }

  return (
    <Button onClick={handleSignIn} {...props}>
      {children}
    </Button>
  )
}

export default GoogleSignInButton
