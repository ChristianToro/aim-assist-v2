import { createRemoteJWKSet } from 'jose'
import { createVerifier } from './verifier.js'

export { AuthError } from './verifier.js'

const authBaseUrl = process.env.NEON_AUTH_BASE_URL.replace(/\/$/, '')

// Verifies Neon Auth JWTs. Built once per cold start: jose caches the
// fetched keys and refetches only when a token carries an unknown key id.
export const verifyRequest = createVerifier({
  keySet: createRemoteJWKSet(new URL(`${authBaseUrl}/.well-known/jwks.json`)),
  issuer: new URL(authBaseUrl).origin,
})
