import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { recordMatchOnProfile } from './users'
import { getDayKey, getWeekKey } from '../utils/dates'

// One document per finished match. displayName/photoURL are denormalized
// onto the score so leaderboards render without N user reads; day/week
// keys let the daily/weekly leaderboards equality-filter + sort by score.
const saveScore = ({ user, mode, summary }) =>
  addDoc(collection(db, 'scores'), {
    uid: user.uid,
    displayName: user.displayName ?? 'Anonymous',
    photoURL: user.photoURL ?? null,
    mode,
    score: summary.score,
    accuracy: summary.accuracy,
    reactionTime: summary.averageReactionMs,
    day: getDayKey(),
    week: getWeekKey(),
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
