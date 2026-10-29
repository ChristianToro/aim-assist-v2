// Rolling-window limit arithmetic shared by the insight and match limits.

const MS_PER_SECOND = 1000

export const windowStart = (now, windowMs) => new Date(now.getTime() - windowMs)

// Whole seconds until the oldest entry in the window ages out, which
// frees the next slot. At least 1, for a Retry-After header.
export const retryAfterSeconds = (oldestAt, now, windowMs) =>
  Math.max(
    1,
    Math.ceil(
      (new Date(oldestAt).getTime() + windowMs - now.getTime()) / MS_PER_SECOND
    )
  )
