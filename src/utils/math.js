export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)
