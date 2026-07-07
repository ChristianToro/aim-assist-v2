import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

const userRef = (uid) => doc(db, 'users', uid)

// Creates the user document on first sign-in; keeps identity fields
// fresh on subsequent sign-ins without touching stats.
export const ensureUserDocument = async (user) => {
  const identity = {
    displayName: user.displayName ?? 'Anonymous',
    photoURL: user.photoURL ?? null,
  }
  const snapshot = await getDoc(userRef(user.uid))
  if (snapshot.exists()) {
    await setDoc(userRef(user.uid), identity, { merge: true })
    return
  }
  await setDoc(userRef(user.uid), {
    ...identity,
    highestScore: 0,
    gamesPlayed: 0,
    averageAccuracy: 0,
    favoriteMode: '',
    modeCounts: {},
    createdAt: serverTimestamp(),
  })
}

export const getUserProfile = async (uid) => {
  const snapshot = await getDoc(userRef(uid))
  return snapshot.exists() ? { uid, ...snapshot.data() } : null
}

// Folds one finished match into the profile aggregates.
export const recordMatchOnProfile = async (uid, { score, accuracy, mode }) => {
  const snapshot = await getDoc(userRef(uid))
  const current = snapshot.exists() ? snapshot.data() : {}

  const gamesPlayed = (current.gamesPlayed ?? 0) + 1
  // Incremental running average — no need to re-read every score.
  const previousAverage = current.averageAccuracy ?? 0
  const averageAccuracy =
    previousAverage + (accuracy - previousAverage) / gamesPlayed

  const modeCounts = { ...(current.modeCounts ?? {}) }
  modeCounts[mode] = (modeCounts[mode] ?? 0) + 1
  const favoriteMode = Object.entries(modeCounts).reduce((best, entry) =>
    entry[1] > best[1] ? entry : best
  )[0]

  await setDoc(
    userRef(uid),
    {
      gamesPlayed,
      averageAccuracy,
      highestScore: Math.max(current.highestScore ?? 0, score),
      modeCounts,
      favoriteMode,
    },
    { merge: true }
  )
}
