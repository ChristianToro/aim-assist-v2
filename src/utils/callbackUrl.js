/*
 * The absolute URL Google sign-in returns to. Neon Auth resolves a relative
 * callback against its own origin, so `returnTo` (an app path such as
 * '/play') is made absolute against the current page. Without one, the
 * player comes back to the page they started on.
 */
export const callbackUrl = (returnTo, currentHref) =>
  new URL(returnTo ?? currentHref, currentHref).href
