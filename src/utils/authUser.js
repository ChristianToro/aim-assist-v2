// Maps a Neon Auth (Better Auth) user onto the shape the app has used since
// v1 — { uid, displayName, photoURL } — so useAuth() consumers don't change.
export const toAppUser = (user) =>
  user
    ? {
        uid: user.id,
        displayName: user.name || null,
        photoURL: user.image ?? null,
      }
    : null
