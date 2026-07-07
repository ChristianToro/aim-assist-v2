import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { recordMatchOnProfile } from './users'

// One document per finished match. displayName/photoURL are denormalized
// onto the score so leaderboards (Milestone 16) render without N user reads.
const saveScore = ({ user, mode, summary }) =>
  addDoc(collection(db, 'scores'), {
    uid: user.uid,
    displayName: user.displayName ?? 'Anonymous',
    photoURL: user.photoURL ?? null,
    mode,
    score: summary.score,
    accuracy: summary.accuracy,
    reactionTime: summary.averageReactionMs,
    createdAt: serverTimestamp(),
  })

// Persists a finished match: the score document plus profile aggregates.
export const saveMatchResult = async ({ user, mode, summary }) => {
  await Promise.all([
    saveScore({ user, mode, summary }),
    recordMatchOnProfile(user.uid, {
      score: summary.score,
      accuracy: summary.accuracy,
      mode,
    }),
  ])
}
