import { describe, expect, it } from 'vitest'
import { toAppUser } from './authUser'

describe('toAppUser', () => {
  it('maps a Neon Auth user to the app user shape', () => {
    expect(
      toAppUser({
        id: '059699e6-bb7b-40b0-922e-ad9215dc41bf',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        image: 'https://example.com/ada.png',
      })
    ).toEqual({
      uid: '059699e6-bb7b-40b0-922e-ad9215dc41bf',
      displayName: 'Ada Lovelace',
      photoURL: 'https://example.com/ada.png',
    })
  })

  it('uses null for a missing name or image', () => {
    expect(toAppUser({ id: 'u1', name: '', image: undefined })).toEqual({
      uid: 'u1',
      displayName: null,
      photoURL: null,
    })
  })

  it('returns null when signed out', () => {
    expect(toAppUser(null)).toBeNull()
    expect(toAppUser(undefined)).toBeNull()
  })
})
