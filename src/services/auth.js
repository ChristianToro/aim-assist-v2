import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters'
import { callbackUrl } from '../utils/callbackUrl'

// All Neon Auth access goes through this service — components and
// contexts never import the SDK directly (see CLAUDE.md, Ownership).

// The adapter is built directly rather than through the SDK's
// createAuthClient(): for this adapter, createAuthClient() returns only the
// Better Auth client, which has no getJWTToken() (checked in 0.7.0-beta).
const adapter = BetterAuthReactAdapter()(import.meta.env.VITE_NEON_AUTH_URL)
const authClient = adapter.getBetterAuthInstance()

/*
 * Full-page redirect to Google. Neon Auth sends the browser back to the
 * current page (or to `returnTo`, an app path) with a one-time session
 * verifier, which the SDK exchanges for the session in its first
 * getSession call; useSession stays pending until then, so a protected
 * page waits rather than redirecting.
 */
export const signInWithGoogle = async ({ returnTo } = {}) => {
  const { error } = await authClient.signIn.social({
    provider: 'google',
    callbackURL: callbackUrl(returnTo, globalThis.location.href),
  })
  if (error) throw error
}

export const signOutUser = () => authClient.signOut()

// React hook over the SDK's session store: { data, isPending, error }.
export const useAuthSession = authClient.useSession

// The session's JWT for `Authorization: Bearer` on /api calls, or null when
// signed out (anonymous tokens are disabled). The SDK caches the session,
// and with it the JWT, until shortly before the token expires.
const ALLOW_ANONYMOUS = false
export const getAuthToken = () => adapter.getJWTToken(ALLOW_ANONYMOUS)
