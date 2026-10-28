import { describe, expect, it } from 'vitest'
import { toSetup } from './mouseSetup'

describe('toSetup', () => {
  it('leaves out blank fields', () => {
    expect(toSetup({ dpi: '', pollingRateHz: '' })).toEqual({ setup: {} })
    expect(toSetup({ dpi: '  ', pollingRateHz: '1000' })).toEqual({
      setup: { pollingRateHz: 1000 },
    })
  })

  it('converts both fields to numbers', () => {
    expect(toSetup({ dpi: '1600', pollingRateHz: '500' })).toEqual({
      setup: { dpi: 1600, pollingRateHz: 500 },
    })
  })

  it('accepts the DPI bounds', () => {
    expect(toSetup({ dpi: '100', pollingRateHz: '' }).setup.dpi).toBe(100)
    expect(toSetup({ dpi: '32000', pollingRateHz: '' }).setup.dpi).toBe(32_000)
  })

  it.each(['99', '32001', '800.5', 'fast', '-800'])(
    'rejects a DPI of %s',
    (dpi) => {
      expect(toSetup({ dpi, pollingRateHz: '' })).toEqual({ invalid: true })
    }
  )
})
