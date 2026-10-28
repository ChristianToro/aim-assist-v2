// The values /api/insights/hardware accepts (hardwareAdvice.js).
export const MIN_DPI = 100
export const MAX_DPI = 32_000
export const POLLING_RATES_HZ = [125, 250, 500, 1000, 2000, 4000, 8000]

/*
 * Turns the form's text fields into the request's `setup`. Blank fields
 * are left out (the player doesn't know or won't say). Returns { setup },
 * or { invalid: true } for a DPI that isn't a whole number in range.
 */
export const toSetup = ({ dpi, pollingRateHz }) => {
  const setup = {}

  if (dpi.trim() !== '') {
    const value = Number(dpi)
    const inRange =
      Number.isInteger(value) && value >= MIN_DPI && value <= MAX_DPI
    if (!inRange) return { invalid: true }
    setup.dpi = value
  }
  if (pollingRateHz !== '') setup.pollingRateHz = Number(pollingRateHz)

  return { setup }
}
