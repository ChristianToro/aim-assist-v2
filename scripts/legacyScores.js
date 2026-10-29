import { MIN_AVERAGE_REACTION_MS } from '../api/_lib/matchCheck.js'
import { modeByLabel } from '../api/_lib/matchPolicy.js'
import { maxPlausibleScore } from '../api/_lib/scoreBound.js'

/*
 * The checks a score saved before matches existed can still be held to.
 * It has no event log, only its figures, so these are the rules that
 * survive as bounds on those figures (PLAN-SCORING.md, "Legacy rows").
 */
const RULES = {
  // More than any passing log in the mode could earn (scoreBound.js).
  score: ({ mode, score }) => score <= maxPlausibleScore(modeByLabel(mode)),
  // The average reaction a log must reach (matchCheck.js's `reaction`).
  reaction: ({ reactionTime }) =>
    reactionTime === null || reactionTime >= MIN_AVERAGE_REACTION_MS,
  // A null reaction time means no hits, and so no points.
  noHits: ({ score, reactionTime }) => reactionTime !== null || score === 0,
}

// Every score without a match, with its player's name, best first.
// Takes a tagged-template `sql`, so a check can run it on PGlite.
export const legacyScoresQuery = (sql) => sql`
  select s.id, s.mode, s.score, s.accuracy,
         s.reaction_time as "reactionTime", s.created_at as "createdAt",
         u.name as player
  from scores s
  join neon_auth."user" u on u.id = s.user_id
  where s.match_id is null
  order by s.score desc`

// The names of the rules a legacy row fails; empty when it's plausible.
export const legacyScoreFailures = (row) =>
  Object.entries(RULES)
    .filter(([, isPlausible]) => !isPlausible(row))
    .map(([name]) => name)
