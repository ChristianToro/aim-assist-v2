const UNAUTHORIZED = 401
const UNPROCESSABLE = 422
const TOO_MANY_REQUESTS = 429
const BAD_GATEWAY = 502
const SERVICE_UNAVAILABLE = 503

const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60

// "in 45 minutes", "in about 3 hours": the wait until a daily slot frees.
export const formatWait = (seconds) => {
  const minutes = Math.max(1, Math.ceil(seconds / SECONDS_PER_MINUTE))
  if (minutes < MINUTES_PER_HOUR) {
    return `in ${minutes} minute${minutes === 1 ? '' : 's'}`
  }
  const hours = Math.round(minutes / MINUTES_PER_HOUR)
  return `in about ${hours} hour${hours === 1 ? '' : 's'}`
}

const notEnoughMatches = ({ needed, played }) => {
  const remaining = needed - played
  return `Play ${remaining} more match${remaining === 1 ? '' : 'es'} first: recommendations need at least ${needed}.`
}

/*
 * What a failed insight request tells the player, from the ApiError's
 * status and details (insightRunner.js, insightRequest.js). A network
 * failure has no status and reads like an outage.
 */
export const insightErrorMessage = (error) => {
  switch (error?.status) {
    case UNAUTHORIZED:
      return 'Your session has expired. Sign in again to get recommendations.'
    case UNPROCESSABLE:
      return notEnoughMatches(error.details)
    case TOO_MANY_REQUESTS:
      return `You've used today's recommendations. Try again ${formatWait(error.details.retryAfterSeconds)}.`
    case BAD_GATEWAY:
      return "Claude couldn't produce a usable recommendation this time. Try again."
    case SERVICE_UNAVAILABLE:
    case undefined:
      return 'The recommendation service is unreachable right now. Try again in a moment.'
    default:
      return 'Something went wrong getting a recommendation. See the browser console for details.'
  }
}
