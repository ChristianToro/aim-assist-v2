// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest'
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose'
import { AuthError, createVerifier } from './verifier.js'

const ISSUER = 'https://auth.example.test'
const UID = '0b9c1f9e-3c1a-4e57-9a43-5f1d2c6b7e80'
const KEY_ID = 'test-key'

let signingKey
let verify

beforeAll(async () => {
  const { publicKey, privateKey } = await generateKeyPair('EdDSA')
  signingKey = privateKey
  const jwk = { ...(await exportJWK(publicKey)), kid: KEY_ID, alg: 'EdDSA' }
  verify = createVerifier({
    keySet: createLocalJWKSet({ keys: [jwk] }),
    issuer: ISSUER,
  })
})

const sign = ({
  claims = {},
  key = signingKey,
  alg = 'EdDSA',
  subject = UID,
  issuer = ISSUER,
  expiresIn = '15m',
} = {}) => {
  const jwt = new SignJWT(claims)
    .setProtectedHeader({ alg, kid: KEY_ID })
    .setIssuer(issuer)
    .setIssuedAt()
  if (subject) jwt.setSubject(subject)
  if (expiresIn) jwt.setExpirationTime(expiresIn)
  return jwt.sign(key)
}

const requestWith = (authorization) =>
  new Request('https://app.example.test/api/me', {
    headers: authorization ? { authorization } : {},
  })

const expectRejected = (request) =>
  expect(verify(request)).rejects.toBeInstanceOf(AuthError)

describe('createVerifier', () => {
  it('returns the uid from a valid token', async () => {
    const token = await sign()
    await expect(verify(requestWith(`Bearer ${token}`))).resolves.toEqual({
      uid: UID,
    })
  })

  it('rejects a request without an Authorization header', () =>
    expectRejected(requestWith()))

  it('rejects a non-Bearer scheme', async () =>
    expectRejected(requestWith(`Basic ${await sign()}`)))

  it('rejects a malformed token', () =>
    expectRejected(requestWith('Bearer not-a-jwt')))

  it('rejects a token from another issuer', async () =>
    expectRejected(
      requestWith(`Bearer ${await sign({ issuer: 'https://evil.test' })}`)
    ))

  it('rejects an expired token', async () =>
    expectRejected(requestWith(`Bearer ${await sign({ expiresIn: '-1m' })}`)))

  it('rejects a token without an expiry', async () =>
    expectRejected(requestWith(`Bearer ${await sign({ expiresIn: null })}`)))

  it('rejects a token without a subject', async () =>
    expectRejected(requestWith(`Bearer ${await sign({ subject: null })}`)))

  it('rejects a token signed by a different key', async () => {
    const { privateKey } = await generateKeyPair('EdDSA')
    await expectRejected(
      requestWith(`Bearer ${await sign({ key: privateKey })}`)
    )
  })

  it('rejects an HS256 token, whatever its secret', async () => {
    const secret = new TextEncoder().encode('a-shared-secret-of-32-bytes-long!')
    await expectRejected(
      requestWith(`Bearer ${await sign({ key: secret, alg: 'HS256' })}`)
    )
  })

  it('reports a 401 status on rejection', async () => {
    const error = await verify(requestWith()).catch((caught) => caught)
    expect(error.status).toBe(401)
  })
})
