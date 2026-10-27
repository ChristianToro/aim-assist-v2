import { errors, jwtVerify } from 'jose'

const UNAUTHORIZED = 401
const BEARER = /^Bearer (.+)$/

// Neon Auth signs with Ed25519. Pinning the algorithm stops a token from
// naming a different one (e.g. HS256) in its own header.
const ALGORITHMS = ['EdDSA']
const REQUIRED_CLAIMS = ['sub', 'exp']

export class AuthError extends Error {
  status = UNAUTHORIZED
}

const readBearerToken = (request) =>
  request.headers.get('authorization')?.match(BEARER)?.[1] ?? null

// jose reports bad tokens as JOSEErrors; a JWKS timeout is our outage, not
// the caller's fault, so it surfaces as a server error instead of a 401.
const isTokenError = (error) =>
  error instanceof errors.JOSEError && !(error instanceof errors.JWKSTimeout)

/*
 * Builds a request verifier for one token issuer. It resolves to the
 * caller's identity, taken only from the verified token's subject, or
 * throws AuthError. auth.js wires it to Neon Auth; tests pass local keys.
 */
export const createVerifier =
  ({ keySet, issuer }) =>
  async (request) => {
    const token = readBearerToken(request)
    if (!token) throw new AuthError('Missing bearer token')

    try {
      const { payload } = await jwtVerify(token, keySet, {
        issuer,
        algorithms: ALGORITHMS,
        requiredClaims: REQUIRED_CLAIMS,
      })
      return { uid: payload.sub }
    } catch (error) {
      if (isTokenError(error)) {
        throw new AuthError('Invalid or expired token', { cause: error })
      }
      throw error
    }
  }
