// Small type guards shared by the request and response validators.

export const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const isIntegerIn = (value, min, max) =>
  Number.isInteger(value) && value >= min && value <= max

export const isNumberIn = (value, min, max) =>
  Number.isFinite(value) && value >= min && value <= max

export const isText = (value) =>
  typeof value === 'string' && value.trim() !== ''
