import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { getDayKey, getWeekKey } from '../utils/dates'

const TOP_LIMIT = 100
const PERSONAL_LIMIT = 10

const scoresRef = () => collection(db, 'scores')

const toEntries = (snapshot) =>
  snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data(),
  }))

/*
 * Top scores for a period: 'all' | 'daily' | 'weekly'.
 *
 * daily/weekly filter on the day/week keys written with each score.
 * Note: the filtered views need composite indexes (day+score, week+score);
 * on first run Firestore rejects the query with a one-click index-creation
 * link in the error message.
 */
export const getTopScores = async (period = 'all') => {
  const constraints = []
  if (period === 'daily') constraints.push(where('day', '==', getDayKey()))
  if (period === 'weekly') constraints.push(where('week', '==', getWeekKey()))
  constraints.push(orderBy('score', 'desc'), limit(TOP_LIMIT))
  return toEntries(await getDocs(query(scoresRef(), ...constraints)))
}

// A player's own best scores (needs the uid+score composite index).
export const getPersonalBestScores = async (uid) =>
  toEntries(
    await getDocs(
      query(
        scoresRef(),
        where('uid', '==', uid),
        orderBy('score', 'desc'),
        limit(PERSONAL_LIMIT)
      )
    )
  )
