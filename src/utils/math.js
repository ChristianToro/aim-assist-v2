export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)

// Linear interpolation from a to b by t (t clamped to [0, 1]).
export const lerp = (a, b, t) => a + (b - a) * clamp(t, 0, 1)
