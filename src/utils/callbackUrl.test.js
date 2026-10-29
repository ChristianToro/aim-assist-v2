import { describe, expect, it } from 'vitest'
import { callbackUrl } from './callbackUrl'

const HERE = 'https://aim-assist-v2.vercel.app/leaderboards?view=daily'

describe('callbackUrl', () => {
  it('returns to the current page by default', () => {
    expect(callbackUrl(undefined, HERE)).toBe(HERE)
  })

  it('makes an app path absolute on the current origin', () => {
    expect(callbackUrl('/play', HERE)).toBe(
      'https://aim-assist-v2.vercel.app/play'
    )
  })

  it('works on a local dev origin', () => {
    expect(callbackUrl('/play', 'http://localhost:3000/')).toBe(
      'http://localhost:3000/play'
    )
  })
})
