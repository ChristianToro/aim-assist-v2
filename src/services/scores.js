import { apiFetch } from './api'

// The POST /api/scores body: the match's ticket and its event log. The
// server computes the score from the log, so none is sent.
export const toScoreSubmission = (matchId, events) => ({ matchId, events })

// Saves a finished match; resolves to the stored { id, createdAt, score,
// accuracy, reactionTime }. Profile stats update with it on the server.
export const saveMatchResult = ({ matchId, events }) =>
  apiFetch('/api/scores', {
    method: 'POST',
    body: toScoreSubmission(matchId, events),
    auth: true,
  })
